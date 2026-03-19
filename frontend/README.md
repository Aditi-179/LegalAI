# LegalAI

LegalAI is a full-stack Indian legal assistant workspace built around the frozen product scope:

- AI legal assistant for grounded Q&A
- IPC to BNS mapping
- Legal document explainer for PDF and TXT files
- Legal document drafter
- Basic authentication
- Logging and history storage

## Project structure

```text
LegalAI/
├── backend/
│   ├── app/
│   ├── data/
│   ├── scripts/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── docker/
├── docs/
└── README.md
```

## Backend

The backend uses FastAPI with SQLAlchemy and JWT auth.

Implemented endpoints:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/query`
- `GET /api/v1/map?code=420`
- `POST /api/v1/upload`
- `POST /api/v1/draft`
- `GET /api/v1/history`

### Run backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

The default database is local SQLite for quick startup. Set `DATABASE_URL` to PostgreSQL when you are ready for the production database phase.

## Frontend

The frontend uses Next.js App Router and connects to the backend through `NEXT_PUBLIC_API_BASE_URL`.

Pages included:

- `/`
- `/login`
- `/chat`
- `/mapping`
- `/upload`
- `/draft`
- `/history`

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env.local` file in `frontend/` if needed:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Docker

Basic Docker files are included for local containerized setup.

## Notes

- `backend/data/` is reserved for uploads and legal datasets.
- `backend/scripts/process_ipc.py` can still be used for dataset preparation.
- The current query workflow uses a conservative placeholder retrieval pipeline so the full RAG stack can be added next without rewriting the API surface.

