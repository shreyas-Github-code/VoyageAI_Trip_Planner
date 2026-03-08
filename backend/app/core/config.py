from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

DEFAULT_ALLOWED_ORIGINS: Final[list[str]] = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
]


def _parse_allowed_origins() -> list[str]:
    raw_value = os.getenv("ALLOWED_ORIGINS", "")
    parsed = [origin.strip() for origin in raw_value.split(",") if origin.strip()]
    return parsed or DEFAULT_ALLOWED_ORIGINS.copy()


@dataclass(frozen=True)
class Settings:
    app_name: str = "Tour Guide Assistant"
    groq_api_key: str | None = field(default_factory=lambda: os.getenv("GROQ_API_KEY"))
    allowed_origins: list[str] = field(default_factory=_parse_allowed_origins)
    allowed_origin_regex: str | None = field(
        default_factory=lambda: os.getenv("ALLOWED_ORIGIN_REGEX") or None
    )


settings = Settings()
