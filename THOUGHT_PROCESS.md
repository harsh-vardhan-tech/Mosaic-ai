# Thought Process — Mosaic AI

## The problem, as I read it

The brief isn't really "build a file storage app with tags." The line that
mattered most: *"traditional storage platforms can save files, but they
cannot understand a person's journey."* That's the bar — not just storing a
certificate, but knowing it's a certificate, what skill it demonstrates, and
that the skill also shows up in a project from six months later. So the
design decisions below were all made against one question: does this help
the system *understand*, or is it just storage with extra steps?

## Why this stack

**Firebase (Auth + Firestore) + Cloudinary for files, over a self-hosted DB.** A hackathon
build has to survive a redeploy without someone re-provisioning
infrastructure. One console, one set of credentials, generous free tier,
and Auth/DB are already wired to trust each other. Files went to Cloudinary
because Firebase Storage requires the paid Blaze plan, which would have made a
free-tier demo un-runnable — that's more
build time back for the actual AI pipeline, which is where the rubric's
weight (65% organization+retrieval quality and AI technique, combined)
actually sits.

**ChromaDB, embedded, not a hosted vector DB.** One user's document set is
tens to low hundreds of items. That's small enough that even brute-force
cosine similarity would've been fine — Chroma just gives that a real
interface (metadata filtering for per-user scoping, upsert/delete) without
standing up separate infrastructure for it.

**Gemini as primary, specifically for its multimodal input.** The
alternative was a separate OCR step before any LLM call. Gemini reading a
PDF or image directly removes a whole failure-prone stage — one less place
for a scanned certificate to come out as garbage text.

## The fallback chain took more thought than it looks like

"Gemini → Gemini backup → Groq" sounds like three interchangeable slots, but
Groq's text models can't read a raw PDF or image — so a naive chain would
have Groq silently useless for the image/scanned-PDF case. The pipeline
extracts plain text first (`pypdf` for PDF, `python-docx` for DOCX) and
*that* determines the chain: text-extractable files get all three tiers,
genuinely image-only documents get Gemini's two keys and stop there. That
was worth the extra branch — it's the difference between a fallback that
exists on paper and one that actually catches a failure on a typical
document (most uploads here are PDFs and DOCX, i.e. the case where it
works end-to-end).

## Per-user scoping was a deliberate constraint, not a demo shortcut

It would've been faster to build this as a single-tenant demo — no auth
check, one shared collection. I scoped every read/write by `uid` in both
Firestore *and* Chroma's metadata filter from the start instead, because a
"digital identity" tool that shows one person's certificates to another
isn't a smaller version of the product, it's a different, wrong product.

## Real challenges hit during the build

- **Groq deprecated `llama-3.3-70b-versatile` mid-build** (mid-2026) —
  training-data knowledge of "the" Groq flagship model was already stale.
  Had to check current docs rather than assume; landed on `openai/gpt-oss-120b`.
- **Structured output reliability.** Free-text extraction prompts drift —
  a model occasionally invents a 7th category or wraps JSON in prose.
  Forcing `response_schema` plus a server-side allow-list check on
  `category` (falls back to "Achievements" if the model returns anything
  else) means a bad model response degrades gracefully instead of breaking
  the categorization view.
- **DOCX was in the required feature list but had no handling at all** in
  an earlier pass — Gemini's multimodal input doesn't accept raw `.docx`
  bytes the way it accepts PDF/images, so it needs the text-extraction path
  rather than the multimodal one. Easy to miss because PDF and images "just
  work" multimodally and DOCX silently doesn't.
- **Cloudinary instead of Firebase Storage.** Firebase Storage needs a billing
  plan to enable a bucket, which is a bad dependency for a free-tier demo, and
  its download URLs are time-limited — so every read had to re-sign the URL
  (an extra network call per item, per page load). Cloudinary's `secure_url`
  is permanent, so the URL is written once at upload time and read straight
  out of Firestore afterwards. The trade-off is that assets are public-by-URL
  rather than access-controlled, and the delete path now has to remember
  `public_id` + `resource_type` to remove the right asset. Firebase still
  handles Auth and Firestore — only the file bytes moved.
- **`image` vs `raw` resource types.** Cloudinary treats PDFs as images by
  default and will happily transcode/rasterise them. Uploading PDF/DOCX/TXT as
  `raw` keeps the original bytes byte-for-byte, and keeping the file extension
  in the `raw` public_id is what makes browsers preview/download them properly.

## What I'd build next with more time

- OCR as a second opinion on scanned/handwritten certificates, since those
  currently depend entirely on Gemini vision with no fallback if it
  misreads something.
- Pull directly from a GitHub profile as a data source alongside manual
  uploads — projects already have structured metadata (README, languages,
  commit history) that's higher-signal than a PDF.
- Relationships currently key off shared skill tags; a version that also
  reasons over time (this internship's skills *led to* that later project)
  would make the "connect information" part of the brief sharper than
  co-occurrence alone.
- Cache repeated searches/generations — right now every `/search` and
  `/generate/*` call re-embeds or re-generates from scratch, which is fine
  at hackathon scale and wasteful past it.
