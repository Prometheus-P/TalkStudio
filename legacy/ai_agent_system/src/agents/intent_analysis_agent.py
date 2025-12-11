# ai_agent_system/src/agents/intent_analysis_agent.py
from ai_agent_system.src.services.nlp_processor import NLPProcessor
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult
from ai_agent_system.src.db.client import MongoDBClient
from datetime import datetime, timezone
from uuid import uuid4
import asyncio

class IntentAnalysisAgent:
    def __init__(self):
        self.nlp_processor = NLPProcessor()
        self.db_client = MongoDBClient()

    async def analyze_message(self, discord_message: DiscordMessage) -> Optional[IntentAnalysisResult]:
        """
        Performs intent analysis on a DiscordMessage and saves the result.
        :param discord_message: The DiscordMessage object to analyze.
        :return: The created IntentAnalysisResult object, or None if analysis failed.
        """
        if not discord_message.content:
            print(f"Skipping analysis for message {discord_message.id}: no content.")
            return None

        # Preprocess message
        preprocessed_content = self.nlp_processor.preprocess_discord_message(discord_message.content)
        if not preprocessed_content:
            print(f"Skipping analysis for message {discord_message.id}: content removed during preprocessing.")
            return None

        # Extract intent, keywords, sentiment
        intents = self.nlp_processor.extract_intent(preprocessed_content)
        keywords = self.nlp_processor.extract_keywords(preprocessed_content)
        sentiment = self.nlp_processor.analyze_sentiment(preprocessed_content)

        # Create IntentAnalysisResult model
        analysis_result_data = {
            "_id": str(uuid4()),
            "discordMessageId": discord_message.discordMessageId,
            "extractedIntents": intents,
            "keywords": keywords,
            "sentiment": sentiment,
            "analysisModelVersion": "v1.0", # Hardcoded for now, will be dynamic
            "analysisTimestamp": datetime.now(timezone.utc)
        }
        intent_analysis_result = IntentAnalysisResult(**analysis_result_data)

        # Save to database
        try:
            collection = self.db_client.get_db()["intent_analysis_results"]
            collection.insert_one(intent_analysis_result.dict(by_alias=True))
            print(f"Intent analysis result saved for message {discord_message.discordMessageId}")
            
            # Update DiscordMessage to mark as processed
            discord_messages_collection = self.db_client.get_db()["discord_messages"]
            discord_messages_collection.update_one(
                {"_id": discord_message.id},
                {"$set": {"isProcessed": True, "updatedAt": datetime.now(timezone.utc)}}
            )
            
            return intent_analysis_result
        except Exception as e:
            print(f"Error saving intent analysis result for message {discord_message.discordMessageId}: {e}")
            return None

# Example usage (for testing)
async def main():
    # Example setup for a dummy DiscordMessage
    dummy_message_data = {
        "_id": str(uuid4()),
        "discordMessageId": "123456789012345678",
        "authorId": "987654321098765432",
        "authorName": "TestUser",
        "timestamp": datetime.now(timezone.utc),
        "content": "이 기능은 정말 좋네요! 정말 감사합니다. 질문 하나 있어요.",
        "channelId": "112233445566778899",
        "serverId": "998877665544332211",
        "rawContent": {},
        "isProcessed": False,
        "createdAt": datetime.now(timezone.utc)
    }
    dummy_discord_message = DiscordMessage(**dummy_message_data)

    agent = IntentAnalysisAgent()
    result = await agent.analyze_message(dummy_discord_message)
    if result:
        print(f"Analysis Result: {result.extractedIntents}, {result.sentiment}, {result.keywords}")
    else:
        print("Analysis failed.")

if __name__ == "__main__":
    # Ensure settings are validated before running example
    from ai_agent_system.src.config.settings import settings
    settings.validate()
    asyncio.run(main())
