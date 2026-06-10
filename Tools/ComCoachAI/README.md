# ComCoach AI - Communication Evaluation System

AI-powered platform for evaluating communication skills using speech recognition and LLM-based assessment.

## Features

- ✅ Custom communication scenarios
- ✅ Trainer-defined rubrics
- ✅ Automatic speech-to-text
- ✅ AI-powered evaluation
- ✅ Instant participant feedback
- ✅ Excel reports & analytics
- ✅ Dashboard for trainers

## Installation

### 1. Prerequisites
- Python 3.9+
- Node.js 20+
- PostgreSQL
- FFmpeg

### 2. Install FFmpeg
**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 3. Create PostgreSQL Database
```bash
sudo -u postgres psql
CREATE DATABASE comcoach_db;
CREATE USER comcoach_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE comcoach_db TO comcoach_user;
\q
```

### 4. Clone & Setup
```bash
# Clone repository
git clone <your-repo-url>
cd comcoach-ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend-next
npm install
cd ..

# Create directories
mkdir uploads reports
```

### 5. Configure Environment
Create `.env` file:
```env
DATABASE_URL=postgresql://comcoach_user:your_password@localhost:5432/comcoach_db
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-secret-key-generate-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HOST=0.0.0.0
PORT=8000
```

## Running the Application

### Start Backend API
```bash
cd comcoach-ai
source venv/bin/activate
python -m backend.main
```

Backend runs at: http://localhost:8000

### Start Frontend (Next.js)
```bash
cd comcoach-ai
cd frontend-next
COMCOACH_API_BASE_URL=http://127.0.0.1:8000/api npm run dev -- --hostname 127.0.0.1 --port 3000
```

Frontend runs at: http://localhost:3000

## API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Usage

### For Trainers:
1. Register/Login on Trainer Dashboard
2. Create test with scenario and rubric
3. Share test code with participants
4. View results and download reports

### For Participants:
1. Enter test code
2. Register with name
3. Read scenario
4. Record audio response
5. Get instant feedback

## Project Structure
```
comcoach-ai/
├── backend/          # FastAPI backend
├── frontend-next/    # Next.js UI
├── uploads/          # Audio files
├── reports/          # Excel reports
├── requirements.txt
├── .env
└── README.md
```

## Technology Stack
- **Backend:** FastAPI
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Database:** PostgreSQL
- **AI:** OpenAI (Whisper + GPT-4)
- **Audio:** FFmpeg + librosa

## Cost Estimate
- Speech-to-text: ~₹0.20/test
- LLM evaluation: ~₹0.15/test
- Total: ~₹0.35/participant

## Support
For issues, contact: support@comcoach.ai
