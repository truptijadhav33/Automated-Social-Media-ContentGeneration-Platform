import json
import re
import html

from openai import OpenAI
from openai import (
    APITimeoutError,
    RateLimitError,
    APIError,
)


def _sanitize(text: str) -> str:
    """Escape HTML entities and strip control characters to prevent prompt injection."""
    text = html.escape(text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    return text.strip()


class LLMEngine:
    """LLM integration engine that generates social media captions via Groq's free API."""

    PLATFORM_SPECS = {
        "linkedin": {
            "max_chars": 3000,
            "style": "professional, detailed, value-driven",
            "hashtag_style": "2-3 relevant hashtags at the end",
        },
        "twitter": {
            "max_chars": 280,
            "style": "punchy, concise, attention-grabbing",
            "hashtag_style": "1-2 hashtags woven naturally",
        },
        "instagram": {
            "max_chars": 2200,
            "style": "engaging, visual-descriptive, community-oriented",
            "hashtag_style": "caption first, then a separate block of 5-10 hashtags",
        },
        "whatsapp": {
            "max_chars": 1024,
            "style": "short, conversational, personal",
            "hashtag_style": "no hashtags",
        },
    }

    TONE_GUIDES = {
        "professional": "Use formal language, industry terminology, and a confident tone.",
        "hype": "Use energetic language, emojis sparingly, and enthusiastic phrasing.",
        "informative": "Use clear, factual language. Educate the reader step by step.",
        "casual": "Use friendly, everyday language as if talking to a peer.",
    }

    def __init__(self, api_key: str):
        """Initialise the LLM engine with a Groq API key."""
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        self.model = "llama-3.3-70b-versatile"

    def _build_prompt(
        self,
        brief: dict,
        platform: str,
        tone: str,
    ) -> str:
        """Build a detailed prompt string based on the feature brief, platform, and tone."""
        spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS["linkedin"])
        tone_guide = self.TONE_GUIDES.get(tone, self.TONE_GUIDES["informative"])

        return f"""
You are a social media content strategist. Write a post announcing a new feature.

FEATURE BRIEF
- Name: {_sanitize(brief.get('name', 'Untitled Feature'))}
- Description: {_sanitize(brief.get('description', ''))}
- Key Benefit: {_sanitize(brief.get('benefit', ''))}
- Target Platforms: {', '.join(brief.get('platforms', ['web']))}
- Tone: {tone}

PLATFORM: {platform}
PLATFORM GUIDELINES
- Max characters: {spec['max_chars']}
- Style: {spec['style']}
- Hashtag rule: {spec['hashtag_style']}

TONE GUIDELINES
{tone_guide}

Return valid JSON with these keys:
- "caption": the main post text (string)
- "hashtags": array of suggested hashtags (strings)
- "variants": array of 2 alternative caption drafts (strings)
- "char_count": character count of the main caption (integer)
"""

    def generate_captions(
        self,
        feature_brief: dict,
        platform: str = "linkedin",
        tone: str = "informative",
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 800,
        system_prompt: str | None = None,
    ) -> dict:
        """Generate social-media captions for a feature announcement.

        Args:
            feature_brief: dict with keys name, description, benefit, platforms, tone
            platform: target platform (linkedin, twitter, instagram, whatsapp)
            tone: writing tone (professional, hype, informative, casual)

        Returns:
            dict with keys: caption, hashtags, variants, char_count

        Raises:
            APITimeoutError: if the Groq request times out
            RateLimitError: if Groq rate-limit is hit
            APIError: for any other Groq API error
        """
        prompt = self._build_prompt(feature_brief, platform, tone)

        system_msg = system_prompt or "You output only valid JSON."

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=30,
            )
        except APITimeoutError:
            return {"error": "Groq request timed out. Please try again."}
        except RateLimitError:
            return {"error": "Groq rate limit exceeded. Please wait and retry."}
        except APIError as e:
            return {"error": f"Groq API error: {e}"}

        raw = response.choices[0].message.content.strip()

        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.DOTALL).strip()

        try:
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            result = {
                "caption": raw,
                "hashtags": [],
                "variants": [],
                "char_count": len(raw),
            }

        result.setdefault("caption", "")
        result.setdefault("hashtags", [])
        result.setdefault("variants", [])
        result.setdefault("char_count", len(result.get("caption", "")))
        return result

    def generate_captions_stream(
        self,
        feature_brief: dict,
        platform: str = "linkedin",
        tone: str = "informative",
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.7,
        max_tokens: int = 800,
        system_prompt: str | None = None,
    ):
        """Stream caption tokens via SSE as they are generated by the LLM.

        Yields:
            SSE-formatted strings with 'token' events and a final 'complete' event.
        """
        prompt = self._build_prompt(feature_brief, platform, tone)
        system_msg = system_prompt or "You output only valid JSON."

        try:
            stream = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=30,
                stream=True,
            )
        except APITimeoutError:
            yield f"data: {json.dumps({'error': 'Groq request timed out. Please try again.'})}\n\n"
            return
        except RateLimitError:
            yield f"data: {json.dumps({'error': 'Groq rate limit exceeded. Please wait and retry.'})}\n\n"
            return
        except APIError as e:
            yield f"data: {json.dumps({'error': f'Groq API error: {e}'})}\n\n"
            return

        full_response = ""
        for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"

        yield f"data: {json.dumps({'complete': True, 'full_text': full_response})}\n\n"

    def generate_variants(self, feature_brief, platform, tone, num_variants=2):
        """Generate N alternative captions by varying temperature."""
        variants = []
        for i in range(num_variants):
            temperature = 0.6 + (i * 0.25)
            prompt = self._build_prompt(feature_brief, platform, tone)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a social media expert."},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=500,
            )
            raw = response.choices[0].message.content.strip()
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.DOTALL).strip()
            try:
                parsed = json.loads(cleaned)
                caption = parsed.get("caption", raw)
            except json.JSONDecodeError:
                caption = raw
            variants.append(caption)
        return variants


if __name__ == "__main__":
    from dotenv import load_dotenv
    import os

    load_dotenv()

    sample_brief = {
        "name": "Smart Scheduling",
        "description": (
            "AI-powered auto-scheduler that picks the best posting time "
            "based on audience activity."
        ),
        "benefit": "Save hours of manual planning and boost engagement by 40%",
        "platforms": ["linkedin", "twitter", "instagram", "whatsapp"],
        "tone": "informative",
    }

    engine = LLMEngine(api_key=os.getenv("GROQ_API_KEY", "gsk_placeholder"))
    for plat in ["linkedin", "twitter", "instagram", "whatsapp"]:
        result = engine.generate_captions(sample_brief, platform=plat, tone="informative")
        if "error" in result:
            print(f"[{plat.upper()}] Would call Groq -> {result['error']}")
        else:
            print(f"[{plat.upper()}] caption preview: {result.get('caption', '')[:60]}...")
