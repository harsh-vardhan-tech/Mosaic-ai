"""
One fallback chain, reused by every AI feature in the app (extraction, bio,
resume, portfolio, chat).

  - generate(prompt, text=...)               -> Gemini(primary) -> Gemini(backup) -> Groq
  - generate(prompt, file_bytes=..., mime=...) -> Gemini(primary) -> Gemini(backup)
    (Groq's text models can't see images/PDFs directly, so there's no Groq tier
    for the multimodal path — see extraction.py for how we work around that by
    extracting plain text first whenever possible.)

Pass `schema` (a Pydantic model) to force structured JSON output; leave it
None for free-form text (bios, resume prose, chat answers).
"""
import httpx
from google import genai
from google.genai import types

from config import (
    GEMINI_API_KEY,
    GEMINI_API_KEY_BACKUP,
    GEMINI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
)
from logger import get_logger

log = get_logger("providers")

_gemini_clients = [genai.Client(api_key=GEMINI_API_KEY)]
if GEMINI_API_KEY_BACKUP:
    _gemini_clients.append(genai.Client(api_key=GEMINI_API_KEY_BACKUP))


def _content_config(schema):
    if schema is not None:
        return types.GenerateContentConfig(response_mime_type="application/json", response_schema=schema)
    return None


async def _gemini_text(client: genai.Client, prompt: str, text: str, schema) -> str:
    response = await client.aio.models.generate_content(
        model=GEMINI_MODEL,
        contents=[prompt, text],
        config=_content_config(schema),
    )
    return response.text


async def _gemini_multimodal(client: genai.Client, prompt: str, file_bytes: bytes, mime_type: str, schema) -> str:
    response = await client.aio.models.generate_content(
        model=GEMINI_MODEL,
        contents=[types.Part.from_bytes(data=file_bytes, mime_type=mime_type), prompt],
        config=_content_config(schema),
    )
    return response.text


async def _groq_text(prompt: str, text: str, json_mode: bool) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set — Groq fallback unavailable")

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": text[:15000]},
        ],
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=30) as http_client:
        resp = await http_client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json=body,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def generate(
    prompt: str,
    *,
    text: str | None = None,
    file_bytes: bytes | None = None,
    mime_type: str | None = None,
    schema=None,
) -> str:
    """Runs the fallback chain, returns the first successful raw response text.
    Exactly one of `text` or (`file_bytes` + `mime_type`) should be given.
    """
    errors: list[str] = []

    if file_bytes is not None:
        for i, client in enumerate(_gemini_clients):
            label = "primary" if i == 0 else "backup"
            try:
                return await _gemini_multimodal(client, prompt, file_bytes, mime_type or "application/octet-stream", schema)
            except Exception as e:  # noqa: BLE001 - deliberately broad, we fall through providers
                log.warning("Gemini %s (multimodal) failed: %s", label, e)
                errors.append(f"Gemini ({label}, multimodal): {e}")
        raise RuntimeError("All multimodal providers failed:\n" + "\n".join(errors))

    if text is not None:
        for i, client in enumerate(_gemini_clients):
            label = "primary" if i == 0 else "backup"
            try:
                return await _gemini_text(client, prompt, text, schema)
            except Exception as e:  # noqa: BLE001
                log.warning("Gemini %s (text) failed: %s", label, e)
                errors.append(f"Gemini ({label}, text): {e}")
        try:
            return await _groq_text(prompt, text, json_mode=schema is not None)
        except Exception as e:
            log.warning("Groq (text) failed: %s", e)
            errors.append(f"Groq (text): {e}")
        raise RuntimeError("All text providers failed:\n" + "\n".join(errors))

    raise ValueError("generate() needs either `text` or `file_bytes`+`mime_type`")
