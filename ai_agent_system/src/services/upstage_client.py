# ai_agent_system/src/services/upstage_client.py
import os
import httpx
from typing import Optional, List, Dict, Any
from ai_agent_system.src.config.settings import settings
import asyncio
import logging # Import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UpstageClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key if api_key else settings.UPSTAGE_API_KEY
        if not self.api_key:
            raise ValueError("Upstage API key not provided or not found in settings.")
        
        self.base_url = "https://api.upstage.ai/v1/model"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(headers=self.headers)
        
        # --- Cost Management and Usage Monitoring ---
        self.api_call_count = 0
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        # Placeholder: could load pricing dynamically or from config
        self.pricing_per_thousand_input_tokens = 0.001 # Example $
        self.pricing_per_thousand_output_tokens = 0.002 # Example $
        # --- End Cost Management ---

    async def text_generation(
        self,
        prompt: str,
        model_name: str = "llama-2-70b-chat",
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 1.0,
        stop_sequences: Optional[List[str]] = None
    ) -> Optional[str]:
        url = f"{self.base_url}/{model_name}/generate"
        payload = {
            "prompt": prompt,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": top_p,
            "stop_sequences": stop_sequences if stop_sequences else []
        }

        self.api_call_count += 1
        input_token_estimate = len(prompt.split()) # Simple token estimate
        self.total_input_tokens += input_token_estimate
        logger.info(f"Upstage API Call {self.api_call_count}: Model='{model_name}', Input Tokens (est)={input_token_estimate}")

        try:
            response = await self.client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            
            result = response.json()
            generated_text = None
            output_token_estimate = 0
            
            if result and "choices" in result and len(result["choices"]) > 0 and "text" in result["choices"][0]:
                generated_text = result["choices"][0]["text"]
                # Assuming 'usage' or similar field in response for actual token count
                if "usage" in result and "completion_tokens" in result["usage"]:
                    output_token_estimate = result["usage"]["completion_tokens"]
                else: # Fallback to estimate
                    output_token_estimate = len(generated_text.split())

            elif result and "completion" in result:
                generated_text = result["completion"]
                output_token_estimate = len(generated_text.split()) # Estimate

            if generated_text:
                self.total_output_tokens += output_token_estimate
                logger.info(f"Upstage API Success: Output Tokens (est)={output_token_estimate}")
            
            return generated_text
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error generating text with Upstage API: {e.response.status_code} - {e.response.text}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request error generating text with Upstage API: {e}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred while calling Upstage API: {e}")
            return None

    async def close(self):
        """Closes the HTTP client connection and logs final usage."""
        await self.client.aclose()
        logger.info("--- Upstage API Usage Summary ---")
        logger.info(f"Total API Calls: {self.api_call_count}")
        logger.info(f"Total Estimated Input Tokens: {self.total_input_tokens}")
        logger.info(f"Total Estimated Output Tokens: {self.total_output_tokens}")
        logger.info(f"Estimated Input Cost: ${self.total_input_tokens / 1000 * self.pricing_per_thousand_input_tokens:.4f}")
        logger.info(f"Estimated Output Cost: ${self.total_output_tokens / 1000 * self.pricing_per_thousand_output_tokens:.4f}")
        logger.info(f"Total Estimated Cost: ${ (self.total_input_tokens / 1000 * self.pricing_per_thousand_input_tokens) + (self.total_output_tokens / 1000 * self.pricing_per_thousand_output_tokens):.4f}")

# Example usage
async def main():
    # Ensure settings are loaded and validated
    settings.validate()
    
    # Needs UPSTAGE_API_KEY in .env
    if not settings.UPSTAGE_API_KEY:
        logger.warning("Please set UPSTAGE_API_KEY in your .env for testing.")
        return

    upstage_client = UpstageClient()
    
    test_prompt = "대한민국 수도는 어디인가요? 짧게 답변해주세요."
    logger.info(f"Generating text for prompt: '{test_prompt}'")
    generated_text = await upstage_client.text_generation(prompt=test_prompt, max_tokens=20)
    
    if generated_text:
        logger.info("\nGenerated Text:")
        logger.info(generated_text)
    else:
        logger.error("Text generation failed.")
        
    await upstage_client.close()

if __name__ == "__main__":
    asyncio.run(main())