# Mosaic AI — Setup

Two apps in one repo: FastAPI backend (`backend/`) and Next.js frontend (repo root).
Each gets its own env file. No credential is ever hardcoded in source.

## 1. Backend env

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in every value. Keep the model names exactly as they ship:

```
GEMINI_MODEL=gemini-3.6-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GROQ_MODEL=openai/gpt-oss-120b
```

Do **not** swap these for `gemini-2.0-flash-exp`, `text-embedding-004`, or
`llama-3.3-70b-versatile` — the Groq one was deprecated mid-2026 and fails outright.

Provider fallback order is fixed in `providers.py`: Gemini primary key -> Gemini
backup key -> Groq. `ENABLE_TOGETHER` is read but not wired into any code path yet.

## 2. Firebase Admin credential

Download the service-account JSON (Firebase Console -> Project settings ->
Service accounts -> Generate new private key) and save it as:

```
backend/secrets/firebase-admin.json
```

`backend/secrets/` is git-ignored and excluded from every zip. This file is a full
admin credential — never commit it, never paste it into chat.

## 3. Frontend env

```bash
cp .env.local.example .env.local
```

Fill in the `NEXT_PUBLIC_FIREBASE_*` values from Firebase Console -> Project
settings -> General -> Your apps -> Config.

Set `NEXT_PUBLIC_API_BASE_URL` to where the backend actually runs — no trailing slash:

- local: `http://localhost:8000`
- deployed: `https://your-service.onrender.com`

If the frontend is on Vercel, `localhost` will **not** work; it must be the public
backend URL.

## 4. Enable Firebase services

In the Firebase Console:

1. **Authentication** -> Sign-in method -> enable **Email/Password**.
2. **Firestore Database** -> Create database.
3. **Storage** — skip it. Firebase Storage needs the paid Blaze plan, so files
   are stored in Cloudinary instead (see step 5 below). Firebase is only used
   for Auth + Firestore, both of which work on the free Spark plan.

## 5. Cloudinary (file storage)

Create a free account at [cloudinary.com](https://cloudinary.com), then open
**Settings -> API Keys** and copy the credentials into `backend/.env`:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=mosaic
```

Or paste the dashboard's single "API environment variable" instead — the code
parses it into the same three values:

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Uploads land under `mosaic/users/{uid}/{item_id}/`. Images go up as `image`
resources; PDF/DOCX/TXT go up as `raw` so the original bytes are served
untouched. The returned `secure_url` is permanent and is saved on the Firestore
document at upload time — nothing needs re-signing on read.

## 6. Install and run

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/check_setup.py    # verifies keys, Firestore, Cloudinary, Chroma
uvicorn main:app --reload --port 8000
```

```bash
# frontend (new terminal, from repo root)
pnpm install
pnpm dev
```

Open http://localhost:3000 — sign up, then upload a document.

## Supported uploads

PDF, DOCX, TXT, JPG, PNG, WEBP — max 15 MB.

Text is extracted locally first (`pypdf` / `python-docx`). If a file has no
embedded text (scanned PDF or an image), it is sent to Gemini's multimodal model
instead. Upload type is resolved from the browser MIME type, falling back to the
file extension when the browser reports `application/octet-stream` — which Windows
does for `.docx` when Office is not installed.

## Never commit

`backend/.env`, `.env.local`, `backend/secrets/` — all git-ignored already.
