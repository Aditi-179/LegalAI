import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.1-8b-instant"

    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        context_text = ""
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx + 1} ---\n"
            context_text += f"Act: {doc['act_name']}\n"
            context_text += f"Section {doc['section']}: {doc['title']}\n"
            context_text += f"Content: {doc['content']}\n\n"


    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
