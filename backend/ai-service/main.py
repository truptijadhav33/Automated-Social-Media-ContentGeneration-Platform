import os
from datetime import datetime

from fastapi import FastAPI
from dotenv import load_dotenv
from pydantic import BaseModel

from modules.llm_engine import LLMEngine

load_dotenv()

app = FastAPI(title="AI Content Service")

llm_engine: LLMEngine | None = None


class CaptionRequest(BaseModel):
    feature_name: str
    description: str
    key_benefit: str
    tone: str
    platform: str


@app.on_event("startup")
async def startup_event():
    global llm_engine
    llm_engine = LLMEngine(os.getenv("GROQ_API_KEY"))
    print("[OK] LLMEngine initialized with Groq")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/generate-captions")
async def generate_captions(request: CaptionRequest):
    try:
        result = llm_engine.generate_captions(
            {
                "name": request.feature_name,
                "description": request.description,
                "benefit": request.key_benefit,
            },
            request.platform,
            request.tone,
        )
        return {
            "success": True,
            "data": result,
            "generated_at": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "error": str(e)}, 500
