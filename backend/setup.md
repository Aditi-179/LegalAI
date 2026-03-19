# Legal AI Backend - Setup Guide

This guide will help you set up and run the FastAPI backend for the Legal AI project.

## 1. Prerequisites
- Python 3.10+
- Git

## 2. Initial Setup
1.  **Clone the repository:**
    ```bash
    git clone <your_repo_url>
    cd LegalAI
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Inside the 'backend' folder
    cd backend
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## 3. Environment Variables (IMPORTANT!)
The project requires secret keys to connect to the database and the AI model. These are stored in a `.env` file.

1.  **Create your own `.env` file** by copying the example template:
    ```bash
    # (Still inside the 'backend' folder)
    copy .env.example .env
    ```

2.  **Get the secret values** from the project lead (privately!) and paste them into your new `.env` file. You will need:
    - `DATABASE_URL`
    - `GROQ_API_KEY`

    **DO NOT COMMIT YOUR `.env` FILE TO GIT!**

## 4. Running the Backend Server
Make sure your terminal is in the `backend` folder and your `venv` is active.
```bash
uvicorn app.main:app --reload