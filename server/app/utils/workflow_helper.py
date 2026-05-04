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
            "title": "Prompt",
            "name": "prompt",
            "description": "Text input for the workflow.",
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
                        "Input Text", text_prompt, ["prompt"]
                    )
                }
            },
            "image": {
                "models": {
                    "image-passthrough": local_schema_model(
                        "Input Image",
                        {
                            "image_url": {
                                **url_field,
                                "title": "Image URL",
                                "name": "image_url",
                                "description": "URL of the input image.",
                            }
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
                            "video_url": {
                                **url_field,
                                "title": "Video URL",
                                "name": "video_url",
                                "description": "URL of the input video.",
                            }
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
                            "audio_url": {
                                **url_field,
                                "title": "Audio URL",
                                "name": "audio_url",
                                "description": "URL of the input audio.",
                            }
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

async def get_api_key():
    api_key = MU_API_KEY
    if not api_key or api_key.strip() in PLACEHOLDER_API_KEYS:
        raise HTTPException(status_code=400, detail="Setup MU_API_KEY in .env to be able to use Workflow")
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
                raise HTTPException(status_code=405, detail=f"Method {method} not supported in proxy")

        except httpx.RequestError as e:
            logger.error(f"HTTPExt Request Error for {method} {url}: {e}")
            raise HTTPException(status_code=500, detail=f"Error contacting remote server: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in proxy_request_helper for {method} {url}: {e}")
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

    try:
        if response.content:
            resp_json = response.json()
        else:
            resp_json = {}
    except ValueError:
        resp_json = {"detail": response.text or "Unknown error from remote server"}

    if response.status_code == 200:
        return resp_json
    else:
        error_detail = resp_json.get("detail", "Something went wrong")
        logger.warning(f"Remote server returned {response.status_code}: {error_detail}")
        raise HTTPException(status_code=response.status_code, detail=error_detail)

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
