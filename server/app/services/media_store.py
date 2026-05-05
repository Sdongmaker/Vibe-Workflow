from __future__ import annotations

import mimetypes
from pathlib import Path
from uuid import uuid4

from app.settings import AppSettings


def build_media_url(settings: AppSettings, filename: str) -> str:
    if settings.media_base_url.startswith("/"):
        return f"{settings.media_base_url}/{filename}"
    return f"{settings.media_base_url.rstrip('/')}/{filename}"


def save_media_file(
    settings: AppSettings,
    original_filename: str,
    content: bytes,
    content_type: str | None,
) -> dict[str, str]:
    settings.media_storage_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(original_filename).suffix
    if not suffix and content_type:
        guessed = mimetypes.guess_extension(content_type.split(";")[0].strip())
        suffix = guessed or ""

    stored_name = f"{uuid4().hex}{suffix}"
    stored_path = settings.media_storage_dir / stored_name
    stored_path.write_bytes(content)

    return {
        "key": stored_name,
        "url": build_media_url(settings, stored_name),
        "path": str(stored_path),
        "content_type": content_type or mimetypes.guess_type(original_filename)[0] or "application/octet-stream",
    }
