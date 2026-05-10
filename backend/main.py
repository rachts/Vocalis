import os
import uvicorn
import json
import asyncio
import requests
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

app = FastAPI(title="Vocalis Brain API - Operator Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.environ.get("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None
SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

def fetch_news(topic="latest news India"):
    url = "https://google.serper.dev/news"
    payload = {"q": topic, "gl": "in", "hl": "en"}
    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        articles = data.get("news", [])[:5]

        headlines = [
            {
                "title": article["title"],
                "link": article["link"],
                "source": article.get("source", "")
            }
            for article in articles
        ]
        return headlines
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

class Command(BaseModel):
    text: str

SYSTEM_PROMPT = """
You are Vocalis, an advanced, highly intelligent voice operator built for the web.
You do not act like a conversational chatbot. You act like a system operator (like JARVIS).
Your personality is: Calm, Precise, Slightly formal, Confident.

Your job is to parse the user's transcript and decide the best execution path.

You MUST respond strictly in valid JSON matching this exact structure:
{
  "intent": "search" | "navigate" | "inform" | "execute",
  "action": "open_url" | "speak" | "system_command",
  "target": "Name of the target entity (e.g., YouTube, Google, Volume)",
  "url": "optional url to open if action is open_url",
  "speech": "The short text you will speak as you execute the task. It should sound like an operator stating an action, not a chat. E.g., 'Searching YouTube for React tutorials', or 'Task completed.'"
}

RULES:
1. Always narrate what you are doing in the 'speech' field. Keep it very brief and confident.
2. If opening a site, construct the correct 'url'. (e.g., https://www.youtube.com/results?search_query=query for youtube searches).
3. If the user asks a question, set intent to 'inform', action to 'speak', and answer confidently in 'speech'.
4. Never provide conversational filler. Only JSON.
"""

async def process_stream(user_input: str):
    user_lower = user_input.lower()
    
    # Custom News Interceptor
    if "news" in user_lower:
        yield json.dumps({"status": "Accessing global news network..."}) + "\n"
        await asyncio.sleep(0.3)
        
        query = "latest news India"
        if "tech" in user_lower: query = "technology news"
        elif "ai" in user_lower: query = "AI and artificial intelligence news"
        elif "sports" in user_lower: query = "latest sports news"
        
        headlines = fetch_news(query)
        
        if not headlines:
            yield json.dumps({"speech": "I couldn't fetch the news at this moment.", "status": "Failed"}) + "\n"
            return
            
        summary = "Here are the top stories right now. "
        for h in headlines[:3]:
            summary += h["title"] + ". "
            
        yield json.dumps({
            "intent": "news_fetch",
            "speech": summary,
            "data": headlines
        }) + "\n"
        return

    # Operator Mode Simulation - Stream reasoning steps
    yield json.dumps({"status": "Parsing neural intent..."}) + "\n"
    await asyncio.sleep(0.3)
    
    if not client:
        yield json.dumps({"speech": "System error. OpenAI API key is missing. Neural net offline.", "status": "Failed"}) + "\n"
        return
        
    try:
        # We start yielding an indication that we are consulting the LLM
        yield json.dumps({"status": "Routing command to execution layer..."}) + "\n"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"User Transcript: {user_input}"}
            ]
        )
        
        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)
        
        # Stream the found intent as a status
        yield json.dumps({"status": f"Intent confirmed: {result_json.get('intent', 'unknown').upper()}"}) + "\n"
        await asyncio.sleep(0.2)
        
        # Yield the final actionable JSON chunk
        yield json.dumps(result_json) + "\n"
        
    except Exception as e:
        print(f"Error parsing intent via OpenAI: {e}")
        yield json.dumps({"speech": "I encountered an internal failure while accessing the neural net.", "status": "Failed", "error": str(e)}) + "\n"


@app.post("/process")
async def process_command(cmd: Command):
    user_input = cmd.text.strip()
    print(f"[INTENT PARSER] Received command: {user_input}")
    
    return StreamingResponse(process_stream(user_input), media_type="application/x-ndjson")

@app.get("/health")
def health_check():
    return {"status": "active", "brain": "autonomous_operator_mode", "openai_configured": bool(client)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
