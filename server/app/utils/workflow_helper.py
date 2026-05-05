from __future__ import annotations

import json
import logging
import re
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import HTTPException, UploadFile

from app.providers.factory import get_provider
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.settings import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def active_provider():
    return get_provider()


def local_store_path() -> Path:
    return get_settings().local_workflow_store


def use_local_workflow_store() -> bool:
    return True


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_local_workflows() -> dict:
    path = local_store_path()
    if not path.exists():
        return {"workflows": {}, "runs": {}}

    try:
        store = json.loads(path.read_text())
    except json.JSONDecodeError:
        logger.warning("Local workflow store is invalid; starting with an empty store")
        return {"workflows": {}, "runs": {}}

    store.setdefault("workflows", {})
    store.setdefault("runs", {})
    return store


def write_local_workflows(store: dict) -> None:
    path = local_store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(store, indent=2))


def local_workflow_response(workflow_id: str, workflow: dict) -> dict:
    return {
        **workflow,
        "id": workflow_id,
        "workflow_id": workflow_id,
        "run_id": workflow.get("run_id"),
        "is_owner": True,
        "is_published": workflow.get("is_published", False),
        "is_template": workflow.get("is_template", False),
        "show_temp_button": workflow.get("show_temp_button", False),
        "run_history": workflow.get("run_history", {}),
    }


def local_workflow_list_item(workflow_id: str, workflow: dict) -> dict:
    return {
        "id": workflow_id,
        "workflow_id": workflow_id,
        "name": workflow.get("name", "Untitled Workflow"),
        "thumbnail": workflow.get("thumbnail"),
        "category": workflow.get("category", "General"),
        "created_at": workflow.get("created_at"),
        "updated_at": workflow.get("updated_at"),
    }


def local_schema_model(
    title: str,
    properties: dict | None = None,
    required: list | None = None,
) -> dict:
    input_schema = {
        "schemas": {
            "input_data": {
                "type": "object",
                "title": title,
                "properties": properties or {},
                "required": required or [],
            }
        }
    }
    return {"input_schema": input_schema}


def _text_prompt_schema() -> dict:
    return {
        "prompt": {
            "type": "string",
            "title": "Prompt",
            "name": "prompt",
            "description": "Text input for the workflow.",
            "default": "",
        }
    }


def _url_field(title: str, name: str, description: str) -> dict:
    return {
        "type": "string",
        "format": "uri",
        "title": title,
        "name": name,
        "description": description,
        "default": "",
    }


def local_passthrough_schemas() -> dict:
    text_prompt = _text_prompt_schema()

    return {
        "categories": {
            "text": {
                "models": {
                    "text-passthrough": local_schema_model(
                        "Input Text", text_prompt, ["prompt"]
                    )
                }
            },
            "image": {
                "models": {
                    "image-passthrough": local_schema_model(
                        "Input Image",
                        {
                            "image_url": _url_field(
                                "Image URL", "image_url", "URL of the input image."
                            )
                        },
                        ["image_url"],
                    )
                }
            },
            "video": {
                "models": {
                    "video-passthrough": local_schema_model(
                        "Input Video",
                        {
                            "video_url": _url_field(
                                "Video URL", "video_url", "URL of the input video."
                            )
                        },
                        ["video_url"],
                    )
                }
            },
            "audio": {
                "models": {
                    "audio-passthrough": local_schema_model(
                        "Input Audio",
                        {
                            "audio_url": _url_field(
                                "Audio URL", "audio_url", "URL of the input audio."
                            )
                        },
                        ["audio_url"],
                    )
                }
            },
            "utility": {
                "models": {
                    "prompt-concatenator": local_schema_model(
                        "Prompt Concatenator", text_prompt, ["prompt"]
                    ),
                    "video-combiner": local_schema_model(
                        "Video Combiner",
                        {
                            "videos_list": {
                                "type": "array",
                                "items": {"type": "string"},
                                "title": "Video Clips",
                                "name": "videos_list",
                            },
                            "aspect_ratio": {
                                "type": "string",
                                "title": "Aspect Ratio",
                                "name": "aspect_ratio",
                                "default": "auto",
                            },
                        },
                        ["videos_list"],
                    ),
                }
            },
            "api": {"models": {}},
        }
    }


def _filter_categories_by_capabilities(schemas: dict, provider) -> dict:
    filtered = deepcopy(schemas)
    categories = filtered.get("categories", {})
    for category in list(categories.keys()):
        if not provider.capability(category):
            categories.pop(category, None)
    utility_models = categories.get("utility", {}).get("models", {})
    if not provider.capability("video"):
        utility_models.pop("video-combiner", None)
    filtered["categories"] = categories
    return filtered


def openai_node_schemas() -> dict:
    settings = get_settings()
    schemas = local_passthrough_schemas()
    schemas["categories"]["text"]["models"]["openai-chat"] = local_schema_model(
        "OpenAI-compatible Chat",
        {
            "prompt": {
                "type": "string",
                "title": "Prompt",
                "name": "prompt",
                "description": "User message for the configured OpenAI-compatible model.",
                "default": "",
            },
            "system_prompt": {
                "type": "string",
                "title": "System Prompt",
                "name": "system_prompt",
                "description": "Optional system instruction.",
                "default": "",
            },
            "model": {
                "type": "string",
                "title": "Model",
                "name": "model",
                "description": "Model ID. Leave empty to use OPENAI_MODEL.",
                "default": settings.openai_model,
            },
            "temperature": {
                "type": "number",
                "title": "Temperature",
                "name": "temperature",
                "default": 0.7,
            },
        },
        ["prompt"],
    )
    return schemas


def provider_node_schemas() -> dict:
    provider = active_provider()
    if provider.kind == "openai-compatible":
        return _filter_categories_by_capabilities(openai_node_schemas(), provider)
    return _filter_categories_by_capabilities(
        provider.node_schemas() or local_passthrough_schemas(),
        provider,
    )


async def create_or_update_local_workflow(payload: dict):
    store = read_local_workflows()
    workflows = store.setdefault("workflows", {})

    workflow_id = payload.get("workflow_id") or str(uuid.uuid4())
    existing = workflows.get(workflow_id, {})
    now = utc_now()

    workflows[workflow_id] = {
        **existing,
        "workflow_id": workflow_id,
        "name": payload.get("name") or existing.get("name") or "Untitled Workflow",
        "edges": payload.get("edges", existing.get("edges", [])),
        "data": payload.get("data", existing.get("data", {"nodes": []})),
        "category": payload.get("category", existing.get("category", "General")),
        "thumbnail": existing.get("thumbnail"),
        "created_at": existing.get("created_at", now),
        "updated_at": now,
        "run_id": existing.get("run_id"),
        "is_published": existing.get("is_published", False),
        "is_template": existing.get("is_template", False),
        "show_temp_button": existing.get("show_temp_button", False),
        "run_history": existing.get("run_history", {}),
    }

    write_local_workflows(store)
    return {"workflow_id": workflow_id}


async def get_local_workflow_defs():
    store = read_local_workflows()
    workflows = store.get("workflows", {})
    return sorted(
        [
            local_workflow_list_item(workflow_id, workflow)
            for workflow_id, workflow in workflows.items()
        ],
        key=lambda item: item.get("updated_at") or "",
        reverse=True,
    )


async def get_local_workflow_def(workflow_id: str):
    workflow = read_local_workflows().get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return local_workflow_response(workflow_id, workflow)


async def delete_local_workflow_def(workflow_id: str):
    store = read_local_workflows()
    if workflow_id not in store.get("workflows", {}):
        raise HTTPException(status_code=404, detail="Workflow not found")
    del store["workflows"][workflow_id]
    write_local_workflows(store)
    return {"status": "deleted"}


async def update_local_workflow_name(workflow_id: str, payload: dict):
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow["name"] = payload.get("name") or workflow.get("name", "Untitled Workflow")
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"status": "updated"}


async def update_local_workflow_category(workflow_id: str, payload: dict):
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow["category"] = payload.get("category") or "General"
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"status": "updated"}


def _node_run_entry(node_id: str, output_type: str, value: str) -> dict[str, Any]:
    result_id = f"result-{uuid.uuid4().hex}"
    return {
        "id": f"node-run-{uuid.uuid4().hex}",
        "node_id": node_id,
        "status": "succeeded",
        "started_at": utc_now(),
        "completed_at": utc_now(),
        "result": {
            "id": result_id,
            "outputs": [
                {
                    "type": output_type,
                    "value": value,
                }
            ],
        },
    }


def _resolve_template(value: Any, results: dict[str, dict]) -> Any:
    if isinstance(value, list):
        return [_resolve_template(item, results) for item in value]
    if not isinstance(value, str):
        return value

    pattern = r"\{\{\s*([^.{}\s]+)\.outputs\[0\]\.value\s*\}\}"

    def replace(match):
        node_id = match.group(1)
        return (
            results.get(node_id, {})
            .get("result", {})
            .get("outputs", [{}])[0]
            .get("value", "")
        )

    return re.sub(pattern, replace, value)


def _prompt_from_params(params: dict[str, Any]) -> str:
    prompt = params.get("prompt") or params.get("text") or ""
    if isinstance(prompt, list):
        return " ".join(str(item) for item in prompt)
    return str(prompt)


async def _run_openai_text_node(node_id: str, params: dict[str, Any]) -> dict[str, Any]:
    provider = active_provider()
    prompt = _prompt_from_params(params)
    model = params.get("model") or "gpt-4o-mini"
    messages = []
    if params.get("system_prompt"):
        messages.append({"role": "system", "content": params["system_prompt"]})
    messages.append({"role": "user", "content": prompt})

    if isinstance(provider, OpenAICompatibleProvider):
        response = await provider.chat_completions(
            {
                "model": model,
                "messages": messages,
                "temperature": params.get("temperature", 0.7),
            }
        )
        value = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
    else:
        value = prompt

    return _node_run_entry(node_id, "text", value)


async def _execute_local_node(node: dict, results: dict[str, dict]) -> dict[str, Any]:
    node_id = node.get("id") or f"node-{uuid.uuid4().hex}"
    category = node.get("category")
    model = node.get("model")
    raw_params = node.get("params") or node.get("input_params") or {}
    params = _resolve_template(raw_params, results)

    if model == "prompt-concatenator":
        return _node_run_entry(node_id, "text", _prompt_from_params(params))
    if category == "text" and model == "openai-chat":
        return await _run_openai_text_node(node_id, params)
    if category == "text":
        return _node_run_entry(node_id, "text", _prompt_from_params(params))
    if category == "image":
        return _node_run_entry(node_id, "image_url", params.get("image_url") or "")
    if category == "video":
        return _node_run_entry(node_id, "video_url", params.get("video_url") or "")
    if category == "audio":
        return _node_run_entry(node_id, "audio_url", params.get("audio_url") or "")
    return _node_run_entry(node_id, "text", _prompt_from_params(params))


async def run_local_workflow(workflow_id: str) -> dict:
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run_id = f"run-{uuid.uuid4().hex}"
    nodes = workflow.get("data", {}).get("nodes", [])
    results: dict[str, dict] = {}

    for node in nodes:
        result = await _execute_local_node(node, results)
        results[node["id"]] = result

    store.setdefault("runs", {})[run_id] = {"run_id": run_id, "nodes": results}
    workflow["run_id"] = run_id
    workflow["run_history"] = {
        node_id: [run_entry] for node_id, run_entry in results.items()
    }
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"run_id": run_id}


async def run_local_node(workflow_id: str, node_id: str, payload: dict) -> dict:
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    run_id = payload.get("run_id") or f"run-{uuid.uuid4().hex}"
    node = {
        "id": node_id,
        "category": _category_from_model(payload.get("model")),
        "model": payload.get("model"),
        "params": payload.get("params") or {},
    }
    result = await _execute_local_node(node, {})

    runs = store.setdefault("runs", {})
    run = runs.setdefault(run_id, {"run_id": run_id, "nodes": {}})
    run.setdefault("nodes", {})[node_id] = result
    workflow.setdefault("run_history", {}).setdefault(node_id, []).append(result)
    workflow["run_id"] = run_id
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"run_id": run_id}


def _category_from_model(model: str | None) -> str:
    if not model:
        return "text"
    if model.startswith("image-"):
        return "image"
    if model.startswith("video-"):
        return "video"
    if model.startswith("audio-"):
        return "audio"
    return "text"


async def create_or_update_workflow(payload: dict):
    return await create_or_update_local_workflow(payload)


async def get_node_schemas_helper(workflow_id: str):
    return provider_node_schemas()


async def get_api_node_schemas_helper(workflow_id: str):
    return active_provider().api_node_schemas(workflow_id)


async def get_workflow_def_helper(workflow_id: str):
    return await get_local_workflow_def(workflow_id)


async def get_workflow_defs_helper():
    return await get_local_workflow_defs()


async def delete_workflow_def_by_id(workflow_id: str):
    return await delete_local_workflow_def(workflow_id)


async def update_workflow_name_helper(workflow_id: str, payload: dict):
    return await update_local_workflow_name(workflow_id, payload)


async def run_workflow_helper(workflow_id: str, payload: dict):
    return await run_local_workflow(workflow_id)


async def get_run_status_helper(run_id: str):
    run = read_local_workflows().get("runs", {}).get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return {"run_id": run_id, "nodes": {k: [v] for k, v in run.get("nodes", {}).items()}}


async def run_node_helper(workflow_id: str, node_id: str, payload: dict):
    return await run_local_node(workflow_id, node_id, payload)


async def publish_workflow_helper(workflow_id: str, payload: dict):
    return {"publish": bool(payload.get("publish"))}


async def template_workflow_helper(workflow_id: str, payload: dict):
    return {"is_template": bool(payload.get("is_template"))}


async def cloudfront_signed_url_helper(payload: dict):
    return {"signed_url": payload.get("url")}


async def generate_thumbnail_helper(workflow_id: str, payload: dict):
    return {"thumbnail": payload.get("thumbnail") or payload.get("url")}


async def save_uploaded_file_helper(file: UploadFile):
    content = await file.read()
    return await active_provider().upload_asset(
        file.filename or "upload.bin", content, file.content_type
    )


async def get_file_upload_url_helper(params: dict):
    filename = params.get("filename") or "upload.bin"
    return {
        "upload_url": "/api/app/upload_file",
        "method": "POST",
        "field": "file",
        "url": "/api/app/upload_file",
        "fields": {"key": filename},
    }


async def calculate_dynamic_cost_helper(payload: dict):
    return {"cost": None}


async def get_workflow_last_run(workflow_id: str):
    workflow = await get_local_workflow_def(workflow_id)
    run_id = workflow.get("run_id")
    return {"run_id": run_id, "nodes": workflow.get("run_history", {})}


async def architect_workflow_helper(payload: dict):
    return {"request_id": f"architect-{uuid.uuid4().hex}", "status": "completed"}


async def poll_architect_result_helper(id: str):
    return {"status": "completed", "message": "", "suggestions": [], "workflow": None}


async def delete_node_run_by_id_helper(node_run_id: str):
    return {"status": "deleted"}


async def update_workflow_category_helper(workflow_id: str, payload: dict):
    return await update_local_workflow_category(workflow_id, payload)


async def get_workflow_api_inputs_helper(workflow_id: str):
    return {"inputs": []}


async def execute_workflow_via_api_helper(workflow_id: str, payload: dict):
    return await run_local_workflow(workflow_id)


async def get_workflow_api_outputs_helper(run_id: str):
    return await get_run_status_helper(run_id)
