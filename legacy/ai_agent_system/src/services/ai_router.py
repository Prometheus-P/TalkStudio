# ai_agent_system/src/services/ai_router.py
"""
AI Router with Fallback Logic (US5)
Routes requests between Upstage and OpenAI with automatic failover.
"""
import asyncio
import logging
from typing import Optional, List, Dict, Any, Literal
from dataclasses import dataclass
from enum import Enum

from ai_agent_system.src.config.settings import settings
from ai_agent_system.src.services.upstage_client import UpstageClient
from ai_agent_system.src.services.openai_client import OpenAIClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class AIProvider(Enum):
    UPSTAGE = "upstage"
    OPENAI = "openai"


@dataclass
class AIResponse:
    """Standardized response from AI providers"""
    text: Optional[str]
    provider: AIProvider
    model: str
    success: bool
    error: Optional[str] = None
    latency_ms: float = 0.0
    fallback_used: bool = False


class AIRouter:
    """
    Routes AI requests with automatic fallback between providers.
    Primary provider is configurable via AI_PRIMARY_PROVIDER env var.
    """

    def __init__(self):
        self.upstage_client: Optional[UpstageClient] = None
        self.openai_client: Optional[OpenAIClient] = None

        # Initialize clients based on available API keys
        if settings.UPSTAGE_API_KEY:
            try:
                self.upstage_client = UpstageClient()
                logger.info("Upstage client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Upstage client: {e}")

        if settings.OPENAI_API_KEY:
            try:
                self.openai_client = OpenAIClient()
                logger.info("OpenAI client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")

        # Determine primary provider
        self.primary_provider = AIProvider(settings.AI_PRIMARY_PROVIDER.lower())
        self.fallback_enabled = settings.AI_FALLBACK_ENABLED
        self.max_retries = settings.AI_FALLBACK_MAX_RETRIES

        logger.info(f"AI Router initialized: Primary={self.primary_provider.value}, Fallback={self.fallback_enabled}")

    def _get_secondary_provider(self) -> AIProvider:
        """Get the secondary/fallback provider"""
        if self.primary_provider == AIProvider.UPSTAGE:
            return AIProvider.OPENAI
        return AIProvider.UPSTAGE

    def _get_client(self, provider: AIProvider):
        """Get client for specified provider"""
        if provider == AIProvider.UPSTAGE:
            return self.upstage_client
        return self.openai_client

    def _is_provider_available(self, provider: AIProvider) -> bool:
        """Check if provider client is available"""
        client = self._get_client(provider)
        return client is not None

    async def _call_provider(
        self,
        provider: AIProvider,
        prompt: str,
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 1.0,
        stop_sequences: Optional[List[str]] = None
    ) -> AIResponse:
        """Call a specific AI provider"""
        import time
        start_time = time.time()

        client = self._get_client(provider)
        if not client:
            return AIResponse(
                text=None,
                provider=provider,
                model=model_name or "unknown",
                success=False,
                error=f"{provider.value} client not available"
            )

        # Set default model based on provider
        if not model_name:
            if provider == AIProvider.UPSTAGE:
                model_name = "solar-pro"
            else:
                model_name = "gpt-4o-mini"

        try:
            result = await client.text_generation(
                prompt=prompt,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stop_sequences=stop_sequences
            )

            latency = (time.time() - start_time) * 1000

            if result:
                return AIResponse(
                    text=result,
                    provider=provider,
                    model=model_name,
                    success=True,
                    latency_ms=latency
                )
            else:
                return AIResponse(
                    text=None,
                    provider=provider,
                    model=model_name,
                    success=False,
                    error="Empty response from provider",
                    latency_ms=latency
                )

        except Exception as e:
            latency = (time.time() - start_time) * 1000
            logger.error(f"Error calling {provider.value}: {e}")
            return AIResponse(
                text=None,
                provider=provider,
                model=model_name,
                success=False,
                error=str(e),
                latency_ms=latency
            )

    async def generate(
        self,
        prompt: str,
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 1.0,
        stop_sequences: Optional[List[str]] = None,
        force_provider: Optional[AIProvider] = None
    ) -> AIResponse:
        """
        Generate text with automatic fallback.

        Args:
            prompt: The input prompt
            model_name: Optional model name (provider-specific)
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            stop_sequences: Stop sequences
            force_provider: Force specific provider (bypasses fallback)

        Returns:
            AIResponse with generated text and metadata
        """
        # If specific provider forced, use it directly
        if force_provider:
            return await self._call_provider(
                provider=force_provider,
                prompt=prompt,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stop_sequences=stop_sequences
            )

        # Try primary provider
        primary = self.primary_provider
        if self._is_provider_available(primary):
            response = await self._call_provider(
                provider=primary,
                prompt=prompt,
                model_name=model_name,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stop_sequences=stop_sequences
            )

            if response.success:
                return response

            logger.warning(f"Primary provider {primary.value} failed: {response.error}")
        else:
            logger.warning(f"Primary provider {primary.value} not available")

        # Try fallback if enabled
        if self.fallback_enabled:
            secondary = self._get_secondary_provider()
            if self._is_provider_available(secondary):
                logger.info(f"Attempting fallback to {secondary.value}")

                for attempt in range(self.max_retries):
                    response = await self._call_provider(
                        provider=secondary,
                        prompt=prompt,
                        model_name=None,  # Use default for fallback provider
                        temperature=temperature,
                        max_tokens=max_tokens,
                        top_p=top_p,
                        stop_sequences=stop_sequences
                    )

                    if response.success:
                        response.fallback_used = True
                        logger.info(f"Fallback to {secondary.value} succeeded")
                        return response

                    logger.warning(f"Fallback attempt {attempt + 1}/{self.max_retries} failed")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(1)  # Brief delay before retry

        # All attempts failed
        return AIResponse(
            text=None,
            provider=self.primary_provider,
            model=model_name or "unknown",
            success=False,
            error="All AI providers failed"
        )

    async def generate_with_both(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Dict[str, AIResponse]:
        """
        Generate text from both providers for comparison (US5).

        Returns:
            Dict with 'upstage' and 'openai' responses
        """
        results = {}

        # Run both providers in parallel
        tasks = []
        providers = []

        if self._is_provider_available(AIProvider.UPSTAGE):
            tasks.append(self._call_provider(
                provider=AIProvider.UPSTAGE,
                prompt=prompt,
                temperature=temperature,
                max_tokens=max_tokens
            ))
            providers.append(AIProvider.UPSTAGE)

        if self._is_provider_available(AIProvider.OPENAI):
            tasks.append(self._call_provider(
                provider=AIProvider.OPENAI,
                prompt=prompt,
                temperature=temperature,
                max_tokens=max_tokens
            ))
            providers.append(AIProvider.OPENAI)

        if tasks:
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            for provider, response in zip(providers, responses):
                if isinstance(response, Exception):
                    results[provider.value] = AIResponse(
                        text=None,
                        provider=provider,
                        model="unknown",
                        success=False,
                        error=str(response)
                    )
                else:
                    results[provider.value] = response

        return results

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get combined usage statistics from all providers"""
        stats = {
            "upstage": None,
            "openai": None
        }

        if self.upstage_client:
            stats["upstage"] = {
                "api_call_count": self.upstage_client.api_call_count,
                "total_input_tokens": self.upstage_client.total_input_tokens,
                "total_output_tokens": self.upstage_client.total_output_tokens
            }

        if self.openai_client:
            stats["openai"] = self.openai_client.get_usage_stats()

        return stats

    async def close(self):
        """Close all client connections"""
        if self.upstage_client:
            await self.upstage_client.close()
        if self.openai_client:
            await self.openai_client.close()
        logger.info("AI Router closed")


# Singleton instance
_router_instance: Optional[AIRouter] = None


def get_ai_router() -> AIRouter:
    """Get or create AI Router singleton"""
    global _router_instance
    if _router_instance is None:
        _router_instance = AIRouter()
    return _router_instance


async def main():
    """Test the AI Router"""
    settings.validate()

    router = get_ai_router()

    test_prompt = "What is 2 + 2? Answer with just the number."

    print("\n--- Testing single generation with fallback ---")
    response = await router.generate(prompt=test_prompt, max_tokens=10)
    print(f"Provider: {response.provider.value}")
    print(f"Success: {response.success}")
    print(f"Text: {response.text}")
    print(f"Fallback used: {response.fallback_used}")
    print(f"Latency: {response.latency_ms:.2f}ms")

    print("\n--- Testing both providers ---")
    both_responses = await router.generate_with_both(prompt=test_prompt, max_tokens=10)
    for provider, resp in both_responses.items():
        print(f"\n{provider}:")
        print(f"  Success: {resp.success}")
        print(f"  Text: {resp.text}")
        print(f"  Latency: {resp.latency_ms:.2f}ms")

    await router.close()


if __name__ == "__main__":
    asyncio.run(main())
