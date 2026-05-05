from __future__ import annotations

from typing import Any

import httpx

from app.providers.base import BaseProvider
from app.services.media_store import save_media_file
from app.settings import normalize_openai_base_url


class OpenAICompatibleProvider(BaseProvider):
    def __init__(self, settings):
        super().__init__(settings=settings, kind="openai-compatible")
        self._base_url = normalize_openai_base_url(settings.openai_base_url) or "https://api.openai.com"

    @property
    def base_url(self) -> str:
        return self._base_url

    @property
    def api_key(self) -> str | None:
        return self.settings.openai_api_key

    def capabilities(self) -> dict[str, bool]:
        base = {
            "text": True,
            "utility": True,
            "assets": True,
            "workflow": True,
        }
        base.update(self.settings.capability_overrides)
        return base

    async def _proxy_openai_json(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
    ):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key or ''}",
        }
        url = f"{self.base_url.rstrip('/')}{path}"
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.request(
                    method, url, json=payload, headers=headers
                )
                response.raise_for_status()
                if response.content:
                    return response.json()
                return {}
            except httpx.HTTPStatusError as exc:
                response = exc.response
                detail = None
                try:
                    detail = response.json()
                except Exception:
                    detail = {"error": {"message": response.text}}
                raise RuntimeError(detail)
            except httpx.RequestError as exc:
                raise RuntimeError(str(exc))

    async def _proxy_openai_stream(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
    ):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key or ''}",
        }
        url = f"{self.base_url.rstrip('/')}{path}"

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                async with client.stream(
                    method, url, json=payload, headers=headers
                ) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except httpx.HTTPStatusError as exc:
                response = exc.response
                try:
                    detail = response.json()
                except Exception:
                    detail = {"error": {"message": response.text}}
                raise RuntimeError(detail)
            except httpx.RequestError as exc:
                raise RuntimeError(str(exc))

    async def list_models(self) -> dict[str, Any]:
        return await self._proxy_openai_json("GET", "/v1/models")

    async def chat_completions(self, payload: dict[str, Any], stream: bool = False):
        if stream:
            return self._proxy_openai_stream("POST", "/v1/chat/completions", payload)
        return await self._proxy_openai_json("POST", "/v1/chat/completions", payload)

    async def responses(self, payload: dict[str, Any], stream: bool = False):
        if stream:
            return self._proxy_openai_stream("POST", "/v1/responses", payload)
        return await self._proxy_openai_json("POST", "/v1/responses", payload)

    async def image_generation(self, payload: dict[str, Any]):
        return await self._proxy_openai_json("POST", "/v1/images/generations", payload)

    async def upload_asset(self, filename: str, content: bytes, content_type: str | None):
        return save_media_file(self.settings, filename, content, content_type)
