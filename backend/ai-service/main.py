import logging
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="AI Content Service")

from modules.llm_engine import LLMEngine

engine = LLMEngine(api_key=os.getenv("GROQ_API_KEY", ""))


class GenerateRequest(BaseModel):
    briefId: str
    featureName: str
    description: str
    keyBenefit: str
    platforms: list[str]
    tone: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/generate-captions")
async def generate_captions(req: GenerateRequest):
    feature_brief = {
        "name": req.featureName,
        "description": req.description,
        "benefit": req.keyBenefit,
        "platforms": req.platforms,
        "tone": req.tone,
    }

    platform = req.platforms[0]
    tone = req.tone

    start = time.time()
    result = engine.generate_captions(feature_brief, platform, tone)
    elapsed = time.time() - start
    logger.info(f"Generated {platform} caption in {elapsed:.2f}s")

    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])

    result["variants"] = engine.generate_variants(
        feature_brief, platform, tone, num_variants=2
    )

    return {"success": True, "data": result}
