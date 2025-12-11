# ai_agent_system/src/services/ai_comparator.py
"""
AI Comparator Service (US5)
Compares responses from multiple AI providers for quality evaluation.
"""
import asyncio
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

from ai_agent_system.src.services.ai_router import get_ai_router, AIProvider, AIResponse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class ComparisonMetrics:
    """Metrics for comparing AI responses"""
    response_length: int
    word_count: int
    latency_ms: float
    estimated_tokens: int


@dataclass
class ComparisonResult:
    """Result of comparing two AI provider responses"""
    prompt: str
    timestamp: str
    upstage_response: Optional[Dict[str, Any]]
    openai_response: Optional[Dict[str, Any]]
    comparison_summary: Dict[str, Any]
    winner: Optional[str]  # 'upstage', 'openai', 'tie', or None if both failed


class AIComparator:
    """
    Compares AI responses from different providers.
    Useful for A/B testing and quality evaluation.
    """

    def __init__(self):
        self.ai_router = get_ai_router()

    def _calculate_metrics(self, text: Optional[str], latency_ms: float) -> ComparisonMetrics:
        """Calculate comparison metrics for a response"""
        if not text:
            return ComparisonMetrics(
                response_length=0,
                word_count=0,
                latency_ms=latency_ms,
                estimated_tokens=0
            )

        words = text.split()
        return ComparisonMetrics(
            response_length=len(text),
            word_count=len(words),
            latency_ms=latency_ms,
            estimated_tokens=int(len(words) * 1.3)  # Rough token estimate
        )

    def _response_to_dict(self, response: AIResponse) -> Dict[str, Any]:
        """Convert AIResponse to dictionary"""
        metrics = self._calculate_metrics(response.text, response.latency_ms)
        return {
            "text": response.text,
            "provider": response.provider.value,
            "model": response.model,
            "success": response.success,
            "error": response.error,
            "metrics": asdict(metrics)
        }

    def _determine_winner(
        self,
        upstage: Optional[AIResponse],
        openai: Optional[AIResponse]
    ) -> Optional[str]:
        """
        Determine which provider gave a better response.
        Simple heuristic based on success and response quality.
        """
        upstage_ok = upstage and upstage.success and upstage.text
        openai_ok = openai and openai.success and openai.text

        if not upstage_ok and not openai_ok:
            return None
        if upstage_ok and not openai_ok:
            return "upstage"
        if openai_ok and not upstage_ok:
            return "openai"

        # Both succeeded - compare based on metrics
        upstage_len = len(upstage.text) if upstage.text else 0
        openai_len = len(openai.text) if openai.text else 0

        # Prefer more detailed responses (within reason)
        # Also consider latency
        upstage_score = 0
        openai_score = 0

        # Response length (prefer longer, more detailed responses)
        if upstage_len > openai_len * 1.2:
            upstage_score += 1
        elif openai_len > upstage_len * 1.2:
            openai_score += 1

        # Latency (prefer faster responses)
        if upstage.latency_ms < openai.latency_ms * 0.8:
            upstage_score += 1
        elif openai.latency_ms < upstage.latency_ms * 0.8:
            openai_score += 1

        if upstage_score > openai_score:
            return "upstage"
        elif openai_score > upstage_score:
            return "openai"
        return "tie"

    async def compare(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> ComparisonResult:
        """
        Generate responses from both providers and compare them.

        Args:
            prompt: The input prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            ComparisonResult with both responses and comparison metrics
        """
        logger.info(f"Starting AI comparison for prompt: {prompt[:50]}...")

        # Get responses from both providers
        responses = await self.ai_router.generate_with_both(
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens
        )

        upstage_response = responses.get("upstage")
        openai_response = responses.get("openai")

        # Convert to dictionaries
        upstage_dict = self._response_to_dict(upstage_response) if upstage_response else None
        openai_dict = self._response_to_dict(openai_response) if openai_response else None

        # Determine winner
        winner = self._determine_winner(upstage_response, openai_response)

        # Build comparison summary
        comparison_summary = {
            "both_succeeded": bool(upstage_dict and upstage_dict.get("success") and
                                   openai_dict and openai_dict.get("success")),
            "latency_difference_ms": None,
            "length_difference": None,
            "winner_reason": None
        }

        if upstage_dict and openai_dict:
            upstage_metrics = upstage_dict.get("metrics", {})
            openai_metrics = openai_dict.get("metrics", {})

            comparison_summary["latency_difference_ms"] = round(
                upstage_metrics.get("latency_ms", 0) - openai_metrics.get("latency_ms", 0), 2
            )
            comparison_summary["length_difference"] = (
                upstage_metrics.get("response_length", 0) - openai_metrics.get("response_length", 0)
            )

            if winner == "upstage":
                comparison_summary["winner_reason"] = "Better response quality or speed"
            elif winner == "openai":
                comparison_summary["winner_reason"] = "Better response quality or speed"
            elif winner == "tie":
                comparison_summary["winner_reason"] = "Similar quality and performance"

        return ComparisonResult(
            prompt=prompt,
            timestamp=datetime.now(timezone.utc).isoformat(),
            upstage_response=upstage_dict,
            openai_response=openai_dict,
            comparison_summary=comparison_summary,
            winner=winner
        )

    async def batch_compare(
        self,
        prompts: List[str],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> List[ComparisonResult]:
        """
        Compare multiple prompts in parallel.

        Args:
            prompts: List of prompts to compare
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            List of ComparisonResults
        """
        tasks = [
            self.compare(prompt, temperature, max_tokens)
            for prompt in prompts
        ]
        return await asyncio.gather(*tasks)

    def generate_report(self, results: List[ComparisonResult]) -> Dict[str, Any]:
        """
        Generate a summary report from multiple comparison results.

        Args:
            results: List of ComparisonResults

        Returns:
            Summary report dictionary
        """
        total = len(results)
        upstage_wins = sum(1 for r in results if r.winner == "upstage")
        openai_wins = sum(1 for r in results if r.winner == "openai")
        ties = sum(1 for r in results if r.winner == "tie")
        failures = sum(1 for r in results if r.winner is None)

        avg_upstage_latency = 0
        avg_openai_latency = 0
        upstage_count = 0
        openai_count = 0

        for r in results:
            if r.upstage_response and r.upstage_response.get("success"):
                avg_upstage_latency += r.upstage_response["metrics"]["latency_ms"]
                upstage_count += 1
            if r.openai_response and r.openai_response.get("success"):
                avg_openai_latency += r.openai_response["metrics"]["latency_ms"]
                openai_count += 1

        return {
            "total_comparisons": total,
            "upstage_wins": upstage_wins,
            "openai_wins": openai_wins,
            "ties": ties,
            "failures": failures,
            "upstage_win_rate": round(upstage_wins / total * 100, 1) if total > 0 else 0,
            "openai_win_rate": round(openai_wins / total * 100, 1) if total > 0 else 0,
            "avg_upstage_latency_ms": round(avg_upstage_latency / upstage_count, 2) if upstage_count > 0 else None,
            "avg_openai_latency_ms": round(avg_openai_latency / openai_count, 2) if openai_count > 0 else None
        }

    async def close(self):
        """Close the AI router"""
        await self.ai_router.close()


# Example usage
async def main():
    from ai_agent_system.src.config.settings import settings
    settings.validate()

    comparator = AIComparator()

    # Single comparison
    print("\n--- Single Comparison ---")
    result = await comparator.compare(
        prompt="Explain the concept of machine learning in 2 sentences.",
        max_tokens=100
    )

    print(f"Prompt: {result.prompt}")
    print(f"Winner: {result.winner}")
    print(f"\nUpstage Response:")
    if result.upstage_response:
        print(f"  Text: {result.upstage_response.get('text', 'N/A')[:100]}...")
        print(f"  Latency: {result.upstage_response['metrics']['latency_ms']:.2f}ms")
    print(f"\nOpenAI Response:")
    if result.openai_response:
        print(f"  Text: {result.openai_response.get('text', 'N/A')[:100]}...")
        print(f"  Latency: {result.openai_response['metrics']['latency_ms']:.2f}ms")

    # Batch comparison
    print("\n--- Batch Comparison ---")
    test_prompts = [
        "What is 2 + 2?",
        "Translate 'hello' to Korean.",
        "Write a haiku about coding."
    ]
    batch_results = await comparator.batch_compare(test_prompts, max_tokens=50)

    report = comparator.generate_report(batch_results)
    print(f"Report: {report}")

    await comparator.close()


if __name__ == "__main__":
    asyncio.run(main())
