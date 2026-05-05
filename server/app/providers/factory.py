from __future__ import annotations

from app.providers.local import LocalProvider
from app.providers.openai_compatible import OpenAICompatibleProvider
from app.settings import get_settings


def get_provider():
    settings = get_settings()
    kind = (settings.ai_provider or "local").strip().lower()
    if kind == "openai-compatible":
        return OpenAICompatibleProvider(settings)
    if kind == "local":
        return LocalProvider(settings)
    raise ValueError(
        f"Unsupported AI_PROVIDER '{kind}'. Supported values are: openai-compatible, local."
    )
