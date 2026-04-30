import json
from typing import List, Dict
from googlesearch import search
from groq import Groq
import os
from app.schemas.schemes import SchemeSearchResponse, Scheme

def search_schemes(query: str) -> SchemeSearchResponse:
    """
    GovScheme-Agent logic with AI Knowledge Fallback:
    1. Try live search
    2. If live search fails/returns 0, use AI internal knowledge
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    # 1. LIVE SEARCH
    search_query = f"{query} Indian Government official scheme"
    results_text = ""
    
    try:
        # Try to get some URLs
        search_results = list(search(search_query, num_results=5, lang="en"))
        for url in search_results:
            results_text += f"Link: {url}\n"
    except Exception as e:
        pass

    # 2. AI EXTRACTION / GENERATION
    # Even if results_text is empty, we proceed and tell the AI to use its internal database
    system_prompt = """
    You are "GovScheme-Agent", a specialized legal AI for Indian citizens. 
    Your job is to identify 3 to 5 highly relevant Indian government schemes or scholarships based on the user's intent.
    
    STRICT JSON OUTPUT FORMAT:
    {
      "search_query": "<user's intent>",
      "schemes":[
        {
          "scheme_name": "<Exact name of the scheme>",
          "short_description": "<Brief summary>",
          "eligibility": "<Key eligibility criteria>",
          "benefits": "<Main benefits>",
          "official_link": "<Official government website URL (ending in .gov.in or .nic.in)>"
        }
      ]
    }
    
    INSTRUCTIONS:
    - If search results are provided, use them.
    - If search results are EMPTY or missing, use your extensive INTERNAL KNOWLEDGE to find the most accurate and popular ACTIVE Indian government schemes for the query.
    - Focus on schemes like Sukanya Samriddhi Yojana (for girl child), PM-Kisan (for farmers), etc.
    - ALWAYS ensure the `official_link` is a genuine .gov.in or .nic.in portal.
    - Output ONLY the raw JSON.
    """
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"User Search Intent: '{query}'\nSearch Context: {results_text if results_text else 'No live search results available. Use internal knowledge.'}"}
            ],
            response_format={"type": "json_object"}
        )
        
        raw_json = completion.choices[0].message.content
        data = json.loads(raw_json)
        
        return SchemeSearchResponse(**data)
    except Exception as e:
        print(f"AI Extraction error: {e}")
        return SchemeSearchResponse(search_query=query, schemes=[])
