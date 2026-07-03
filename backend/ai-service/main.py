import logging
import time
import os
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from pydantic import BaseModel

from modules.llm_engine import LLMEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

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
    logger.info("LLMEngine initialized with Groq")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/generate-captions")
async def generate_captions(request: CaptionRequest):
    try:
        feature_brief = {
            "name": request.feature_name,
            "description": request.description,
            "benefit": request.key_benefit,
        }

        start = time.time()
        result = llm_engine.generate_captions(
            feature_brief, request.platform, request.tone
        )
        elapsed = time.time() - start
        logger.info(f"Generated {request.platform} caption in {elapsed:.2f}s")

        if "error" in result:
            raise HTTPException(status_code=502, detail=result["error"])

        result["variants"] = llm_engine.generate_variants(
            feature_brief, request.platform, request.tone, num_variants=2
        )

        return {
            "success": True,
            "data": result,
            "generated_at": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating caption: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-captions-stream")
async def generate_captions_stream(request: CaptionRequest):
    feature_brief = {
        "name": request.feature_name,
        "description": request.description,
        "benefit": request.key_benefit,
    }

    async def event_stream():
        for sse_event in llm_engine.generate_captions_stream(
            feature_brief, request.platform, request.tone
        ):
            yield sse_event

    return StreamingResponse(event_stream(), media_type="text/event-stream")
