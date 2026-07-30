#!/usr/bin/env python3
"""
Run this FIRST after filling in .env — before opening the frontend at all.
Checks every external service the app depends on and prints a clear
PASS/FAIL per service, so a broken key or wrong Cloudinary cloud name shows up in
30 seconds instead of as a confusing 500 error three clicks into the UI.

Usage:
    cd backend
    python scripts/check_setup.py

Safe to run repeatedly — everything it writes, it deletes again.
"""
import asyncio
import sys
import time

sys.path.insert(0, ".")  # so `python scripts/check_setup.py` finds the backend modules

results: list[tuple[str, bool, str]] = []


def record(name: str, ok: bool, detail: str = ""):
    results.append((name, ok, detail))
    icon = "✅" if ok else "❌"
    print(f"{icon} {name}" + (f" — {detail}" if detail else ""))


def check_env():
    print("\n--- 1. Environment variables ---")
    try:
        import config  # noqa: F401 — importing alone triggers config.py's own required-var checks
        record("Required env vars present", True)
        return True
    except SystemExit as e:
        record("Required env vars present", False, str(e).strip().splitlines()[-1] if str(e) else "missing var")
        return False


def check_firebase_admin():
    print("\n--- 2. Firebase Admin init ---")
    try:
        import firebase_init  # noqa: F401
        record("Firebase Admin SDK initialized", True)
        return True
    except SystemExit as e:
        record("Firebase Admin SDK initialized", False, str(e).strip().splitlines()[-1] if str(e) else "init failed")
        return False
    except Exception as e:
        record("Firebase Admin SDK initialized", False, f"{type(e).__name__}: {e}")
        return False


def check_firestore():
    print("\n--- 3. Firestore (write + read + delete) ---")
    try:
        from firebase_init import db

        doc_ref = db.collection("_setup_check").document("ping")
        doc_ref.set({"ok": True, "ts": time.time()})
        snap = doc_ref.get()
        if not snap.exists:
            record("Firestore write/read", False, "wrote but couldn't read it back")
            return
        doc_ref.delete()
        record("Firestore write/read/delete", True)
    except Exception as e:
        record(
            "Firestore write/read/delete",
            False,
            f"{type(e).__name__}: {e} — check FIREBASE_ADMIN_CREDENTIALS_PATH and that Firestore is enabled in the Firebase console",
        )


def check_storage():
    print("\n--- 4. Cloudinary (upload + delete) ---")
    try:
        import storage_utils

        info = storage_utils.upload_file("_setup_check", "ping", "ping.txt", b"ok", "text/plain")
        storage_utils.delete_file(info["public_id"], info["resource_type"])
        record("Cloudinary upload/delete", True, info["url"][:60])
    except Exception as e:
        record(
            "Cloudinary upload/delete",
            False,
            f"{type(e).__name__}: {e} — check CLOUDINARY_URL (or CLOUD_NAME/API_KEY/API_SECRET) in .env",
        )


async def check_gemini():
    print("\n--- 5. Gemini (primary + backup, if set) ---")
    from google import genai
    import config

    for label, key in [("primary", config.GEMINI_API_KEY), ("backup", config.GEMINI_API_KEY_BACKUP)]:
        if not key:
            record(f"Gemini {label} key", False, "not set — skipped")
            continue
        try:
            client = genai.Client(api_key=key)
            resp = await client.aio.models.generate_content(
                model=config.GEMINI_MODEL, contents=["Reply with exactly: OK"]
            )
            record(f"Gemini {label} key ({config.GEMINI_MODEL})", bool(resp.text), (resp.text or "").strip()[:40])
        except Exception as e:
            record(f"Gemini {label} key", False, f"{type(e).__name__}: {e}")

    print("\n--- 6. Gemini embeddings ---")
    try:
        from embeddings import embed_text

        vec = await embed_text("setup check")
        # The width must match EMBEDDING_DIM exactly — a mismatch is what makes
        # Chroma reject every upsert/query at runtime, so catch it here.
        record(
            "Gemini embeddings",
            len(vec) == config.EMBEDDING_DIM,
            f"{len(vec)} dims (expected {config.EMBEDDING_DIM})",
        )
    except Exception as e:
        record("Gemini embeddings", False, f"{type(e).__name__}: {e}")


async def check_groq():
    print("\n--- 7. Groq (fallback tier) ---")
    import config

    if not config.GROQ_API_KEY:
        record("Groq key", False, "not set — 3rd fallback tier unavailable")
        return
    try:
        from providers import _groq_text

        result = await _groq_text("Reply with exactly: OK", "ping", json_mode=False)
        record(f"Groq ({config.GROQ_MODEL})", bool(result), (result or "").strip()[:40])
    except Exception as e:
        record("Groq", False, f"{type(e).__name__}: {e}")


def check_chroma():
    print("\n--- 8. ChromaDB (local, should always pass) ---")
    try:
        import vectorstore

        vectorstore.add_item("_setup_check", [0.1] * 768, "ping", {"uid": "_setup_check"})
        hits = vectorstore.query([0.1] * 768, uid="_setup_check", top_k=1)
        vectorstore.delete_item("_setup_check")
        record("ChromaDB read/write", len(hits) == 1)
    except Exception as e:
        record("ChromaDB read/write", False, f"{type(e).__name__}: {e}")


async def main():
    print("Mosaic AI — setup check\n" + "=" * 40)

    if not check_env():
        print("\nFix the .env error above first — nothing else will work until it's set.")
        sys.exit(1)

    check_firebase_admin()
    check_firestore()
    check_storage()
    check_chroma()
    await check_gemini()
    await check_groq()

    print("\n" + "=" * 40)
    failed = [name for name, ok, _ in results if not ok]
    if failed:
        print(f"❌ {len(failed)} check(s) failed: {', '.join(failed)}")
        print("Fix these before testing the full app end-to-end — everything downstream depends on them.")
        sys.exit(1)
    else:
        print("✅ All checks passed — safe to start the server: uvicorn main:app --reload")


if __name__ == "__main__":
    asyncio.run(main())
