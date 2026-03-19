# LegalAI Architecture

## Current foundation

- `frontend/` hosts the Next.js product workspace.
- `backend/` hosts the FastAPI API, auth, storage models, and feature routes.
- `backend/data/` stores uploads and legal datasets.
- `docker/` contains container definitions for local deployment.

## Next build steps

1. Replace placeholder retrieval with embeddings and a vector store.
2. Add PostgreSQL migrations and move off local SQLite.
3. Expand structured IPC-BNS seed data into a full dataset import.
4. Add test coverage for auth, queries, uploads, and draft generation.

