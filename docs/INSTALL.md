# Install & run locally

You need two terminals — one for the backend, one for the frontend. Both
must be running at the same time for the app to work.

## Prerequisites

- Python 3.11+
- Node.js 20+ and npm
- A Firebase project (Auth + Firestore enabled — Storage is not used)
- A free Cloudinary account (holds every uploaded file)
- At least one Gemini API key (Google AI Studio) — Groq key is optional but
  recommended as a fallback

If you haven't set up Firebase or gotten API keys yet, do that first — see
[`ENV_VARS.md`](ENV_VARS.md) for exactly where to get each one.

## 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# now open .env and fill in GEMINI_API_KEY, your Cloudinary credentials, etc.

mkdir -p secrets
# put your Firebase service-account JSON at secrets/firebase-admin.json
# (Firebase Console → Project Settings → Service Accounts → Generate new private key)

uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/health` — you should see `{"status": "ok"}`.
If it exits immediately with a `[CONFIG ERROR]` message, it's telling you
exactly which `.env` variable is missing.

## 2. Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# fill in the NEXT_PUBLIC_FIREBASE_* values from Firebase Console →
# Project Settings → General → Your apps → SDK setup and configuration
# (leave NEXT_PUBLIC_API_BASE_URL as http://localhost:8000 for local dev)

npm run dev
```

Visit `http://localhost:3000` — it should redirect you to `/login`.

## 3. Sanity check the full flow

1. Sign up with an email + password.
2. You should land on `/dashboard`.
3. Drag a PDF or image (a certificate, resume, etc.) onto the upload box.
4. Within a few seconds it should appear as a tile with a category, title,
   and extracted skills — that's the whole pipeline (extraction →
   categorization → embedding → Firestore + Chroma) working end to end.

If the upload spins forever or errors, check the backend terminal — it logs
which provider failed and why.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Backend exits with `[CONFIG ERROR]` | A required `.env` var is empty — the message names it |
| `401 Unauthorized` on every request from the frontend | Frontend `.env.local` Firebase config doesn't match the backend's Firebase project, or you're not signed in |
| Upload returns `502 Could not upload file to storage` | Cloudinary credentials are wrong or the account is over quota — run `python scripts/check_setup.py` to test upload + delete in isolation |
| Upload hangs then 502/503s | Both Gemini keys and Groq are unavailable/rate-limited — check backend logs |
| Items upload but never show up in Search | Embedding step failed silently (see `[routes.items]` warning in logs) — the item still saves, it just won't be semantically searchable |
