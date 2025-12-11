# ai_agent_system/src/services/openai_client.py
import os
from typing import Optional, List, Dict, Any
from openai import AsyncOpenAI
from ai_agent_system.src.config.settings import settings
import asyncio
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class OpenAIClient:
    """OpenAI API client with interface compatible with UpstageClient (US5)"""

    def __init__(self, api_key: str = None):
        self.api_key = api_key if api_key else settings.OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key not provided or not found in settings.")

        self.client = AsyncOpenAI(api_key=self.api_key)

        # Cost Management and Usage Monitoring
        self.api_call_count = 0
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        # GPT-4o pricing (as of 2024)
        self.pricing_per_thousand_input_tokens = 0.005
        self.pricing_per_thousand_output_tokens = 0.015

    async def text_generation(
        self,
        prompt: str,
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 1.0,
        stop_sequences: Optional[List[str]] = None
    ) -> Optional[str]:
        """
        Generate text using OpenAI API.
        Interface compatible with UpstageClient.text_generation()
        """
        self.api_call_count += 1
        input_token_estimate = len(prompt.split())
        self.total_input_tokens += input_token_estimate
        logger.info(f"OpenAI API Call {self.api_call_count}: Model='{model_name}', Input Tokens (est)={input_token_estimate}")

        try:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stop=stop_sequences if stop_sequences else None
            )

            generated_text = None
            output_token_estimate = 0

            if response.choices and len(response.choices) > 0:
                generated_text = response.choices[0].message.content

                # Use actual token count from response
                if response.usage:
                    self.total_input_tokens -= input_token_estimate  # Remove estimate
                    self.total_input_tokens += response.usage.prompt_tokens
                    output_token_estimate = response.usage.completion_tokens
                else:
                    output_token_estimate = len(generated_text.split()) if generated_text else 0

            if generated_text:
                self.total_output_tokens += output_token_estimate
                logger.info(f"OpenAI API Success: Output Tokens={output_token_estimate}")

            return generated_text

        except Exception as e:
            logger.error(f"Error generating text with OpenAI API: {e}")
            return None

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model_name: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 1.0,
        stop_sequences: Optional[List[str]] = None
    ) -> Optional[str]:
        """
        Chat completion with message history.
        Extended functionality beyond UpstageClient.
        """
        self.api_call_count += 1
        input_token_estimate = sum(len(m.get("content", "").split()) for m in messages)
        self.total_input_tokens += input_token_estimate
        logger.info(f"OpenAI Chat API Call {self.api_call_count}: Model='{model_name}', Messages={len(messages)}")

        try:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                stop=stop_sequences if stop_sequences else None
            )

            generated_text = None
            if response.choices and len(response.choices) > 0:
                generated_text = response.choices[0].message.content

                if response.usage:
                    self.total_input_tokens -= input_token_estimate
                    self.total_input_tokens += response.usage.prompt_tokens
                    self.total_output_tokens += response.usage.completion_tokens

            return generated_text

        except Exception as e:
            logger.error(f"Error in chat completion with OpenAI API: {e}")
            return None

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics"""
        input_cost = self.total_input_tokens / 1000 * self.pricing_per_thousand_input_tokens
        output_cost = self.total_output_tokens / 1000 * self.pricing_per_thousand_output_tokens
        return {
            "api_call_count": self.api_call_count,
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "estimated_input_cost": input_cost,
            "estimated_output_cost": output_cost,
            "estimated_total_cost": input_cost + output_cost
        }

    async def close(self):
        """Log final usage statistics"""
        stats = self.get_usage_stats()
        logger.info("--- OpenAI API Usage Summary ---")
        logger.info(f"Total API Calls: {stats['api_call_count']}")
        logger.info(f"Total Input Tokens: {stats['total_input_tokens']}")
        logger.info(f"Total Output Tokens: {stats['total_output_tokens']}")
        logger.info(f"Estimated Input Cost: ${stats['estimated_input_cost']:.4f}")
        logger.info(f"Estimated Output Cost: ${stats['estimated_output_cost']:.4f}")
        logger.info(f"Total Estimated Cost: ${stats['estimated_total_cost']:.4f}")


# Example usage
async def main():
    settings.validate()

    if not settings.OPENAI_API_KEY:
        logger.warning("Please set OPENAI_API_KEY in your .env for testing.")
        return

    openai_client = OpenAIClient()

    test_prompt = "What is the capital of South Korea? Answer briefly."
    logger.info(f"Generating text for prompt: '{test_prompt}'")
    generated_text = await openai_client.text_generation(prompt=test_prompt, max_tokens=50)

    if generated_text:
        logger.info(f"\nGenerated Text: {generated_text}")
    else:
        logger.error("Text generation failed.")

    await openai_client.close()


if __name__ == "__main__":
    asyncio.run(main())
