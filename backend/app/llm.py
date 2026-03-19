import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=GROQ_API_KEY)
MODEL_NAME = "llama-3.1-8b-instant"


def generate_legal_response(user_query: str, retrieved_contexts: list) -> str:
    """
    Ask Groq to generate a grounded legal explanation from retrieved contexts.
    """
    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        context_text = ""
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx + 1} ---\n"
            context_text += f"Act: {doc['act_name']}\n"
            context_text += f"Section {doc['section']}: {doc['title']}\n"
            context_text += f"Content: {doc['content']}\n\n"

    system_prompt = """
    You are an expert Indian Legal Assistant. Your job is to explain Indian laws to common citizens in simple, easy-to-understand English.

    RULES:
    1. You MUST base your answer ONLY on the 'Retrieved Legal Context' provided below.
    2. If the context does not contain the answer, you MUST say: "I'm sorry, I cannot find the exact law for this in my database." Do not hallucinate or guess.
    3. Always cite the specific Act and Section number (e.g., "According to Section 420 of the IPC...").
    4. Keep your answer structured, using bullet points if necessary.
    5. Add a disclaimer at the end stating: "Disclaimer: This is AI-generated information, not professional legal advice."
    """

    user_prompt = f"""
    USER QUESTION: {user_query}

    RETRIEVED LEGAL CONTEXT:
    {context_text}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"
