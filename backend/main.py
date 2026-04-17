import os
import uvicorn
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="Vocalis Brain API - AI Mode (Replit Ready)")

# Allow Next.js frontend to communicate securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional: Add your OpenAI API Key into the environment variables (.env in local or Secrets in Replit)
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

class Command(BaseModel):
    text: str

SYSTEM_PROMPT = """
You are Vocalis, a highly intelligent voice assistant built for the web.
Your job is to parse the user's transcription text and decide the best action to take.

You MUST respond strictly in valid JSON matching this exact structure:
{
  "success": true,
  "action": "open_url" | "speak",
  "response": "The brief text you will speak out loud to the user.",
  "url": "optional url if action is open_url"
}

RULES:
1. Keep the 'response' extremely concise, as it will be read via Text-to-Speech immediately. It should sound conversational but very fast.
2. If the user asks to open a recognizable website, use action "open_url" and provide the correct "url".
3. If the user asks an informational question, answer it directly in the 'response' and set action to "speak".
4. If a user asks to search for something, use action "open_url" and construct the search query URL (e.g., https://www.google.com/search?q=query) in the 'url' field.
5. Never provide conversational filler outside the JSON. Return ONLY JSON.
"""

@app.post("/process")
async def process_command(cmd: Command):
    user_input = cmd.text.strip()
    print(f"[INTENT PARSER] Received command: {user_input}")

    # Fallback if no OpenAI Key is attached
    if not client:
        return {
            "success": False,
            "action": "speak",
            "response": "Agent is online but no OpenAI API key was found in the environment secrets. Please configure it."
        }
        
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User Transcript: {user_input}"}
            ]
        )
        
        # Parse the JSON returned by the model
        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)
        
        print(f"[INTENT PARSER] Evaluation: {result_json}")
        return result_json
        
    except Exception as e:
        print(f"Error parsing intent via OpenAI: {e}")
        return {
            "success": False,
            "action": "speak",
            "response": "I encountered an internal error while processing your request to the neural net."
        }

@app.get("/health")
def health_check():
    return {"status": "active", "brain": "autonomous_llm_mode", "openai_configured": bool(client)}

# Required for Replit one-click startup capabilities
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
