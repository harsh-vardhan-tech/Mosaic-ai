# Mosaic — AI-Powered Digital Identity System

Students collect certificates, project reports, resumes, and internship
letters across a dozen different folders and never look at them again.
Mosaic ingests all of it, uses AI to pull out the structured story
(skills, dates, organizations), and turns it into one living portfolio you
can search, chat with, and generate a resume or bio from.

## What's built

**Backend (FastAPI)** — done:
- Upload + AI categorization into 6 categories (Projects, Skills,
  Certifications, Internships, Achievements, Academics)
- Relationship engine (links items that share extracted skills)
- Timeline (chronological view)
- Semantic search (ChromaDB) + RAG chat over your own documents
- AI bio / resume / portfolio generators
- Analytics summary
- Firebase Auth on every route, per-user data isolation
- File storage on Cloudinary (Firebase Storage needs a paid plan), with
  permanent delivery URLs saved on the Firestore document
- Gemini → Gemini backup → Groq fallback chain

**Frontend (Next.js)** — done:
- Firebase email/password login & signup, plus Google and Microsoft social sign-in
- Dashboard: drag-and-drop upload, mosaic grid with category filters
- Item detail view with a relationship graph (shared-skill connections)
- Timeline, Search, Chat, Generate (bio/resume/portfolio), Analytics pages
- Settings: display name, password change (with re-auth), theme switcher, sign out
- Dark mode, responsive layout with a mobile nav drawer

## Project structure

```
mosaic-ai/
├── backend/        FastAPI app — see docs/INSTALL.md to run it locally
├── frontend/        Next.js app — see docs/INSTALL.md to run it locally
└── docs/
    ├── INSTALL.md    local setup for both apps
    ├── DEPLOY.md      Vercel (frontend) + Render (backend)
    └── ENV_VARS.md    every environment variable, what it's for
```

## Quick start

1. Read [`docs/INSTALL.md`](docs/INSTALL.md) — get both apps running locally.
2. Read [`docs/ENV_VARS.md`](docs/ENV_VARS.md) — fill in your own API keys
   and Firebase project.
3. Read [`docs/DEPLOY.md`](docs/DEPLOY.md) when you're ready to put it online.

## Known gaps (be upfront about these with judges)

- The AI provider calls (Gemini/Groq) and live Firebase were tested with
  real keys locally, not from this build environment — verify once you drop
  in your own `.env`.
- Render's **free** plan has no persistent disk, so the local ChromaDB index
  resets on every redeploy — see the note in `backend/render.yaml`.
- Settings supports display name and password changes, but there's no
  avatar upload yet.
