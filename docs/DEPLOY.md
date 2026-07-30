# Deploying Mosaic

Two separate deployments: the FastAPI backend on **Render**, the Next.js
frontend on **Vercel**. Deploy the backend first — the frontend needs its URL.

## 1. Backend → Render

1. Push `backend/` to a GitHub repo (or the whole `mosaic-ai/` monorepo —
   Render lets you set a root directory).
2. In Render: **New → Blueprint**, point it at your repo. It'll read
   `backend/render.yaml` automatically.
3. Fill in the env vars Render asks for (marked `sync: false` in the
   blueprint): `GEMINI_API_KEY`, `GEMINI_API_KEY_BACKUP`, `GROQ_API_KEY`, and
   your Cloudinary credentials — either `CLOUDINARY_URL` on its own or
   `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`.
4. Under **Secret Files**, add your Firebase service-account JSON at the path
   `/etc/secrets/firebase-service-account.json` (this is what
   `FIREBASE_ADMIN_CREDENTIALS_PATH` in the blueprint already points to).
5. Deploy. Once live, note the URL — something like
   `https://mosaic-ai-backend.onrender.com`.
6. Check `https://<your-service>.onrender.com/health` returns `{"status": "ok"}`.

**Important caveat:** Render's free plan doesn't support persistent disks.
`render.yaml` requests one for ChromaDB, but if you're on the free plan
that line will need to come out (or upgrade the plan) — otherwise every
redeploy wipes the semantic-search index. Items themselves are safe either
way since they live in Firestore, not Chroma; only the "search my items in
plain English" feature is affected.

## 2. Frontend → Vercel

1. Push `frontend/` (or the monorepo) to GitHub.
2. In Vercel: **Add New → Project**, import the repo. If it's a monorepo,
   set the **Root Directory** to `frontend`.
3. Vercel auto-detects Next.js from `vercel.json` / `package.json` — no
   build command changes needed.
4. Add environment variables (Project Settings → Environment Variables):
   - All six `NEXT_PUBLIC_FIREBASE_*` values (same ones from your `.env.local`)
   - `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL from step 1
     (no trailing slash)
5. Deploy.

## 3. Connect them

Two things need to point at each other correctly, or auth/CORS will break:

- **Backend CORS**: `backend/main.py` currently allows `allow_origins=["*"]`.
  That works for a hackathon demo but tighten it to your Vercel domain
  before treating this as production:
  ```python
  allow_origins=["https://your-app.vercel.app"]
  ```
- **Firebase Auth domain**: in Firebase Console → Authentication → Settings
  → Authorized domains, add your Vercel domain, or sign-in will be rejected
  by Firebase itself.

## 4. Post-deploy smoke test

Same flow as local: sign up → upload a file → confirm it categorizes and
shows up in the dashboard. If it works locally but not deployed, it's almost
always one of: CORS origin, Firebase authorized domain, or a missing env var
on one of the two platforms — check both dashboards' environment variable
lists side by side against `docs/ENV_VARS.md`.
