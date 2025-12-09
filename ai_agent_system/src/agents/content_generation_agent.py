# ai_agent_system/src/agents/content_generation_agent.py
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from uuid import uuid4
import asyncio

from ai_agent_system.src.services.upstage_client import UpstageClient
from ai_agent_system.src.services.prompt_engineer import PromptEngineer
from ai_agent_system.src.db.client import MongoDBClient
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult
from ai_agent_system.src.models.generated_content_model import GeneratedContent

class ContentGenerationAgent:
    def __init__(self):
        self.upstage_client = UpstageClient()
        self.prompt_engineer = PromptEngineer()
        self.db_client = MongoDBClient()
        self.db = self.db_client.get_db()

    async def _get_discord_messages(self, message_ids: List[str]) -> List[DiscordMessage]:
        """Fetches Discord messages from the database."""
        messages_collection = self.db["discord_messages"]
        # In a real app, you might want to fetch by internal _id or discordMessageId
        # Assuming message_ids are internal _id for now
        message_docs = messages_collection.find({"_id": {"$in": message_ids}})
        return [DiscordMessage(**doc) for doc in message_docs]

    async def _get_intent_analysis_results(self, discord_message_ids: List[str]) -> List[IntentAnalysisResult]:
        """Fetches intent analysis results for given Discord message IDs."""
        results_collection = self.db["intent_analysis_results"]
        results_docs = results_collection.find({"discordMessageId": {"$in": discord_message_ids}})
        return [IntentAnalysisResult(**doc) for doc in results_docs]

    async def generate_content(
        self,
        discord_message_ids: List[str],
        content_type: str,
        generation_parameters: Optional[Dict[str, Any]] = None
    ) -> Optional[GeneratedContent]:
        """
        Generates content based on Discord messages and intent analysis, using Upstage API.
        :param discord_message_ids: List of Discord message IDs to use as context.
        :param content_type: Type of content to generate (e.g., 'summary', 'faq_answer').
        :param generation_parameters: Optional parameters for text generation (temperature, max_tokens, etc.).
        :return: The generated GeneratedContent object, or None if generation failed.
        """
        if not discord_message_ids:
            print("No Discord message IDs provided for content generation.")
            return None

        # Fetch relevant messages and intent analysis results from DB
        messages = await self._get_discord_messages(discord_message_ids)
        intent_results = await self._get_intent_analysis_results(discord_message_ids)

        if not messages:
            print(f"No Discord messages found for IDs: {discord_message_ids}")
            return None

        prompt = ""
        if content_type == "summary":
            prompt = self.prompt_engineer.generate_summary_prompt(messages)
        elif content_type == "faq_answer":
            # For FAQ, need a question. Placeholder for now.
            dummy_question = "핵심 질문은 무엇인가요?"
            prompt = self.prompt_engineer.generate_faq_answer_prompt(dummy_question, messages)
        elif content_type == "idea_list":
            prompt = self.prompt_engineer.generate_idea_prompt(intent_results, messages)
        else:
            print(f"Unsupported content type: {content_type}")
            return None

        if not prompt:
            print("Failed to generate prompt for Upstage API.")
            return None

        # --- T038: LLM Hallucination 방지 및 사실 확인 메커니즘 (예: RAG 연동) 초기 연구 및 적용 고려 ---
        # Before calling Upstage API, consider adding a RAG (Retrieval Augmented Generation) step
        # to ground the LLM's response in factual information from Discord messages or external sources.
        # This could involve:
        # 1. Retrieving relevant message chunks based on prompt/intent.
        # 2. Augmenting the prompt with retrieved facts.
        # This is a research/consideration task, so for implementation, we'll keep it as a comment for now.
        # -----------------------------------------------------------------------------------------

        # Call Upstage API
        gen_params = generation_parameters if generation_parameters else {}
        generated_text = await self.upstage_client.text_generation(
            prompt=prompt,
            model_name=gen_params.get("model_name", "llama-2-70b-chat"),
            temperature=gen_params.get("temperature", 0.7),
            max_tokens=gen_params.get("max_tokens", 500),
            top_p=gen_params.get("top_p", 1.0),
            stop_sequences=gen_params.get("stop_sequences")
        )

        if not generated_text:
            print("Upstage API did not return generated text.")
            return None

        # Save generated content to database
        generated_content_data = {
            "_id": str(uuid4()),
            "relatedDiscordMessageIds": discord_message_ids,
            "contentType": content_type,
            "generatedText": generated_text,
            "upstageModelUsed": gen_params.get("model_name", "llama-2-70b-chat"),
            "promptUsed": prompt,
            "temperature": gen_params.get("temperature", 0.7),
            "generatedAt": datetime.now(timezone.utc)
        }
        generated_content = GeneratedContent(**generated_content_data)

        try:
            collection = self.db["generated_contents"]
            collection.insert_one(generated_content.dict(by_alias=True))
            print(f"Generated content saved with ID: {generated_content.id}")
            return generated_content
        except Exception as e:
            print(f"Error saving generated content to DB: {e}")
            return None

# Example usage (for testing)
async def main():
    from ai_agent_system.src.config.settings import settings
    settings.validate()
    
    # Needs valid Upstage API Key in .env
    if not settings.UPSTAGE_API_KEY:
        print("Please set UPSTAGE_API_KEY in your .env for testing.")
        return

    agent = ContentGenerationAgent()
    
    # Dummy messages and intent results (normally fetched from DB)
    dummy_message = DiscordMessage(
        discordMessageId="dummy_msg_1", authorId="1", authorName="User1",
        timestamp=datetime.now(timezone.utc), content="이 기능 정말 좋은 것 같아요! 질문이 있습니다.",
        channelId="dummy_channel", serverId="dummy_server"
    )
    dummy_intent_result = IntentAnalysisResult(
        discordMessageId="dummy_msg_1", extractedIntents=["칭찬", "질문"],
        keywords=["기능", "질문"], sentiment="positive", analysisModelVersion="v1.0"
    )

    # Simulate saving to DB for agent to fetch
    agent.db["discord_messages"].insert_one(dummy_message.dict(by_alias=True))
    agent.db["intent_analysis_results"].insert_one(dummy_intent_result.dict(by_alias=True))

    generated_summary = await agent.generate_content(
        discord_message_ids=[dummy_message.id],
        content_type="summary",
        generation_parameters={"max_tokens": 100}
    )
    if generated_summary:
        print(f"\nGenerated Summary: {generated_summary.generatedText}")
    else:
        print("Summary generation failed.")
        
    await agent.upstage_client.close()

if __name__ == "__main__":
    asyncio.run(main())