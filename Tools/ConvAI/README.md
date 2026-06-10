# AI Interview Agent

An AI-powered scenario-based interview platform where trainers create tests, candidates join via voice sessions, and GPT evaluates performance with rubric-based scoring.

## Project Structure

```
Interview Agent/
├── backend/                  # Python FastAPI server
│   ├── main.py               # App entry-point
│   ├── database.py           # SQLAlchemy models + DB connection
│   ├── requirements.txt
│   ├── .env.example
│   ├── agents/
│   │   ├── interviewer.py    # AI question generation
│   │   └── evaluator.py      # AI scoring & evaluation
│   └── routes/
│       ├── tests.py          # Test CRUD
│       ├── interviews.py     # Interview sessions + STT/TTS
│       └── reports.py        # Evaluation reports
│
└── artifacts/interview-app/  # React + Vite frontend
    ├── src/
    │   ├── lib/api.ts         # Fetch client + React Query hooks
    │   └── pages/
    │       ├── dashboard.tsx
    │       ├── tests.tsx
    │       ├── reports.tsx
    │       ├── report-detail.tsx
    │       └── interview/
    │           ├── join.tsx
    │           └── session.tsx
    └── ...
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11 + |
| Node.js | 18 + |
| npm / pnpm / yarn | any |
| PostgreSQL | 14 + |

---

## 1 — Database setup

Create a PostgreSQL database (tables are auto-created on first backend start):

```sql
CREATE DATABASE interview_agent;
```

---

## 2 — Backend (Python FastAPI)

### Install dependencies

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Configure environment

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/interview_agent
OPENAI_API_KEY=sk-...

# Optional overrides
# CHAT_MODEL=gpt-4o
# TTS_MODEL=tts-1
# STT_MODEL=gpt-4o-mini-transcribe
```

### Run the backend

```bash
uvicorn main:app --reload --port 8000
```

Backend is now running at **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

## 3 — Frontend (React + Vite)

### Install dependencies

```bash
cd "artifacts/interview-app"
npm install        # or: pnpm install / yarn
```

### Run the frontend dev server

```bash
npm run dev
```

Frontend is now running at **http://localhost:5173**

The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:8000`, so no extra config is needed.

---

## 4 — Usage

### Trainer workflow
1. Open **http://localhost:5173**
2. Go to **Tests** → Create a new interview scenario with rubrics
3. Copy the interview link and share it with candidates

### Candidate workflow
1. Open the shared link (e.g. `http://localhost:5173/interview/test/1`)
2. Enter your name and start the voice interview
3. Speak your answers — the AI transcribes, asks follow-up questions, and evaluates automatically

### View reports
1. Go to **Reports** in the trainer dashboard
2. Click any completed interview to see the AI-generated score breakdown

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/tests` | List all tests |
| POST | `/api/tests` | Create a test |
| GET/PUT/DELETE | `/api/tests/{id}` | Get / update / delete test |
| GET | `/api/interviews` | List all interviews |
| POST | `/api/interviews` | Start an interview |
| GET | `/api/interviews/{id}` | Get interview + responses |
| POST | `/api/interviews/{id}/next-question` | AI generates next question |
| POST | `/api/interviews/{id}/responses` | Submit candidate answer |
| POST | `/api/interviews/{id}/transcribe` | Speech-to-text (base64 audio → text) |
| POST | `/api/interviews/{id}/tts` | Text-to-speech (text → base64 wav) |
| POST | `/api/interviews/{id}/complete` | Complete interview + trigger AI evaluation |
| GET | `/api/reports/{interviewId}` | Get evaluation report |

---

## Production build

```bash
# Build the React app
cd "artifacts/interview-app"
npm run build          # outputs to artifacts/interview-app/dist/

# Serve static files with FastAPI (add to backend/main.py):
# from fastapi.staticfiles import StaticFiles
# app.mount("/", StaticFiles(directory="../artifacts/interview-app/dist", html=True), name="static")

# Then run:
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```
