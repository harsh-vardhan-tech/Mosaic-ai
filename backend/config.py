import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
# Also load env files from the project root (one level up) so the backend
# picks up variables set at the project level (e.g. in the v0 sandbox, where
# env vars land in .env.development.local at the repo root).
_ROOT = Path(__file__).resolve().parent.parent
for _env_file in (".env", ".env.local", ".env.development.local"):
    _p = _ROOT / _env_file
    if _p.exists():
        load_dotenv(_p, override=False)


def _require(name: str) -> str:
    """Required var — fail fast at startup with a clear message naming the
    exact variable, instead of a confusing crash somewhere deep in a request.
    """
    value = os.getenv(name)
    if not value:
        sys.exit(
            f"\n[CONFIG ERROR] Missing required environment variable: {name}\n"
            f"Copy .env.example -> .env, fill in {name}, then restart.\n"
        )
    return value


def _optional(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)


# ============================================================
# AI provider chain: Gemini (primary) -> Gemini (backup) -> Groq
# ============================================================
GEMINI_API_KEY = _require("GEMINI_API_KEY")
GEMINI_API_KEY_BACKUP = _optional("GEMINI_API_KEY_BACKUP")
GROQ_API_KEY = _optional("GROQ_API_KEY")

if not GEMINI_API_KEY_BACKUP:
    print("[config] warning: GEMINI_API_KEY_BACKUP not set — no backup Gemini key if primary gets rate-limited.")
if not GROQ_API_KEY:
    print("[config] warning: GROQ_API_KEY not set — no fallback left if both Gemini keys fail.")

# Deliberately not wired into any code path. Flip ENABLE_TOGETHER in .env and
# ask me to add it to providers.py when you actually want a 4th fallback.
ENABLE_TOGETHER = _optional("ENABLE_TOGETHER", "false").lower() == "true"
TOGETHER_API_KEY = _optional("TOGETHER_API_KEY")

# Loaded, not called anywhere yet. Here so every credential lives in one file;
# tell me when you want one wired in (Cohere rerank, HF inference, OpenRouter
# as an extra fallback) and I'll add it to providers.py.
HUGGINGFACE_API_KEY = _optional("HUGGINGFACE_API_KEY")
COHERE_API_KEY = _optional("COHERE_API_KEY")
OPENROUTER_API_KEY = _optional("OPENROUTER_API_KEY")

# --- Model names ---
# Providers rename/deprecate models often — if something 404s, this is the
# only place you should need to change:
#   Gemini:            https://ai.google.dev/gemini-api/docs/models
#   Gemini embeddings: https://ai.google.dev/gemini-api/docs/embeddings
#   Groq:              https://console.groq.com/docs/models
# Groq deprecated llama-3.3-70b-versatile in mid-2026 — gpt-oss-120b is the
# current recommended replacement, hence the default below.
GEMINI_MODEL = _optional("GEMINI_MODEL", "gemini-3.6-flash")
GEMINI_EMBEDDING_MODEL = _optional("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
GROQ_MODEL = _optional("GROQ_MODEL", "openai/gpt-oss-120b")

# gemini-embedding-001 returns 3072 dims by default but supports truncation
# (Matryoshka) to 1536 / 768. We pin 768: same retrieval quality for this
# amount of data, 4x less to store and scan in Chroma. A vector store's
# collection is locked to whatever dimension it was created with, so this value
# must stay stable — if you change it, vectorstore.py rebuilds the collection
# and you must re-upload documents to re-index them.
EMBEDDING_DIM = int(_optional("EMBEDDING_DIM", "768") or 768)

# ============================================================
# Firebase — Admin SDK (server-side only)
# ============================================================
# Credentials come from ONE of three places (checked in this order):
#   1. FIREBASE_ADMIN_CREDENTIALS_B64 — the service-account JSON, base64
#      encoded. Safest for hosted dashboards (Render/Vercel) because it is a
#      single line with no quotes, newlines, or smart characters to mangle.
#   2. FIREBASE_ADMIN_CREDENTIALS_JSON — the raw service-account JSON pasted
#      into an env var.
#   3. FIREBASE_ADMIN_CREDENTIALS_PATH — path to the JSON file on disk.
FIREBASE_ADMIN_CREDENTIALS_B64 = _optional("FIREBASE_ADMIN_CREDENTIALS_B64")
FIREBASE_ADMIN_CREDENTIALS_JSON = _optional("FIREBASE_ADMIN_CREDENTIALS_JSON")

if FIREBASE_ADMIN_CREDENTIALS_B64:
    import base64 as _base64
    import binascii as _binascii

    try:
        FIREBASE_ADMIN_CREDENTIALS_JSON = _base64.b64decode(
            "".join(FIREBASE_ADMIN_CREDENTIALS_B64.split()), validate=True
        ).decode("utf-8")
    except (_binascii.Error, UnicodeDecodeError):
        sys.exit(
            "\n[CONFIG ERROR] FIREBASE_ADMIN_CREDENTIALS_B64 is not valid base64.\n"
            "Regenerate it with:  base64 -w0 secrets/firebase-admin.json\n"
        )

if FIREBASE_ADMIN_CREDENTIALS_JSON:
    # Copy-pasting JSON out of a browser or chat window often smuggles in
    # non-breaking spaces / zero-width characters, which make json.loads fail
    # with a baffling "Expecting property name" error. Scrub them here so a
    # pasted key just works.
    FIREBASE_ADMIN_CREDENTIALS_JSON = (
        FIREBASE_ADMIN_CREDENTIALS_JSON.replace("\xa0", " ")
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .strip()
    )

FIREBASE_ADMIN_CREDENTIALS_PATH = _optional(
    "FIREBASE_ADMIN_CREDENTIALS_PATH", "./secrets/firebase-admin.json"
)
if not FIREBASE_ADMIN_CREDENTIALS_JSON and not os.path.exists(FIREBASE_ADMIN_CREDENTIALS_PATH):
    sys.exit(
        "\n[CONFIG ERROR] No Firebase Admin credentials found.\n"
        "Set FIREBASE_ADMIN_CREDENTIALS_JSON (paste the service-account JSON) or\n"
        "FIREBASE_ADMIN_CREDENTIALS_PATH (path to the JSON file), then restart.\n"
    )
# ============================================================
# Cloudinary — file storage (replaces Firebase Storage)
# ============================================================
# Credentials come from ONE of two places (checked in this order):
#   1. CLOUDINARY_URL — the single "API environment variable" from the
#      Cloudinary dashboard: cloudinary://<api_key>:<api_secret>@<cloud_name>
#   2. CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET set
#      individually.
CLOUDINARY_URL = _optional("CLOUDINARY_URL")
CLOUDINARY_CLOUD_NAME = _optional("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = _optional("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = _optional("CLOUDINARY_API_SECRET")

if CLOUDINARY_URL:
    # Parse cloudinary://key:secret@cloud_name so the rest of the code only
    # ever deals with the three individual values.
    from urllib.parse import urlparse as _urlparse

    _parsed = _urlparse(CLOUDINARY_URL)
    if _parsed.scheme != "cloudinary" or not (_parsed.username and _parsed.password and _parsed.hostname):
        sys.exit(
            "\n[CONFIG ERROR] CLOUDINARY_URL is malformed.\n"
            "Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>\n"
        )
    CLOUDINARY_API_KEY = CLOUDINARY_API_KEY or _parsed.username
    CLOUDINARY_API_SECRET = CLOUDINARY_API_SECRET or _parsed.password
    CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME or _parsed.hostname

if not (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET):
    sys.exit(
        "\n[CONFIG ERROR] Missing Cloudinary credentials.\n"
        "Set CLOUDINARY_URL (cloudinary://<api_key>:<api_secret>@<cloud_name>) or\n"
        "CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET, then restart.\n"
        "Find them at https://console.cloudinary.com -> Settings -> API Keys.\n"
    )

# Root folder for every upload in the Cloudinary media library.
CLOUDINARY_UPLOAD_FOLDER = _optional("CLOUDINARY_UPLOAD_FOLDER", "mosaic")

# ============================================================
# CORS — which browser origins are allowed to call this API
# ============================================================
# Comma-separated list, or "*" for any origin (local dev only). A wildcard is
# incompatible with credentialed requests in the browser, so when ALLOWED_ORIGINS
# is "*" we turn credentials off rather than shipping a config browsers reject.
_raw_origins = _optional("ALLOWED_ORIGINS", "*") or "*"
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
ALLOW_CREDENTIALS = ALLOWED_ORIGINS != ["*"]

if ALLOWED_ORIGINS == ["*"]:
    print("[config] warning: ALLOWED_ORIGINS is '*' — set it to your real domain before going public.")

# ============================================================
# ChromaDB — local persistent vector store for semantic search
# ============================================================
CHROMA_PERSIST_DIR = _optional("CHROMA_PERSIST_DIR", "./chroma_data")
CHROMA_COLLECTION_NAME = _optional("CHROMA_COLLECTION_NAME", "mosaic_items")

# The 6 categories the hackathon brief asks for — exact strings matter, used
# in the extraction prompt, Firestore documents, and the frontend filters.
CATEGORIES = [
    "Projects",
    "Skills",
    "Certifications",
    "Internships",
    "Achievements",
    "Academics",
]
