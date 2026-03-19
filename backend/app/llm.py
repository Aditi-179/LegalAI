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

def generate_legal_response(user_query: str, retrieved_contexts: list) -> str:
    """
    Takes the user's question and the laws retrieved from Supabase,
    and asks Groq to generate a simple, accurate legal explanation.
    """
    
    # 1. Format the retrieved laws into a single readable string for the AI
    context_text = ""
    if not retrieved_contexts:
        context_text = "No specific laws were found in the database."
    else:
        for idx, doc in enumerate(retrieved_contexts):
            context_text += f"--- LAW {idx+1} ---\n"
            context_text += f"Act: {doc['act_name']}\n"
            context_text += f"Section {doc['section']}: {doc['title']}\n"
            context_text += f"Content: {doc['content']}\n\n"

    # 2. The System Prompt (The AI's rules)
    system_prompt = """
You are an expert Indian Legal Assistant. Your job is to explain Indian laws to common citizens in simple, easy-to-understand English.

RULES:
1. You MUST base your answer ONLY on the 'Retrieved Legal Context' provided below.
2. If the context does not contain the answer, you MUST say: "I'm sorry, I cannot find the exact law for this in my database." Do not hallucinate or guess.
3. Always cite the specific Act and Section number (e.g., "According to Section 420 of the IPC...").
4. Keep your answer simple and structured.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

Explanation:
Explain the law in simple language.

Next Steps:
Give 3-5 clear actionable steps the user should take.

Important Notes:
Mention documents needed, warnings, or precautions.

Disclaimer:
This is AI-generated information, not professional legal advice.
"""

    # 3. Construct the prompt
    user_prompt = f"""
    USER QUESTION: {user_query}
    
    RETRIEVED LEGAL CONTEXT:
    {context_text}
    """

    # 4. Call the Groq API
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3, # Low temperature means more factual, less creative
            max_tokens=1024
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Error communicating with AI: {str(e)}"