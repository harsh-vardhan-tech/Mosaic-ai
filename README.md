# 🧩 Mosaic AI — Digital Identity System

> **MemoryVerse AI '26 Submission** | *Transforming scattered documents into an intelligent, connected digital journey.*

![Mosaic AI Banner](https://img.shields.io/badge/MemoryVerse%20AI%20'26-Submission-6C5CE7?style=for-the-badge&logo=mosaic&logoColor=white)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-FC6D26?style=for-the-badge&logo=database&logoColor=white)](https://www.trychroma.com/)

---

## 🎯 The Core Problem & Solution

Students collect certificates, resumes, internship letters, and project reports across multiple cloud drives and folders. Traditional storage platforms save files, but they cannot **understand** a student's journey.

> **The Goal:** *"Upload your documents once, and never waste time searching through folders again."*

**Mosaic AI** converts unstructured, scattered documents into a **structured, connected, and searchable knowledge graph and digital identity timeline**.

---

## 🚀 Key Modules Solved (Wooble Challenge Brief)

### 1. 📄 AI Data Ingestion
* Ingests Certificates, Resumes, Project Reports, Internship Letters, and Academic documents.
* Automated text extraction, OCR parsing, and structured metadata generation.

### 2. 🏷️ Intelligent Categorization
Automatically tags and buckets content into:
`Projects` • `Skills` • `Certifications` • `Internships` • `Achievements` • `Academics`

### 3. 🔗 Knowledge & Relationship Engine
Identifies hidden relationships across data:
```text
[ Certification: Python ] ──► [ Skill: Data Science ] ──► [ Project: AI Model ] ──► [ Internship: ML Lead ]

4. ⏳ Digital Journey Timeline
Chronological growth history mapping:

 2023 ───► [ Certification ] Python Basics & Data Structures
 2024 ───► [ Project ]       Full-Stack Web Development App
 2025 ───► [ Internship ]    Software Engineering Intern at XYZ
 2026 ───► [ Identity ]      AI/ML Project Portfolio & Mosaic AI

🔍 Module 5: Smart Retrieval System (RAG)
Natural Language Querying: "Show my AI projects", "Show internship documents", "Show latest resume".
RAG Chat: Interactive conversation directly with your documents without altering original file formats.
🏗️ System Architecture & Workflow

  ┌─────────────────────────────────────────────────────────┐
  │                 User Upload (Files/Links)               │
  │     (PDFs, Resumes, Certificates, Internship Letters)   │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │         Document Parsing & OCR Extraction Layer         │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                  Google Gemini AI Engine                │
  │      (NLP Metadata Extraction & Categorization)         │
  └────────────────────────────┬────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│    Vector Embeddings (RAG)    │     │      Relationship Engine      │
│  Store in ChromaDB Vector DB  │     │   Maps Skill ➔ Project ➔ Work │
└───────────┬───────────────────┘     └───────────────┬───────────────┘
            │                                         │
            ▼                                         ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ Natural Language Search & Chat│     │  Digital Identity Dashboard,  │
│     (Retrieval-Augmented)     │     │   Timeline & Resume Generator │
└───────────────────────────────┘     └───────────────────────────────┘


🛠️ Technology Stack

ComponentTechnology
Frontend UINext.js 14, React, Tailwind CSS
Backend APIFastAPI (Python)
AuthenticationFirebase Authentication
DatabaseCloud Firestore
AI ModelsGoogle Gemini AI (Fallback: Groq API)
Vector DB / RAGChromaDB + Sentence Embeddings
File PreservanceCloudinary
DeploymentVercel (Frontend), Render (Backend)

📂 Project Structure
mosaic-ai/
├── 📁 app/               # Next.js App Router (Dashboard, Timeline, Chat UI)
├── 📁 backend/           # FastAPI backend server
│   ├── main.py           # API endpoints
│   ├── rag_engine.py     # ChromaDB & Vector Search implementation
│   └── extractor.py      # Gemini AI document parser
├── 📁 components/        # Reusable UI components (Timeline, Search Bar, Cards)
├── 📁 docs/              # Detailed documentation
│   ├── INSTALL.md        # Step-by-step setup guide
│   ├── ENV_VARS.md       # Environment configuration reference
│   └── DEPLOY.md         # Deployment steps for Vercel & Render
├── 📁 lib/               # Utility functions and API clients
└── README.md             # Project documentation

⚡ Quick Start & Local Setup
1. Prerequisites
Node.js (v18+)
Python (3.9+)
2. Frontend Setup

# Clone the repository
git clone [https://github.com/your-username/mosaic-ai.git](https://github.com/your-username/mosaic-ai.git)
cd mosaic-ai

# Install dependencies
npm install

# Start development server
npm run dev


3. Backend Setup

# Navigate to backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run FastAPI server
python main.py


📊 Wooble Evaluation Criteria Alignment

Criteria WeightFeature Implementation in Mosaic AI
AI Organization (40%)Fully automated Gemini metadata extraction and dynamic 6-tier classification.
AI/ML Techniques (25%)RAG implementation using ChromaDB vector database and semantic embeddings.
Innovation & UX (20%)Visual digital timeline, identity mapping, and zero-folder retrieval.
Clarity & Architecture (15%)Modular full-stack code, clear workflow diagrams, and documented setup.


⚠️ Current Limitations & Roadmap
[x] Document ingestion & dynamic relationship mapping
[x] RAG-powered natural language chat
[ ] Multilingual OCR support for physical handwritten certificates
[ ] iOS & Android mobile companion application
<p align="center">Made with ❤️ for <b>Wooble MemoryVerse AI '26</b></p>

