# ArogyaScribe — Deployment Guide

## Local Development

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/arogyascribe
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256

# OpenAI / Azure OpenAI
OPENAI_API_KEY=your_openai_key
ENDPOINT=your_azure_openai_endpoint

# AssemblyAI — Speech Transcription
ASSEMBLYAI_API_KEY=your_assemblyai_key

# Backblaze B2 — Audio Storage
B2_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_app_key
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_BUCKET_NAME=arogyascribe-audio
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Start the frontend:

```bash
npm run dev
```

---

## Production Deployment

### Backend (Render)

1. Connect your GitHub repository to [Render](https://render.com)
2. Render auto-detects `backend/render.yaml` — select **Use Blueprint**
3. Set the following environment variables in the Render dashboard:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Long random string for JWT signing |
| `OPENAI_API_KEY` | OpenAI or Azure OpenAI key |
| `ENDPOINT` | Azure OpenAI endpoint URL |
| `ASSEMBLYAI_API_KEY` | AssemblyAI key for transcription |
| `B2_KEY_ID` | Backblaze B2 key ID |
| `B2_APPLICATION_KEY` | Backblaze B2 application key |
| `B2_BUCKET_NAME` | Backblaze B2 bucket name |

4. Tables are created automatically on startup. For schema changes use scripts in `backend/scripts/`.

### Frontend (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Framework preset: **Vite**
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Set environment variable:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Deployed backend URL (e.g. `https://your-app.onrender.com/api/v1`) |

---

## Production Checklist

- [ ] Both frontend and backend served over HTTPS
- [ ] PostgreSQL used (not SQLite — ephemeral on Render)
- [ ] CORS origins in backend match the Vercel frontend URL
- [ ] `.env` file never committed to git
- [ ] API keys rotated regularly
- [ ] Database backups enabled

---

## Troubleshooting

| Issue | Fix |
|---|---|
| 500 on backend | Check Render logs — usually missing env vars or DB connection |
| CORS error | Verify `ALLOWED_ORIGINS` matches your Vercel URL |
| Transcription fails | Check AssemblyAI key and that audio file is not empty |
| B2 upload fails | Verify B2 credentials and bucket name |
| Reports not showing | Restart backend after code changes |

---

## Key Services

- **AssemblyAI** — speech-to-text transcription: https://www.assemblyai.com/docs
- **Backblaze B2** — audio file storage: https://www.backblaze.com/b2/docs
- **OpenAI** — SOAP note generation: https://platform.openai.com/docs
