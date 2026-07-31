Mosaic AI

An AI-powered Digital Identity System that understands, organizes, and connects a student’s academic and professional journey.

Overview

Students collect certificates, resumes, internship letters, project reports, achievements, and other important documents over time. These files usually get scattered across folders, cloud storage, emails, and multiple devices, making it hard to find the right document or understand how different experiences are connected.

Mosaic AI solves this by turning scattered documents into an intelligent digital identity. It extracts structured information, automatically categorizes documents, identifies relationships, builds a digital timeline, and enables natural language search over the user’s own data.

Original files remain preserved while AI creates a searchable knowledge layer on top of them.

Problem Statement

Traditional storage systems can store files, but they cannot understand a person’s journey.

Students and professionals often struggle to:

- find important documents quickly,
- organize achievements properly,
- connect skills with projects and internships,
- and present their journey in a clean, structured way.

Solution

Mosaic AI transforms scattered documents into an intelligent profile system.

It uses AI to:

- extract structured information from uploaded files,
- automatically categorize documents,
- identify relationships between experiences,
- generate a digital timeline,
- and support semantic search and RAG-based chat.

Key Features

AI Document Ingestion

Upload:

- certificates
- resumes
- internship letters
- project reports
- academic documents

Automatic text extraction and metadata generation are powered by Gemini AI.

Intelligent Categorization

Documents are automatically organized into:

- Projects
- Skills
- Certifications
- Internships
- Achievements
- Academics

Relationship Engine

Mosaic AI discovers relationships between uploaded information.

Example:

Certification
      ↓
Skill
      ↓
Project
      ↓
Internship

Digital Journey Timeline

A chronological timeline shows the user’s growth and achievements.

Example:

2023 → Python Certification

2024 → Web Development Project

2025 → Software Internship

2026 → AI Portfolio

Semantic Search

Search documents using natural language instead of manually browsing folders.

Examples:

- Show all my certificates
- Show my AI projects
- Show internship documents
- Show my latest resume

AI Chat (RAG)

Chat with uploaded documents using Retrieval-Augmented Generation.

AI Content Generation

Generate:

- Resume
- Professional Bio
- Portfolio Summary

Analytics Dashboard

View categorized information and overall profile summary.

AI Workflow

flowchart TD
    A[User Upload] --> B[Document Extraction]
    B --> C[Gemini AI]
    C --> D[Structured Metadata]
    D --> E[Automatic Categorization]
    E --> F[Relationship Engine]
    F --> G[Vector Embeddings]
    G --> H[Semantic Search + RAG Chat]
    H --> I[Timeline • Analytics • Resume Generation]

System Architecture

flowchart TD
    U[👤 User] --> FE[🌐 Next.js Frontend]
    FE --> AUTH[🔐 Firebase Authentication]
    AUTH --> API[⚡ FastAPI Backend]

    API --> CLD[☁️ Cloudinary]
    API --> GEM[🤖 Gemini AI]
    API --> FIRE[🗄️ Cloud Firestore]
    API --> CHROMA[🧠 ChromaDB]

    CLD --> EXTRACT[📄 Document Extraction]
    GEM --> META[🏷️ Metadata Generation]
    EXTRACT --> META

    META --> CAT[📂 Categorization]
    CAT --> REL[🔗 Relationship Engine]
    REL --> TIME[📅 Digital Timeline]

    META --> EMBED[🧠 Vector Embeddings]
    EMBED --> CHROMA
    CHROMA --> SEARCH[🔍 Semantic Search]
    SEARCH --> CHAT[💬 RAG Chat]

    FIRE --> RESUME[📄 Resume Generator]
    FIRE --> BIO[👨‍💼 Professional Bio]
    FIRE --> PORT[🌐 Portfolio Summary]
    FIRE --> DASH[📊 Analytics Dashboard]

Component Architecture

graph LR
    subgraph Frontend
        A[Next.js]
    end

    subgraph Backend
        B[FastAPI]
    end

    subgraph AI
        C[Gemini AI]
        D[Groq Fallback]
    end

    subgraph Storage
        E[Cloudinary]
        F[Firestore]
        G[ChromaDB]
    end

    subgraph Features
        H[Categorization]
        I[Relationship Engine]
        J[Timeline]
        K[Semantic Search]
        L[RAG Chat]
        M[Resume Generator]
        N[Analytics]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    B --> F
    B --> G

    C --> H
    H --> I
    I --> J

    G --> K
    K --> L

    F --> M
    F --> N

Deployment Architecture

flowchart LR
    User --> Vercel[▲ Vercel Frontend]
    Vercel --> Render[⚡ Render Backend]

    Render --> Firebase[(Firestore)]
    Render --> Cloudinary[(Cloudinary)]
    Render --> Gemini[(Gemini AI)]
    Render --> Groq[(Groq)]
    Render --> Chroma[(ChromaDB)]

Technology Stack

Layer| Technology
Frontend| Next.js, React, Tailwind CSS
Backend| FastAPI
Authentication| Firebase Authentication
Database| Cloud Firestore
AI Models| Gemini AI, Groq (Fallback)
Vector Database| ChromaDB
File Storage| Cloudinary
Deployment| Vercel, Render

Project Structure

mosaic-ai/

├── app/
├── backend/
├── components/
├── docs/
├── public/
├── lib/
└── README.md

Getting Started

Frontend

npm install
npm run dev

Backend

cd backend
pip install -r requirements.txt
python main.py

For environment variables and deployment instructions, refer to:

- "docs/INSTALL.md"
- "docs/ENV_VARS.md"
- "docs/DEPLOY.md"

Demo Flow

1. Sign in to Mosaic AI.
2. Upload academic or professional documents.
3. AI extracts structured information.
4. Documents are automatically categorized.
5. Related experiences are connected.
6. A digital timeline is generated.
7. Search documents using natural language.
8. Chat with uploaded documents.
9. Generate a resume or professional bio.

Current Limitations

- API keys must be configured before running locally.
- Render free tier does not provide persistent storage for the vector database.
- Avatar upload is not available yet.

Future Improvements

- Better multilingual document understanding
- Improved OCR support
- Mobile application
- Smarter relationship inference
- Enhanced analytics dashboard

Project Goal

Upload your documents once and never waste time searching through folders again.

By combining AI-powered document understanding, semantic search, relationship mapping, and timeline generation, Mosaic AI creates an intelligent digital identity that grows with the user throughout their academic and professional journey.
