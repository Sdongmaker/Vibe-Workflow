from __future__ import annotations

from typing import Any

from app.providers.base import BaseProvider


class LocalProvider(BaseProvider):
    def __init__(self, settings):
        super().__init__(settings=settings, kind="local")

    def capabilities(self) -> dict[str, bool]:
        return {
            "text": True,
            "image": True,
            "video": True,
            "audio": True,
            "utility": True,
            "assets": True,
            "workflow": True,
        }

    def node_schemas(self) -> dict[str, Any]:
        from app.utils.workflow_helper import local_passthrough_schemas

        return local_passthrough_schemas()

    async def list_models(self) -> dict[str, Any]:
        return {"data": []}

    async def chat_completions(self, payload: dict[str, Any], stream: bool = False):
        raise RuntimeError("Local provider does not proxy OpenAI requests")

    async def responses(self, payload: dict[str, Any], stream: bool = False):
        raise RuntimeError("Local provider does not proxy OpenAI requests")

    async def image_generation(self, payload: dict[str, Any]):
        raise RuntimeError("Local provider does not proxy OpenAI requests")

    async def upload_asset(self, filename: str, content: bytes, content_type: str | None):
        from app.services.media_store import save_media_file

        return save_media_file(self.settings, filename, content, content_type)
