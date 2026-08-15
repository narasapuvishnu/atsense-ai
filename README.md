# ATSense — AI-Powered Resume Intelligence

> **"Understand your resume. Match your opportunity. Improve your chances."**

ATSense is a full-stack AI application that analyzes your resume against a job description using a genuine RAG (Retrieval-Augmented Generation) pipeline — delivering an AI-estimated ATS compatibility score backed by semantic evidence.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Bootstrap 5 + Custom CSS |
| Animations | Framer Motion |
| Backend | Node.js + Express.js + TypeScript |
| Embeddings | Transformers.js (`Xenova/all-MiniLM-L6-v2`) |
| Vector Database | Qdrant Cloud |
| LLM | Groq API (LLaMA 3 70B) |
| Validation | Zod |
| File Upload | Multer |
| PDF Parsing | pdf-parse |
| DOCX Parsing | mammoth |

---

## Prerequisites

- Node.js 18+
- A free [Qdrant Cloud](https://cloud.qdrant.io) account
- A free [Groq API](https://console.groq.com) key

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ATSense
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama3-70b-8192

QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key

TOP_K=5
```

### 3. Run in development

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
ATSense/
├── client/                        # React frontend
│   └── src/
│       ├── components/            # Reusable UI components
│       │   └── results/           # Dashboard sub-components
│       ├── pages/                 # Page-level components
│       ├── layouts/               # Route layouts
│       ├── hooks/                 # Custom React hooks
│       ├── services/              # API client
│       ├── types/                 # TypeScript interfaces
│       ├── utils/                 # Formatters / helpers
│       └── styles/                # CSS design system
│
├── server/                        # Node.js backend
│   └── src/
│       ├── controllers/           # Route handlers
│       ├── routes/                # Express routers
│       ├── middleware/            # Error handler, upload, logger
│       ├── services/              # Business logic
│       │   ├── resumeParser       # PDF/DOCX extraction
│       │   ├── documentChunker    # Semantic chunking
│       │   ├── embedding          # Transformers.js embeddings
│       │   ├── qdrant             # Vector store operations
│       │   ├── jobAnalyzer        # JD parsing
│       │   ├── rag                # RAG retrieval
│       │   ├── groq               # LLM evaluation
│       │   └── atsScoring         # Score normalization
│       └── schemas/               # Zod validation schemas
│
├── .env.example
├── .gitignore
└── README.md
```

---

## RAG Pipeline

```
Resume Upload
    ↓
Text Extraction (pdf-parse / mammoth)
    ↓
Semantic Chunking (section-aware)
    ↓
Sentence Transformer Embeddings (Transformers.js)
    ↓
Qdrant Vector Store (upsert chunks)
    ↓
Job Description Analysis (extract requirements)
    ↓
Requirement Embeddings (Transformers.js)
    ↓
Cosine Similarity Search (Qdrant Top-K)
    ↓
Retrieved Resume Evidence
    ↓
Groq LLM Contextual Evaluation
    ↓
ATSense Score + Evidence Report
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/resume/upload` | Upload and index resume |
| POST | `/api/job-description/process` | Parse JD text |
| POST | `/api/job-description/upload` | Parse JD file |
| POST | `/api/analysis/start` | Start analysis pipeline |
| GET | `/api/analysis/:id` | Poll for results |

---

## Scoring Model

| Category | Weight |
|---|---|
| Required Skills | 30 pts |
| Experience | 20 pts |
| Responsibilities | 15 pts |
| Technical Keywords | 15 pts |
| Projects | 10 pts |
| Education / Certifications | 5 pts |
| ATS Readability | 5 pts |
| **Total** | **100 pts** |

| Score | Match Level |
|---|---|
| 90–100 | Exceptional Match |
| 80–89 | Strong Match |
| 70–79 | Good Match |
| 60–69 | Moderate Match |
| 40–59 | Weak Match |
| 0–39 | Low Match |

---

## Disclaimer

ATSense provides an AI-based compatibility estimate. Actual ATS scoring varies between employers and recruitment systems.
