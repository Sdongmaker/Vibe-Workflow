from __future__ import annotations

import json

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.providers.factory import get_provider

router = APIRouter()


def _openai_error(detail: str, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "message": detail,
                "type": "invalid_request_error" if status_code < 500 else "server_error",
                "param": None,
                "code": None,
            }
        },
    )


def _normalize_openai_error(exc: Exception):
    detail = getattr(exc, "args", [str(exc)])[0]
    if isinstance(detail, dict):
        return JSONResponse(status_code=400, content=detail)
    return _openai_error(str(detail), 400)


def _chunk_to_bytes(chunk) -> bytes:
    if isinstance(chunk, bytes):
        return chunk
    if isinstance(chunk, str):
        return chunk.encode()
    return json.dumps(chunk).encode()


async def _maybe_stream(result, should_stream: bool):
    if not should_stream:
        return result

    if isinstance(result, (bytes, str)):
        first_chunk = result
        iterator = None
    elif hasattr(result, "__aiter__"):
        iterator = result.__aiter__()
        try:
            first_chunk = await iterator.__anext__()
        except StopAsyncIteration:
            first_chunk = b""
    else:
        first_chunk = result
        iterator = None

    async def wrapped_stream():
        if first_chunk:
            yield _chunk_to_bytes(first_chunk)
        if iterator is not None:
            async for chunk in iterator:
                yield _chunk_to_bytes(chunk)

    return StreamingResponse(wrapped_stream(), media_type="text/event-stream")


@router.get("/models")
async def list_models():
    try:
        provider = get_provider()
        return await provider.list_models()
    except Exception as exc:
        return _normalize_openai_error(exc)


@router.post("/chat/completions")
async def create_chat_completion(request: Request):
    payload = await request.json()
    try:
        provider = get_provider()
        result = await provider.chat_completions(payload, stream=bool(payload.get("stream")))
        return await _maybe_stream(result, bool(payload.get("stream")))
    except Exception as exc:
        return _normalize_openai_error(exc)


@router.post("/responses")
async def create_response(request: Request):
    payload = await request.json()
    try:
        provider = get_provider()
        result = await provider.responses(payload, stream=bool(payload.get("stream")))
        return await _maybe_stream(result, bool(payload.get("stream")))
    except Exception as exc:
        return _normalize_openai_error(exc)
