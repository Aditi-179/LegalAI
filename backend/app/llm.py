import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Groq Client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("⚠️ GROQ_API_KEY not found in .env file!")

client = Groq(api_key=GROQ_API_KEY)

# We use Llama 3.1 8B because it is lightning fast and excellent at reasoning
MODEL_NAME = "llama-3.1-8b-instant"

def generate_legal_response(user_query: str, retrieved_contexts: list, chat_history: list = None) -> str:
    """
    Takes the user's question, previous conversation (chat_history),
    and retrieved laws, and generates a conversational legal response.
    """

    # 1. Format retrieved laws
    context_text = ""
    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx+1} ---\n"
            context_text += f"Act: {doc['act_name']}\n"
            context_text += f"Section {doc['section']}: {doc['title']}\n"
            context_text += f"Content: {doc['content']}\n\n"

    # 2. Format conversation history
    history_text = ""
    if chat_history:
        for msg in chat_history:
            history_text += f"{msg['role'].upper()}: {msg['content']}\n"

    # 3. System prompt (same but slightly stronger for context awareness)
    system_prompt = """
You are a friendly and supportive AI Legal Assistant helping common people in India.

Your goal is to have a NATURAL CONVERSATION, not just give structured answers.

IMPORTANT BEHAVIOR:
- Always consider the full conversation history
- If the user gives a short reply like "2 men", "yes", "no", treat it as CONTEXT CONTINUATION
- DO NOT restart the explanation from scratch every time
- CONTINUE from previous response

STYLE:
- Talk like a human
- Be empathetic
- Keep it simple

WHEN USER FIRST ASKS:
Give full structured answer:

Explanation:
...

Next Steps:
...

Where to Take Action:
...

Follow-up Questions:
...

WHEN USER REPLIES (FOLLOW-UP):
- Do NOT repeat full structure
- Respond conversationally
- Acknowledge what user said
- Expand or refine guidance

Example:
User: men harassed on train  
User: 2 men  

You should respond like:
"I understand, so two men were involved. That makes the situation more serious..."

Then continue guidance naturally.

Disclaimer:
This is AI-generated information, not professional legal advice.
"""

    # 4. Construct prompt with memory
    user_prompt = f"""
CONVERSATION HISTORY:
{history_text}

CURRENT USER INPUT:
{user_query}

RETRIEVED LEGAL CONTEXT:
{context_text}
"""

    # 5. Call Groq API
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=1024
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error communicating with AI: {str(e)}"