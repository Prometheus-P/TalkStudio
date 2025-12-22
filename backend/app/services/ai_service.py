"""AI service for conversation generation."""

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Literal

import httpx
from openai import AsyncOpenAI

from app.core.cache import ResponseCache, response_cache
from app.core.config import settings
from app.schemas.chat import ChatMessage, MessageType, SpeakerType

logger = logging.getLogger(__name__)


class AIService:
    """Service for generating conversations using AI APIs."""

    def __init__(self):
        self._openai_client: AsyncOpenAI | None = None
        self._http_client: httpx.AsyncClient | None = None

    @property
    def openai_client(self) -> AsyncOpenAI:
        """Lazy initialization of OpenAI client."""
        if self._openai_client is None:
            if not settings.openai_api_key:
                raise ValueError("OpenAI API key not configured")
            self._openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        return self._openai_client

    @property
    def http_client(self) -> httpx.AsyncClient:
        """Lazy initialization of HTTP client for Upstage."""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(timeout=60.0)
        return self._http_client

    def _build_system_prompt(
        self,
        style: str,
        language: str,
        message_count: int,
    ) -> str:
        """Build system prompt for AI."""
        language_map = {
            "ko": "한국어",
            "en": "English",
            "ja": "日本語",
        }

        style_descriptions = {
            "casual": "친근하고 편안한 일상 대화",
            "formal": "정중하고 격식 있는 대화",
            "romantic": "로맨틱하고 애정 어린 대화",
            "funny": "유머러스하고 재미있는 대화",
            "dramatic": "극적이고 감정적인 대화",
        }

        return f"""You are a conversation generator for a viral chat screenshot maker.
Generate a realistic {style_descriptions.get(style, style)} between two people.

Rules:
1. Output ONLY valid JSON array, no other text
2. Generate exactly {message_count} messages
3. Language: {language_map.get(language, language)}
4. Alternate speakers naturally (not strictly alternating)
5. Include realistic elements like:
   - Short reactions (ㅋㅋ, ㅎㅎ, ㅠㅠ for Korean)
   - Emojis where appropriate
   - Natural conversation flow

JSON format (strictly follow this):
[
  {{"speaker": "me", "text": "message text", "type": "text"}},
  {{"speaker": "other", "text": "response", "type": "text"}}
]

speaker must be "me" or "other"
type must be "text" or "emoji"
"""

    async def generate_conversation(
        self,
        prompt: str,
        message_count: int = 10,
        style: Literal["casual", "formal", "romantic", "funny", "dramatic"] = "casual",
        language: Literal["ko", "en", "ja"] = "ko",
        provider: Literal["openai", "upstage"] = "openai",
        use_cache: bool = True,
    ) -> tuple[list[ChatMessage], dict]:
        """
        Generate a conversation using AI.

        Args:
            prompt: Description of the conversation to generate
            message_count: Number of messages to generate
            style: Conversation style
            language: Output language
            provider: AI provider to use
            use_cache: Whether to use response caching

        Returns:
            Tuple of (messages, metadata)
        """
        # Generate cache key
        cache_key = ResponseCache.generate_cache_key(
            prompt=prompt,
            message_count=message_count,
            style=style,
            language=language,
            provider=provider,
        )

        # Check cache first
        if use_cache:
            cached = response_cache.get(cache_key)
            if cached:
                logger.info("Using cached response for prompt: %s...", prompt[:50])
                messages = self._parse_messages(cached["messages_data"])
                metadata = cached["metadata"].copy()
                metadata["cached"] = True
                metadata["cache_key"] = cache_key
                return messages, metadata

        # Generate new response
        system_prompt = self._build_system_prompt(style, language, message_count)
        user_prompt = f"Generate a conversation about: {prompt}"

        if provider == "openai":
            messages, metadata = await self._generate_with_openai(system_prompt, user_prompt)
        elif provider == "upstage":
            messages, metadata = await self._generate_with_upstage(system_prompt, user_prompt)
        else:
            raise ValueError(f"Unknown provider: {provider}")

        # Store in cache
        if use_cache and messages:
            messages_data = [
                {
                    "speaker": msg.speaker.value,
                    "text": msg.text,
                    "type": msg.type.value,
                    "name": msg.speaker_name,
                }
                for msg in messages
            ]
            response_cache.set(cache_key, {
                "messages_data": messages_data,
                "metadata": metadata,
            })
            logger.info("Cached response for prompt: %s...", prompt[:50])

        metadata["cached"] = False
        return messages, metadata

    async def _generate_with_openai(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> tuple[list[ChatMessage], dict]:
        """Generate conversation using OpenAI API."""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.8,
                max_tokens=2000,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")

            # Parse JSON response
            parsed = json.loads(content)

            # Handle both direct array and wrapped array
            messages_data = parsed if isinstance(parsed, list) else parsed.get("messages", [])

            messages = self._parse_messages(messages_data)

            metadata = {
                "tokens_used": response.usage.total_tokens if response.usage else 0,
                "model": response.model,
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

            return messages, metadata

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            raise ValueError(f"OpenAI generation failed: {e}")

    async def _generate_with_upstage(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> tuple[list[ChatMessage], dict]:
        """Generate conversation using Upstage Solar API."""
        if not settings.upstage_api_key:
            raise ValueError("Upstage API key not configured")

        try:
            response = await self.http_client.post(
                "https://api.upstage.ai/v1/solar/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.upstage_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "solar-pro",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.8,
                    "max_tokens": 2000,
                },
            )

            response.raise_for_status()
            data = response.json()

            content = data["choices"][0]["message"]["content"]

            # Try to extract JSON from response
            try:
                # Find JSON array in response
                start = content.find("[")
                end = content.rfind("]") + 1
                if start != -1 and end > start:
                    json_str = content[start:end]
                    messages_data = json.loads(json_str)
                else:
                    messages_data = json.loads(content)
            except json.JSONDecodeError:
                raise ValueError("Failed to parse Upstage response as JSON")

            messages = self._parse_messages(messages_data)

            metadata = {
                "tokens_used": data.get("usage", {}).get("total_tokens", 0),
                "model": "solar-pro",
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }

            return messages, metadata

        except httpx.HTTPStatusError as e:
            raise ValueError(f"Upstage API error: {e.response.status_code}")
        except Exception as e:
            raise ValueError(f"Upstage generation failed: {e}")

    def _parse_messages(self, messages_data: List[dict]) -> List[ChatMessage]:
        """Parse raw message data into ChatMessage objects."""
        messages = []

        for i, msg in enumerate(messages_data):
            try:
                speaker_raw = msg.get("speaker", "other").lower()
                speaker = SpeakerType.ME if speaker_raw == "me" else SpeakerType.OTHER

                type_raw = msg.get("type", "text").lower()
                msg_type = MessageType.EMOJI if type_raw == "emoji" else MessageType.TEXT

                text = str(msg.get("text", "")).strip()
                if not text:
                    continue

                messages.append(
                    ChatMessage(
                        id=str(uuid.uuid4()),
                        speaker=speaker,
                        speaker_name=msg.get("name"),
                        text=text,
                        type=msg_type,
                        timestamp=datetime.now(timezone.utc),
                    )
                )
            except Exception:
                # Skip invalid messages
                continue

        if not messages:
            raise ValueError("No valid messages parsed from AI response")

        return messages
