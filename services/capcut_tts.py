"""
CapCut TTS Service Bridge for AlurCerita Studio.
Generates speech audio using CapCut / ByteDance TTS engine with user's authenticated session.
"""

import sys
import os
import json
import argparse
from pathlib import Path

# Add services and scratch/capcut-tts-api to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / 'services'))
sys.path.insert(0, str(BASE_DIR / 'scratch' / 'capcut-tts-api'))

try:
    from capcut_tts_api import CapCutClient
except ImportError:
    print(json.dumps({"success": False, "error": "capcut_tts_api module not found"}))
    sys.exit(1)


def get_cookie_string() -> str:
    """Load cookie string from .env or session json."""
    # 1. Check environment variable
    cookie_env = os.environ.get('CAPCUT_COOKIE')
    if cookie_env and len(cookie_env.strip()) > 10:
        return cookie_env.strip()

    # 2. Check scratch/capcut_session.json
    session_json = BASE_DIR / 'scratch' / 'capcut_session.json'
    if session_json.exists():
        try:
            with open(session_json, 'r', encoding='utf-8') as f:
                cookies_list = json.load(f)
            return '; '.join([f"{c['name']}={c['value']}" for c in cookies_list])
        except Exception:
            pass

    return ""


def generate(text: str, voice: str, output_path: str, timeout: int = 30) -> dict:
    """Generate audio and save to output_path."""
    if not text or not text.strip():
        return {"success": False, "error": "Empty text provided"}

    cookie_str = get_cookie_string()
    headers = {'Cookie': cookie_str} if cookie_str else {}

    client = CapCutClient(headers=headers, timeout=timeout)
    target_voice = voice or 'id_male_putra_uranus_bigtts'

    try:
        res = client.generate_speech(text.strip(), voice=target_voice, timeout=timeout)
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        downloaded = client.download_tts_audio(res, output_path)

        file_size = os.path.getsize(downloaded) if os.path.exists(downloaded) else 0
        return {
            "success": True,
            "voice": target_voice,
            "output_path": str(downloaded),
            "size": file_size
        }
    except Exception as e:
        return {
            "success": False,
            "voice": target_voice,
            "error": str(e)
        }


def main():
    parser = argparse.ArgumentParser(description="CapCut TTS Generator for AlurCerita Studio")
    parser.add_argument("--text", type=str, help="Spoken text to synthesize")
    parser.add_argument("--stdin", action="store_true", help="Read text from stdin")
    parser.add_argument("--voice", type=str, default="id_male_putra_uranus_bigtts", help="CapCut voice identifier")
    parser.add_argument("--output", type=str, required=True, help="Destination mp3 file path")
    parser.add_argument("--timeout", type=int, default=30, help="Request timeout in seconds")

    args = parser.parse_args()

    text = ""
    if args.stdin:
        text = sys.stdin.read()
    elif args.text:
        text = args.text

    result = generate(text=text, voice=args.voice, output_path=args.output, timeout=args.timeout)
    print(json.dumps(result))
    if not result.get("success"):
        sys.exit(1)


if __name__ == "__main__":
    main()
