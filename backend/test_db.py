"""Quick DB connection diagnostic. Run: python test_db.py"""
import os

# Force .env values to override any system environment variables
from dotenv import load_dotenv
load_dotenv(override=True)

url = os.getenv("DATABASE_URL", "")
print(f"DATABASE_URL loaded : {'yes' if url else 'NO - missing from .env'}")
print(f"URL (masked)        : {url[:60]}...")
print(f"Port in use         : {'5432' if ':5432/' in url else '6543' if ':6543/' in url else 'unknown'}")
print(f"sslmode=require     : {'yes' if 'sslmode=require' in url else 'no'}")
print()

try:
    import psycopg2
except ImportError:
    print("psycopg2 not installed. Run: pip install psycopg2-binary")
    raise SystemExit(1)

try:
    conn = psycopg2.connect(url, connect_timeout=10)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    ver = cur.fetchone()
    print(f"Connection          : SUCCESS ✅")
    print(f"Postgres version    : {ver[0][:60]}")

    cur.execute("SELECT extname FROM pg_extension WHERE extname = 'vector';")
    pgvec = cur.fetchone()
    print(f"pgvector extension  : {'ENABLED ✅' if pgvec else 'NOT ENABLED ❌  — run in Supabase SQL editor: CREATE EXTENSION vector;'}")

    cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name = 'legal_documents';")
    tbl = cur.fetchone()
    has_table = tbl and tbl[0] > 0
    print(f"legal_documents tbl : {'exists' if has_table else 'does NOT exist yet'}")

    if has_table:
        cur.execute("SELECT COUNT(*) FROM legal_documents;")
        cnt = cur.fetchone()
        print(f"legal_documents rows: {cnt[0]}")

    conn.close()

except Exception as exc:
    print(f"Connection          : FAILED ❌")
    print(f"Error               : {exc}")
    print()
    print("Common fixes:")
    print("  1. Go to https://supabase.com/dashboard and check if project is PAUSED")
    print("  2. Click 'Restore project' if paused (free tier pauses after inactivity)")
    print("  3. Verify project ref 'rwshcymywlwraxkgfrls' matches your Supabase project")
