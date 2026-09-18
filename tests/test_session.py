from pathlib import Path

from src.session import AUDIO_PATH, load_session


def test_session_has_overlapping_speakers():
    session = load_session()
    assert len(session["speakers"]) == 3
    assert len(session["overlaps"]) >= 2
    assert session["duration_sec"] > 5
    ids = {s["id"] for s in session["speakers"]}
    for ov in session["overlaps"]:
        assert ov["end"] > ov["start"]
        assert set(ov["speakers"]) <= ids


def test_mix_exists():
    assert AUDIO_PATH.exists()
    assert AUDIO_PATH.stat().st_size > 50_000


def test_static_pages_exist():
    root = Path(__file__).resolve().parents[1] / "static"
    for name in ("index.html", "lab.html", "styles.css", "app.js", "header.jpg"):
        assert (root / name).exists(), name
