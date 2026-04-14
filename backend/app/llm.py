import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.1-8b-instant"


def generate_legal_response(user_query: str, retrieved_contexts: list, chat_history: list = None) -> str:
    """
    Generates conversational legal response using Groq
    """

    # ✅ 1. Format retrieved laws
    context_text = ""
    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx + 1} ---\n"
            context_text += f"Act: {doc.get('act_name', '')}\n"
            context_text += f"Section {doc.get('section', '')}: {doc.get('title', '')}\n"
            context_text += f"Content: {doc.get('content', '')}\n\n"

    # ✅ 2. Format chat history
    history_text = ""
    if chat_history:
        for msg in chat_history:
            history_text += f"{msg['role'].upper()}: {msg['content']}\n"

    # ✅ 3. System prompt
    system_prompt = """
You are a friendly AI Legal Assistant.

- Speak in simple English
- Be conversational
- Continue context from previous messages
- Don't repeat full structure every time
- Help user step-by-step

Always end with:
Disclaimer: This is AI-generated information, not professional legal advice.
"""

    # ✅ 4. Final prompt
    user_prompt = f"""
CONVERSATION HISTORY:
{history_text}

USER QUESTION:
{user_query}

LEGAL CONTEXT:
{context_text}
"""

    # ✅ 5. Call Groq
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=1024
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"