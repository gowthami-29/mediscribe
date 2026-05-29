# ⚕️ ArogyaScribe

**ArogyaScribe** is a state-of-the-art, AI-powered clinical documentation platform designed to revolutionize the way healthcare professionals handle patient consultations. By leveraging advanced speech-to-text and large language models (GPT-4), ArogyaScribe automates the generation of SOAP (Subjective, Objective, Assessment, Plan) notes, allowing doctors to focus more on patient care and less on paperwork.

---

## ✨ Key Features

- 🎙️ **Live Consultation Recording** — Real-time audio capture with high-fidelity AssemblyAI transcription.
- 📋 **Automated SOAP Notes** — GPT-4 powered intelligence that transforms raw transcripts into structured clinical documentation.
- 🤖 **AI Document Analysis** — Upload medical records (PDFs/Images) for automated entity extraction and clinical review.
- 👥 **Comprehensive Patient Management** — Full-featured electronic health records with medical history, allergies, and medications.
- 📄 **Dynamic Reports** — View, edit, and export clinical notes in multiple formats including PDF and DOCX.
- 📊 **Intelligent Analytics** — Real-time KPIs and trends to track productivity and time saved.
- 🛡️ **Hardened Audit Trail** — HIPAA-aligned event logging for all clinical and administrative actions.
- 🔐 **Secure RBAC** — Enterprise-grade JWT authentication with Role-Based Access Control (Admin, Practitioner, Supervisor).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Variables |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **AI/ML** | [OpenAI GPT-4](https://openai.com/) / [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) |
| **Transcription** | [AssemblyAI](https://www.assemblyai.com/) |
| **Cloud Storage** | [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) |

---

## 🚀 Getting Started

Follow the detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md) to set up your local environment.

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/gowthami-29/arogyascribe.git
cd arogyascribe

# 2. Spin up the Backend
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Spin up the Frontend
cd ../frontend
npm install
npm run dev
```

---

## 📄 License & Author

Developed  by **Thummala Khalida** and **Gowthami Kanchi**.  
ArogyaScribe — Empowering Healthcare through AI.

