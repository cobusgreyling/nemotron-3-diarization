"""Demo-session loader shared by the local lab."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SESSION_PATH = ROOT / "data" / "demo-session.json"
AUDIO_PATH = ROOT / "data" / "demo-mix.wav"


def load_session() -> dict[str, Any]:
    data = json.loads(SESSION_PATH.read_text(encoding="utf-8"))
    if not data.get("segments"):
        raise ValueError("demo session has no segments")
    if not data.get("overlaps"):
        raise ValueError("demo session must include overlapping speech")
    return data
