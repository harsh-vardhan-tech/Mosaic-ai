# Architecture — Mosaic AI

## System overview

```mermaid
graph LR
    subgraph Client
        FE["Next.js Frontend<br/>(Vercel)"]
    end

    subgraph Server["FastAPI Backend (Render)"]
        API["REST API<br/>routes/items, search, generate, analytics"]
        AuthDep["Auth dependency<br/>verifies Firebase ID token"]
        Pipeline["Extraction pipeline"]
        RAGmod["Search / Chat / Generate"]
    end

    subgraph Firebase
        FAuth[(Auth)]
        FStore[(Firestore)]
    end

    Cloud[(Cloudinary<br/>original files)]
    Chroma[(ChromaDB<br/>vector index, per-user scoped)]
    AIProv["AI Providers<br/>Gemini primary → Gemini backup → Groq"]

    FE -- "email/password sign-in" --> FAuth
    FE -- "Bearer ID token + REST calls" --> API
    API --> AuthDep
    AuthDep -- "verify_id_token" --> FAuth
    API --> Pipeline
    API --> RAGmod
    Pipeline --> AIProv
    Pipeline --> FStore
    Pipeline -- "upload original file" --> Cloud
    Pipeline --> Chroma
    RAGmod --> Chroma
    RAGmod --> FStore
    RAGmod --> AIProv
```

Every item a user uploads ends up in three places, keyed by the same Firestore
document id: the **original file** in Cloudinary, the **structured record**
(category, title, skills, entities...) in Firestore, and its **embedding** in
ChromaDB. All three are tagged with `uid`, so one user's documents are never
visible to another's — enforced at the query level, not just the UI.

## Ingestion + categorization (Modules 1 + 2)

The AI provider fallback isn't uniform across file types, because Groq's
text models can't read a PDF or image the way Gemini can. So the pipeline
tries to pull plain text out of the file *first* — that decides which chain
it gets:

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as POST /items/upload
    participant Ext as extraction.py
    participant G1 as Gemini (primary)
    participant G2 as Gemini (backup)
    participant Gq as Groq
    participant St as Cloudinary
    participant FS as Firestore
    participant Ch as ChromaDB

    U->>FE: drag & drop file
    FE->>API: multipart upload + ID token
    API->>Ext: extract_document(bytes, mime_type)

    alt PDF-with-text, DOCX, or .txt
        Ext->>G1: generate(text) — all 3 tiers can help here
        G1--xExt: rate limited / error
        Ext->>G2: generate(text)
        G2--xExt: error
        Ext->>Gq: generate(text)
    else image or scanned PDF
        Ext->>G1: generate(file bytes) — multimodal
        G1--xExt: error
        Ext->>G2: generate(file bytes) — multimodal only, Groq can't see images
    end

    Ext-->>API: {category, title, skills, entities, tags...}
    par
        API->>St: upload original file
    and
        API->>FS: save structured item (uid-scoped)
    and
        API->>Ch: upsert embedding (uid-scoped)
    end
    API-->>FE: item JSON
    FE-->>U: appears in the mosaic grid
```

Gemini calls use `response_schema` (a Pydantic model) so the model is forced
into the exact shape the app expects — category is validated against the
6 fixed values server-side regardless of what the model returns.

## Search + Chat / RAG (Module 5)

```mermaid
sequenceDiagram
    participant U as User
    participant API as Backend
    participant Emb as Gemini Embeddings
    participant Ch as ChromaDB
    participant FS as Firestore
    participant Gen as Gemini / Groq

    U->>API: "What AI certifications do I have?"
    API->>Emb: embed(question)
    API->>Ch: query(embedding, where uid = user)
    Ch-->>API: top-k matching item ids + distances
    API->>FS: hydrate full item details for those ids
    API->>Gen: answer, grounded only in the retrieved items
    Gen-->>API: answer text
    API-->>U: answer + which documents it used
```

Chat and plain search share the same retrieval step — chat just adds a
generation call on top, and always reports which source items it drew from,
so an answer is checkable against the original document.

## Data model (Firestore `items` collection)

| field | type | notes |
|---|---|---|
| `uid` | string | owner, from the verified Firebase token |
| `category` | string | one of the 6 fixed categories |
| `title`, `organization`, `date`, `description` | string | AI-extracted |
| `skills`, `tags` | string[] | drives the relationship engine + search |
| `entities` | {type, value}[] | people / orgs / dates / locations |
| `file_url` | string | Cloudinary `secure_url` — permanent, so it's stored once at upload and served as-is (no per-read signing step) |
| `cloudinary_public_id` | string | Cloudinary asset id, used to delete the file when the item is deleted |
| `cloudinary_resource_type` | string | `image` for JPG/PNG/WEBP, `raw` for PDF/DOCX/TXT — needed to target the right asset on delete |
| `created_at` | timestamp | |

Relationships (Module 3) aren't a separate stored graph — two items are
related if `skills` overlap, computed on request. Simpler to reason about
than a maintained edge list, and correct by construction since it's always
derived from the current data.
