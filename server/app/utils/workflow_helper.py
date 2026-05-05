import os
import httpx
import logging
import json
import uuid
from fastapi import HTTPException
from typing import Optional
from datetime import datetime, timezone

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MU_API_KEY = os.getenv("MU_API_KEY")
LOCAL_STORE_PATH = Path(
    os.getenv("LOCAL_WORKFLOW_STORE", BASE_DIR / ".local_workflows.json")
)
PLACEHOLDER_API_KEYS = {"", "your_api_key_here", "your_actual_api_key_here"}
DEFAULT_WORKFLOW_NAME = "未命名工作流"
DEFAULT_WORKFLOW_CATEGORY = "通用"
WORKFLOW_NOT_FOUND_DETAIL = "未找到工作流"
MU_API_KEY_REQUIRED_DETAIL = "请先在 .env 中配置 MU_API_KEY，才能使用工作流服务"
PROXY_METHOD_NOT_SUPPORTED_DETAIL = "代理不支持该请求方法"
REMOTE_SERVER_ERROR_DETAIL = "连接远程服务失败"
INTERNAL_SERVER_ERROR_DETAIL = "服务器内部错误"
UNKNOWN_REMOTE_ERROR_DETAIL = "远程服务返回未知错误"
REMOTE_REQUEST_FAILED_DETAIL = "远程请求失败"
REQUEST_PROCESSING_FAILED_DETAIL = "请求处理失败，请稍后重试"
REMOTE_DETAIL_TRANSLATIONS = {
    "workflow not found": WORKFLOW_NOT_FOUND_DETAIL,
    "not found": "未找到请求的资源",
    "unauthorized": "认证失败，请检查 API Key",
    "forbidden": "无权访问该资源",
    "invalid api key": "API Key 无效，请检查配置",
    "missing api key": MU_API_KEY_REQUIRED_DETAIL,
    "rate limit exceeded": "请求过于频繁，请稍后重试",
    "too many requests": "请求过于频繁，请稍后重试",
    "internal server error": INTERNAL_SERVER_ERROR_DETAIL,
    "something went wrong": REMOTE_REQUEST_FAILED_DETAIL,
}


def use_local_workflow_store() -> bool:
    return (MU_API_KEY or "").strip() in PLACEHOLDER_API_KEYS


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_local_workflows() -> dict:
    if not LOCAL_STORE_PATH.exists():
        return {"workflows": {}}

    try:
        return json.loads(LOCAL_STORE_PATH.read_text())
    except json.JSONDecodeError:
        logger.warning("Local workflow store is invalid; starting with an empty store")
        return {"workflows": {}}


def write_local_workflows(store: dict) -> None:
    LOCAL_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOCAL_STORE_PATH.write_text(json.dumps(store, indent=2))


def has_cjk_text(value) -> bool:
    return any("\u4e00" <= char <= "\u9fff" for char in str(value))


def localize_remote_detail(detail):
    if not detail:
        return REMOTE_REQUEST_FAILED_DETAIL

    if has_cjk_text(detail):
        return detail

    if isinstance(detail, str):
        normalized = detail.strip().lower()
        if normalized in REMOTE_DETAIL_TRANSLATIONS:
            return REMOTE_DETAIL_TRANSLATIONS[normalized]

    return REMOTE_REQUEST_FAILED_DETAIL


def public_exception_detail(exc: Exception) -> str:
    logger.warning("User-facing request failed: %s", exc)
    return REQUEST_PROCESSING_FAILED_DETAIL


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
        "name": workflow.get("name", DEFAULT_WORKFLOW_NAME),
        "thumbnail": workflow.get("thumbnail"),
        "category": workflow.get("category", DEFAULT_WORKFLOW_CATEGORY),
        "created_at": workflow.get("created_at"),
        "updated_at": workflow.get("updated_at"),
    }


def local_schema_model(
    title: str,
    properties: Optional[dict] = None,
    required: Optional[list] = None,
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


def local_passthrough_schemas() -> dict:
    text_prompt = {
        "prompt": {
            "type": "string",
            "title": "提示词",
            "name": "prompt",
            "description": "工作流的文本输入。",
            "default": "",
        }
    }
    url_field = {
        "type": "string",
        "format": "uri",
        "default": "",
    }

    return {
        "categories": {
            "text": {
                "models": {
                    "text-passthrough": local_schema_model(
                        "输入文本", text_prompt, ["prompt"]
                    )
                }
            },
            "image": {
                "models": {
                    "image-passthrough": local_schema_model(
                        "输入图片",
                        {
                            "image_url": {
                                **url_field,
                                "title": "图片 URL",
                                "name": "image_url",
                                "description": "输入图片的 URL。",
                            }
                        },
                        ["image_url"],
                    )
                }
            },
            "video": {
                "models": {
                    "video-passthrough": local_schema_model(
                        "输入视频",
                        {
                            "video_url": {
                                **url_field,
                                "title": "视频 URL",
                                "name": "video_url",
                                "description": "输入视频的 URL。",
                            }
                        },
                        ["video_url"],
                    )
                }
            },
            "audio": {
                "models": {
                    "audio-passthrough": local_schema_model(
                        "输入音频",
                        {
                            "audio_url": {
                                **url_field,
                                "title": "音频 URL",
                                "name": "audio_url",
                                "description": "输入音频的 URL。",
                            }
                        },
                        ["audio_url"],
                    )
                }
            },
            "utility": {
                "models": {
                    "prompt-concatenator": local_schema_model(
                        "提示词拼接器", text_prompt, ["prompt"]
                    ),
                    "video-combiner": local_schema_model(
                        "视频合并器",
                        {
                            "videos_list": {
                                "type": "array",
                                "items": {"type": "string"},
                                "title": "视频片段",
                                "name": "videos_list",
                            },
                            "aspect_ratio": {
                                "type": "string",
                                "title": "宽高比",
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


async def create_or_update_local_workflow(payload: dict):
    store = read_local_workflows()
    workflows = store.setdefault("workflows", {})

    workflow_id = payload.get("workflow_id") or str(uuid.uuid4())
    existing = workflows.get(workflow_id, {})
    now = utc_now()

    workflows[workflow_id] = {
        **existing,
        "workflow_id": workflow_id,
        "name": payload.get("name") or existing.get("name") or DEFAULT_WORKFLOW_NAME,
        "edges": payload.get("edges", existing.get("edges", [])),
        "data": payload.get("data", existing.get("data", {"nodes": []})),
        "category": payload.get("category", existing.get("category", DEFAULT_WORKFLOW_CATEGORY)),
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
        raise HTTPException(status_code=404, detail=WORKFLOW_NOT_FOUND_DETAIL)
    return local_workflow_response(workflow_id, workflow)


async def delete_local_workflow_def(workflow_id: str):
    store = read_local_workflows()
    if workflow_id not in store.get("workflows", {}):
        raise HTTPException(status_code=404, detail=WORKFLOW_NOT_FOUND_DETAIL)
    del store["workflows"][workflow_id]
    write_local_workflows(store)
    return {"status": "deleted"}


async def update_local_workflow_name(workflow_id: str, payload: dict):
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail=WORKFLOW_NOT_FOUND_DETAIL)
    workflow["name"] = payload.get("name") or workflow.get("name", DEFAULT_WORKFLOW_NAME)
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"status": "updated"}


async def update_local_workflow_category(workflow_id: str, payload: dict):
    store = read_local_workflows()
    workflow = store.get("workflows", {}).get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail=WORKFLOW_NOT_FOUND_DETAIL)
    workflow["category"] = payload.get("category") or DEFAULT_WORKFLOW_CATEGORY
    workflow["updated_at"] = utc_now()
    write_local_workflows(store)
    return {"status": "updated"}

async def get_api_key():
    api_key = MU_API_KEY
    if not api_key or api_key.strip() in PLACEHOLDER_API_KEYS:
        raise HTTPException(status_code=400, detail=MU_API_KEY_REQUIRED_DETAIL)
    return api_key

async def proxy_request_helper(method: str, url: str, payload: Optional[dict] = None):
    api_key = await get_api_key()
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }

    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers, timeout=60.0)
            elif method.upper() == "POST":
                response = await client.post(url, json=payload, headers=headers, timeout=60.0)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers, timeout=60.0)
            else:
                raise HTTPException(status_code=405, detail=PROXY_METHOD_NOT_SUPPORTED_DETAIL)

        except httpx.RequestError as e:
            logger.error(f"HTTPExt Request Error for {method} {url}: {e}")
            raise HTTPException(status_code=500, detail=REMOTE_SERVER_ERROR_DETAIL)
        except Exception as e:
            logger.error(f"Unexpected error in proxy_request_helper for {method} {url}: {e}")
            raise HTTPException(status_code=500, detail=INTERNAL_SERVER_ERROR_DETAIL)

    try:
        if response.content:
            resp_json = response.json()
        else:
            resp_json = {}
    except ValueError:
        resp_json = {"detail": response.text or UNKNOWN_REMOTE_ERROR_DETAIL}

    if response.status_code == 200:
        return resp_json
    else:
        error_detail = resp_json.get("detail", REMOTE_REQUEST_FAILED_DETAIL)
        logger.warning(f"Remote server returned {response.status_code}: {error_detail}")
        raise HTTPException(
            status_code=response.status_code,
            detail=localize_remote_detail(error_detail),
        )

async def create_or_update_workflow(payload: dict):
    if use_local_workflow_store():
        return await create_or_update_local_workflow(payload)
    url = "https://api.muapi.ai/workflow/create"
    return await proxy_request_helper("POST", url, payload)

async def get_node_schemas_helper(workflow_id: str):
    if use_local_workflow_store():
        return local_passthrough_schemas()
    url = f"https://api.muapi.ai/workflow/{workflow_id}/node-schemas"
    return await proxy_request_helper("GET", url)

async def get_api_node_schemas_helper(workflow_id: str):
    if use_local_workflow_store():
        return {"api_node_schemas": {}}
    url = f"https://api.muapi.ai/workflow/{workflow_id}/api-node-schemas"
    return await proxy_request_helper("GET", url)

async def get_workflow_def_helper(workflow_id: str):
    if use_local_workflow_store():
        return await get_local_workflow_def(workflow_id)
    url = f"https://api.muapi.ai/workflow/get-workflow-def/{workflow_id}"
    return await proxy_request_helper("GET", url)

async def get_workflow_defs_helper():
    if use_local_workflow_store():
        return await get_local_workflow_defs()
    url = "https://api.muapi.ai/workflow/get-workflow-defs"
    return await proxy_request_helper("GET", url)

async def delete_workflow_def_by_id(workflow_id: str):
    if use_local_workflow_store():
        return await delete_local_workflow_def(workflow_id)
    url = f"https://api.muapi.ai/workflow/delete-workflow-def/{workflow_id}"
    return await proxy_request_helper("DELETE", url)

async def update_workflow_name_helper(workflow_id: str, payload: dict):
    if use_local_workflow_store():
        return await update_local_workflow_name(workflow_id, payload)
    url = f"https://api.muapi.ai/workflow/update-name/{workflow_id}"
    return await proxy_request_helper("POST", url, payload)

async def run_workflow_helper(workflow_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/{workflow_id}/run"
    return await proxy_request_helper("POST", url, payload)

async def get_run_status_helper(run_id: str):
    url = f"https://api.muapi.ai/workflow/run/{run_id}/status"
    return await proxy_request_helper("GET", url)

async def run_node_helper(workflow_id: str, node_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/{workflow_id}/node/{node_id}/run"
    return await proxy_request_helper("POST", url, payload)

async def publish_workflow_helper(workflow_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/workflow/{workflow_id}/publish"
    return await proxy_request_helper("POST", url, payload)

async def template_workflow_helper(workflow_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/workflow/{workflow_id}/template"
    return await proxy_request_helper("POST", url, payload)

async def cloudfront_signed_url_helper(payload: dict):
    url = "https://api.muapi.ai/workflow/cloudfront-signed-url"
    return await proxy_request_helper("POST", url, payload)

async def generate_thumbnail_helper(workflow_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/{workflow_id}/thumbnail"
    return await proxy_request_helper("POST", url, payload)

async def get_file_upload_url_helper(params: dict):
    import urllib.parse
    query_string = urllib.parse.urlencode(params)
    url = f"https://api.muapi.ai/app/get_file_upload_url?{query_string}"
    return await proxy_request_helper("GET", url)

async def calculate_dynamic_cost_helper(payload: dict):
    if use_local_workflow_store():
        return {"cost": 0}
    url = "https://api.muapi.ai/app/calculate_dynamic_cost"
    return await proxy_request_helper("POST", url, payload)

async def get_workflow_last_run(workflow_id: str):
    url = f"https://api.muapi.ai/workflow/get-workflow-last-run/{workflow_id}"
    return await proxy_request_helper("GET", url)

async def architect_workflow_helper(payload: dict):
    url = "https://api.muapi.ai/workflow/architect"
    return await proxy_request_helper("POST", url, payload)

async def poll_architect_result_helper(id: str):
    url = f"https://api.muapi.ai/workflow/poll-architect/{id}/result"
    return await proxy_request_helper("GET", url)

async def delete_node_run_by_id_helper(node_run_id: str):
    url = f"https://api.muapi.ai/workflow/node-run/{node_run_id}"
    return await proxy_request_helper("DELETE", url)

async def update_workflow_category_helper(workflow_id: str, payload: dict):
    if use_local_workflow_store():
        return await update_local_workflow_category(workflow_id, payload)
    url = f"https://api.muapi.ai/workflow/update-category/{workflow_id}"
    return await proxy_request_helper("POST", url, payload)

async def get_workflow_api_inputs_helper(workflow_id: str):
    url = f"https://api.muapi.ai/workflow/{workflow_id}/api-inputs"
    return await proxy_request_helper("GET", url)

async def execute_workflow_via_api_helper(workflow_id: str, payload: dict):
    url = f"https://api.muapi.ai/workflow/{workflow_id}/api-execute"
    return await proxy_request_helper("POST", url, payload)

async def get_workflow_api_outputs_helper(run_id: str):
    url = f"https://api.muapi.ai/workflow/run/{run_id}/api-outputs"
    return await proxy_request_helper("GET", url)
