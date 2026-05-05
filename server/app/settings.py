from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_CLIENT_ORIGIN = "http://localhost:3000"
DEFAULT_MEDIA_BASE_URL = "/media"
DEFAULT_MEDIA_STORAGE_DIR = PROJECT_ROOT / "media"
DEFAULT_LOCAL_WORKFLOW_STORE = PROJECT_ROOT / ".local_workflows.json"
PLACEHOLDER_API_KEYS = {"", "your_api_key_here", "your_actual_api_key_here"}
SUPPORTED_PROVIDERS = {"openai-compatible", "local"}


def _strip_trailing_slash(value: str) -> str:
    return value.rstrip("/")


def normalize_openai_base_url(value: str | None) -> str | None:
    if not value:
        return None
    normalized = _strip_trailing_slash(value.strip())
    if normalized.endswith("/v1"):
        normalized = normalized[:-3]
    return normalized


def _parse_capabilities(raw: str | None) -> dict[str, bool]:
    if not raw:
        return {}

    value = raw.strip()
    if not value:
        return {}

    try:
        parsed = json.loads(value)
        if isinstance(parsed, dict):
            return {str(key): bool(flag) for key, flag in parsed.items()}
    except json.JSONDecodeError:
        pass

    return {
        item.strip().lower(): True
        for item in value.split(",")
        if item.strip()
    }


@dataclass(frozen=True)
class AppSettings:
    ai_provider: str
    openai_base_url: str | None
    openai_api_key: str | None
    openai_model: str
    client_origin: str
    media_base_url: str
    media_storage_dir: Path
    local_workflow_store: Path
    capability_overrides: dict[str, bool]

    @property
    def uses_placeholder_openai_key(self) -> bool:
        return (self.openai_api_key or "").strip() in PLACEHOLDER_API_KEYS


def get_settings() -> AppSettings:
    ai_provider = os.getenv("AI_PROVIDER", "").strip().lower()
    openai_base_url = normalize_openai_base_url(os.getenv("OPENAI_BASE_URL"))
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL).strip() or DEFAULT_OPENAI_MODEL
    client_origin = os.getenv("CLIENT_ORIGIN", DEFAULT_CLIENT_ORIGIN)
    media_base_url = _strip_trailing_slash(
        os.getenv("MEDIA_BASE_URL", DEFAULT_MEDIA_BASE_URL)
    )
    media_storage_dir = Path(
        os.getenv("MEDIA_STORAGE_DIR", str(DEFAULT_MEDIA_STORAGE_DIR))
    )
    local_workflow_store = Path(
        os.getenv("LOCAL_WORKFLOW_STORE", str(DEFAULT_LOCAL_WORKFLOW_STORE))
    )
    capability_overrides = _parse_capabilities(os.getenv("AI_CAPABILITIES"))

    if not ai_provider:
        if openai_base_url and openai_api_key and openai_api_key.strip() not in PLACEHOLDER_API_KEYS:
            ai_provider = "openai-compatible"
        else:
            ai_provider = "local"

    if ai_provider not in SUPPORTED_PROVIDERS:
        raise ValueError(
            f"Unsupported AI_PROVIDER '{ai_provider}'. "
            "Supported values are: openai-compatible, local."
        )

    if ai_provider == "openai-compatible" and openai_base_url is None:
        openai_base_url = normalize_openai_base_url(DEFAULT_OPENAI_BASE_URL)

    return AppSettings(
        ai_provider=ai_provider,
        openai_base_url=openai_base_url,
        openai_api_key=openai_api_key,
        openai_model=openai_model,
        client_origin=client_origin,
        media_base_url=media_base_url,
        media_storage_dir=media_storage_dir,
        local_workflow_store=local_workflow_store,
        capability_overrides=capability_overrides,
    )
