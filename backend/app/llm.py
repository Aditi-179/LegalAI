import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.1-8b-instant"

def generate_legal_response(user_query, retrieved_contexts, chat_history=None):
    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        context_text = ""
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx + 1} ---\n"
            context_text += f"Act: {doc.get('act_name', 'Unknown')}\n"
            context_text += f"Section {doc.get('section', 'Unknown')}: {doc.get('title', 'Unknown')}\n"
            context_text += f"Content: {doc.get('content', 'Unknown')}\n\n"

    system_prompt = "You are a helpful and knowledgeable Indian legal AI assistant. Use the provided legal context to answer the user's query accurately."
    user_prompt = f"Context:\n{context_text}\n\nUser Query: {user_query}\n\nPlease provide a legally sound answer based on the above context."

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
