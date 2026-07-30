# Mosaic AI

> An AI-powered Digital Identity System that automatically understands, organizes, and connects a student's academic and professional journey.

---

## Problem Statement

Throughout their academic and professional journey, students collect certificates, resumes, internship letters, project reports, achievements, and other important documents.

Over time these files become scattered across folders, cloud storage, emails, and multiple devices. Finding a specific document or understanding how different experiences are connected becomes difficult.

Traditional storage systems can store files, but they cannot understand a person's journey.

---

## Solution

Mosaic AI transforms scattered documents into an intelligent digital identity.

The system uses AI to extract structured information, automatically categorizes documents, identifies relationships between experiences, builds a digital timeline, and enables natural language search over the user's own data.

Original files remain preserved while AI creates a searchable knowledge layer on top of them.

---

# Key Features

### AI Document Ingestion
- Upload certificates, resumes, internship letters, project reports and academic documents.
- Automatic text extraction and metadata generation using Gemini AI.

### Intelligent Categorization
Documents are automatically organized into:
- Projects
- Skills
- Certifications
- Internships
- Achievements
- Academics

### Relationship Engine
Automatically discovers relationships between uploaded information.

Example:

```
Certification
      ↓
Skill
      ↓
Project
      ↓
Internship
```

### Digital Journey Timeline
Creates a chronological timeline of the user's academic and professional growth.

Example:

```
2023 → Python Certification

2024 → Web Development Project

2025 → Software Internship

2026 → AI Portfolio
```

### Semantic Search
Search documents using natural language instead of manually browsing folders.

Examples:

- Show all my certificates
- Show my AI projects
- Show internship documents
- Show my latest resume

### AI Chat (RAG)
Chat with uploaded documents using Retrieval-Augmented Generation (RAG).

### AI Content Generation
Generate:
- Resume
- Professional Bio
- Portfolio Summary

### Analytics Dashboard
View categorized information and overall profile summary.

---

# AI Workflow

```
User Upload
      │
      ▼
Document Extraction
      │
      ▼
Gemini AI
      │
      ▼
Structured Metadata
      │
      ▼
Automatic Categorization
      │
      ▼
Relationship Engine
      │
      ▼
Vector Embeddings
      │
      ▼
Semantic Search + RAG Chat
      │
      ▼
Timeline • Analytics • Resume Generation
```

---

# Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | FastAPI |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| AI Models | Gemini AI, Groq (Fallback) |
| Vector Database | ChromaDB |
| File Storage | Cloudinary |
| Deployment | Vercel, Render |

---

# Project Structure

```
mosaic-ai/

├── app/
├── backend/
├── components/
├── docs/
├── public/
├── lib/
└── README.md
```

---

# Getting Started

## Frontend

```bash
npm install

npm run dev
```

## Backend

```bash
cd backend

pip install -r requirements.txt

python main.py
```

For environment variables and deployment instructions, refer to:

- docs/INSTALL.md
- docs/ENV_VARS.md
- docs/DEPLOY.md

---

# Demo Flow

1. Sign in to Mosaic AI.
2. Upload academic or professional documents.
3. AI extracts structured information.
4. Documents are automatically categorized.
5. Related experiences are connected.
6. A digital timeline is generated.
7. Search documents using natural language.
8. Chat with uploaded documents.
9. Generate a resume or professional bio.

---

# Current Limitations

- API keys must be configured before running locally.
- Render free tier does not provide persistent storage for the vector database.
- Avatar upload is not available yet.

---

# Future Improvements

- Better multilingual document understanding
- Improved OCR support
- Mobile application
- Smarter relationship inference
- Enhanced analytics dashboard

---

## Project Goal

The goal of Mosaic AI is simple:

> **Upload your documents once and never waste time searching through folders again.**

By combining AI-powered document understanding, semantic search, relationship mapping, and timeline generation, Mosaic AI creates an intelligent digital identity that grows with the user throughout their academic and professional journey.
