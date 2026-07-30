# Environment variables

Two separate files: `backend/.env` and `frontend/.env.local`. Neither is
committed to git — each has a matching `.example` file to copy from.

## Backend — `backend/.env`

| Variable | Required? | What it's for | Where to get it |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | Primary AI provider — extraction, embeddings, chat, generators | [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_API_KEY_BACKUP` | Recommended | Used if the primary key is rate-limited | A second key from the same place, ideally a different Google account/project |
| `GROQ_API_KEY` | Recommended | Last-resort text-only fallback if both Gemini keys fail | [Groq Console](https://console.groq.com/keys) |
| `GEMINI_MODEL` | No (has default) | Which Gemini model to call | See `config.py` comments for the docs link |
| `GEMINI_EMBEDDING_MODEL` | No (has default) | Which Gemini embedding model to call | Same |
| `GROQ_MODEL` | No (has default) | Which Groq model to call | Same |
| `FIREBASE_ADMIN_CREDENTIALS_PATH` | Yes | Path to the Firebase service-account JSON | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `CLOUDINARY_URL` | Yes* | All three Cloudinary credentials in one string: `cloudinary://<api_key>:<api_secret>@<cloud_name>` | [Cloudinary Console](https://console.cloudinary.com) → Settings → API Keys |
| `CLOUDINARY_CLOUD_NAME` | Yes* | Cloud name, if you'd rather set the three values separately | Same |
| `CLOUDINARY_API_KEY` | Yes* | API key | Same |
| `CLOUDINARY_API_SECRET` | Yes* | API secret — this one is a real secret, backend only | Same |
| `CLOUDINARY_UPLOAD_FOLDER` | No (default `mosaic`) | Root folder every upload is nested under | Leave as-is |
| `CHROMA_PERSIST_DIR` | No (has default) | Local folder for the vector store | Leave as-is unless you have a reason to move it |
| `CHROMA_COLLECTION_NAME` | No (has default) | Chroma collection name | Leave as-is |

\* Set **either** `CLOUDINARY_URL` **or** the three `CLOUDINARY_CLOUD_NAME` /
`CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` values — not both. `config.py`
parses the URL form into the same three values, and the backend refuses to
start if none of them are present. Firebase Storage is not used at all, so
there is no bucket variable on the backend.

`ENABLE_TOGETHER`, `TOGETHER_API_KEY`, `HUGGINGFACE_API_KEY`, `COHERE_API_KEY`,
`OPENROUTER_API_KEY` are loaded but not wired into any code path yet — leave
blank unless you're extending the provider chain yourself.

## Frontend — `frontend/.env.local`

| Variable | Required? | What it's for | Where to get it |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web client config | Firebase Console → Project Settings → General → Your apps → SDK setup |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Same | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Same | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Part of the standard Firebase web snippet, but unused — uploads go to Cloudinary through the backend | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Same | Same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Same | Same |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Where the frontend sends API calls | `http://localhost:8000` locally, your Render URL once deployed |

These `NEXT_PUBLIC_FIREBASE_*` values are safe to expose in the browser bundle
— they're identifiers, not secrets. Access is controlled by Firebase Auth and
your security rules, not by hiding these values. The backend's
`FIREBASE_ADMIN_CREDENTIALS_PATH` service-account file is the actual secret —
that one must never be committed or exposed client-side.

## Getting Firebase set up from scratch

If you haven't created the Firebase project yet:

1. [Firebase Console](https://console.firebase.google.com) → Add project.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database (start in production mode is fine;
   the backend's Admin SDK bypasses security rules anyway since it verifies
   the user's ID token itself).
4. Skip **Storage** entirely — files are stored in Cloudinary, so you only
   need Auth + Firestore from Firebase.
5. Add a **Web app** (</> icon on the project overview page) — this gives you
   the six `NEXT_PUBLIC_FIREBASE_*` values.
6. **Project Settings → Service Accounts** → Generate new private key — this
   gives you the JSON for `FIREBASE_ADMIN_CREDENTIALS_PATH`.
