from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.settings import AppSettings


@dataclass
class BaseProvider:
    settings: AppSettings
    kind: str

    @property
    def base_url(self) -> str | None:
        return None

    @property
    def api_key(self) -> str | None:
        return None

    def capabilities(self) -> dict[str, bool]:
        return {}

    def capability(self, name: str) -> bool:
        normalized = name.strip().lower()
        return bool(self.capabilities().get(normalized, False))

    def node_schemas(self) -> dict[str, Any]:
        return {}

    def api_node_schemas(self, workflow_id: str) -> dict[str, Any]:
        return {"api_node_schemas": {}}

    async def list_models(self) -> dict[str, Any]:
        raise NotImplementedError

    async def chat_completions(self, payload: dict[str, Any], stream: bool = False):
        raise NotImplementedError

    async def responses(self, payload: dict[str, Any], stream: bool = False):
        raise NotImplementedError

    async def image_generation(self, payload: dict[str, Any]):
        raise NotImplementedError

    async def upload_asset(self, filename: str, content: bytes, content_type: str | None):
        raise NotImplementedError
