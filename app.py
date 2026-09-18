#!/usr/bin/env python3
"""Nemotron 3 Diarization lab — showcase + overlapping-voice UI (no local GPU)."""

from __future__ import annotations

import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from src.session import AUDIO_PATH, load_session

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
ASSETS = ROOT / "assets"
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "7888"))

for name in (
    "header.jpg",
    "showcase-lanes.jpg",
    "pipeline.svg",
    "der-chart.svg",
    "rtfx-chart.svg",
    "demo-mix.wav",
):
    src = ASSETS / name if (ASSETS / name).exists() else ROOT / "data" / name
    dst = STATIC / name
    if src.exists() and (
        not dst.exists() or src.stat().st_mtime > dst.stat().st_mtime
    ):
        dst.write_bytes(src.read_bytes())

app = FastAPI(title="Nemotron 3 Diarization Lab")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/")
def showcase() -> FileResponse:
    return FileResponse(STATIC / "index.html")


@app.get("/lab")
def lab() -> FileResponse:
    return FileResponse(STATIC / "lab.html")


@app.get("/api/session")
def session() -> dict:
    data = load_session()
    data["mode"] = "demo"
    data["gpu"] = False
    data["hint"] = (
        "This Mac has no NVIDIA GPU. Demo mode plays a constructed overlapping mix "
        "in the same JSON shape the Colab notebook emits after a real T4 run."
    )
    return data


@app.get("/api/audio")
def audio() -> FileResponse:
    return FileResponse(AUDIO_PATH, media_type="audio/wav")


@app.get("/health")
def health() -> dict:
    session = load_session()
    return {
        "ok": True,
        "gpu": False,
        "speakers": len(session["speakers"]),
        "overlaps": len(session["overlaps"]),
        "duration_sec": session["duration_sec"],
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host=HOST, port=PORT, reload=False)
