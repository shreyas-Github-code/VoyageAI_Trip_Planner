from __future__ import annotations

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str = "Tour Guide Assistant"
    groq_api_key: str | None = field(default_factory=lambda: os.getenv("GROQ_API_KEY"))
    allowed_origins: list[str] = field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:3000",
        ]
    )


settings = Settings()
