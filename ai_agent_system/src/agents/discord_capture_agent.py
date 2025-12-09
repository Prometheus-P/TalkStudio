# ai_agent_system/src/agents/discord_capture_agent.py
from ai_agent_system.src.services.discord_client import DiscordClient
from ai_agent_system.src.config.settings import settings
from ai_agent_system.src.db.client import MongoDBClient # Import the MongoDBClient
from ai_agent_system.src.models.discord_config_model import DiscordConfig # Assuming T016 creates this
from ai_agent_system.src.models.discord_message_model import DiscordMessage # Assuming T022 creates this

from datetime import datetime, timezone
import asyncio
import os
from uuid import uuid4

# Temporarily add TZ to settings for example if not set
if not hasattr(settings, 'TZ'):
    settings.TZ = timezone.utc

class DiscordCaptureAgent:
    def __init__(self):
        self.discord_client = DiscordClient()
        self.db_client = MongoDBClient() # Initialize MongoDBClient

    async def _get_discord_config(self, config_id: str) -> DiscordConfig:
        """Fetches DiscordConfig from the database."""
        # This will be properly implemented once DiscordConfig model (T016) is done.
        # For now, placeholder to simulate fetching from DB
        config_collection = self.db_client.get_db()["discord_configs"]
        config_data = config_collection.find_one({"_id": config_id})
        
        if config_data:
            # Convert _id to str if it's an ObjectId and other necessary conversions
            if "_id" in config_data:
                config_data["_id"] = str(config_data["_id"])
            return DiscordConfig(**config_data)
        
        # Fallback to dummy config if not found in DB
        dummy_config_data = {
            "_id": config_id,
            "serverId": os.getenv("TEST_DISCORD_SERVER_ID", "dummy_server_id"),
            "serverName": "Test Server",
            "botToken": settings.DISCORD_BOT_TOKEN,
            "enabledChannels": [os.getenv("TEST_DISCORD_CHANNEL_ID", "dummy_channel_id")],
            "captureStartDate": datetime(2023, 1, 1, tzinfo=settings.TZ),
            "isActive": True,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
            "lastCapturedTimestamp": None # Will be updated from DB
        }
        return DiscordConfig(**dummy_config_data)

    async def _save_discord_message(self, message: discord.Message) -> DiscordMessage:
        """Converts discord.Message to DiscordMessage model and saves to DB."""
        discord_message_data = {
            "_id": str(uuid4()), # Generate a new UUID for our internal ID
            "discordMessageId": str(message.id),
            "authorId": str(message.author.id),
            "authorName": message.author.display_name,
            "timestamp": message.created_at,
            "content": message.content,
            "channelId": str(message.channel.id),
            "serverId": str(message.guild.id) if message.guild else "DM",
            # Assuming discord.py message object has a way to get raw content if needed,
            # otherwise message.content is sufficient. raw_content might not be direct.
            "rawContent": {"message_id": str(message.id), "content": message.content}, # Simplified raw content
            "isProcessed": False,
            "createdAt": datetime.now(timezone.utc)
        }
        discord_message = DiscordMessage(**discord_message_data)
        
        discord_messages_collection = self.db_client.get_db()["discord_messages"]
        discord_messages_collection.insert_one(discord_message.dict(by_alias=True)) # assuming .dict() for Pydantic
        
        print(f"Saving DiscordMessage: {discord_message.discordMessageId}")
        return discord_message

    async def _update_discord_config_last_captured(self, config_id: str, timestamp: datetime):
        """Updates the lastCapturedTimestamp for a DiscordConfig in the database."""
        config_collection = self.db_client.get_db()["discord_configs"]
        config_collection.update_one(
            {"_id": config_id},
            {"$set": {"lastCapturedTimestamp": timestamp, "updatedAt": datetime.now(timezone.utc)}}
        )
        print(f"Updating DiscordConfig {config_id} with lastCapturedTimestamp: {timestamp}")


    async def start_capture(self, config_id: str, from_timestamp: datetime = None, limit_messages: int = None):
        """
        Starts or resumes the Discord message capture process for a given configuration.
        :param config_id: The ID of the DiscordConfig to use.
        :param from_timestamp: Start capturing messages from this timestamp.
        :param limit_messages: Maximum number of messages to capture.
        :return: A dictionary with capture job status.
        """
        print(f"Starting capture for config_id: {config_id}")
        
        discord_config = await self._get_discord_config(config_id)
        if not discord_config or not discord_config.isActive:
            return {"status": "failed", "message": f"DiscordConfig {config_id} not found or inactive."}

        if not discord_config.enabledChannels:
            return {"status": "failed", "message": f"DiscordConfig {config_id} has no enabled channels."}

        # Determine start time for capture
        start_time = from_timestamp if from_timestamp else \
                     discord_config.lastCapturedTimestamp if discord_config.lastCapturedTimestamp else \
                     discord_config.captureStartDate

        total_messages_captured = 0
        last_message_timestamp = start_time

        for channel_id in discord_config.enabledChannels:
            print(f"Fetching messages from channel: {channel_id} starting from {start_time}")
            messages = await self.discord_client.fetch_channel_messages(
                channel_id=channel_id,
                limit=limit_messages,
                after=start_time
            )
            
            for msg in messages:
                await self._save_discord_message(msg)
                total_messages_captured += 1
                if msg.created_at and msg.created_at > last_message_timestamp:
                    last_message_timestamp = msg.created_at
            
            # Update lastCapturedTimestamp for the config
            if messages: # if any messages were captured, update the timestamp
                await self._update_discord_config_last_captured(config_id, last_message_timestamp)
        
        return {"status": "completed", "config_id": config_id, "messages_captured": total_messages_captured}

    async def stop_capture(self, config_id: str):
        """Stops the capture process for a given configuration."""
        print(f"Stopping capture for config_id: {config_id}")
        # In a real scenario, this would involve stopping an async task
        return {"status": "stopped", "config_id": config_id}

# Example of how this agent would be used (for testing)
async def main():
    import os
    
    # Ensure settings are loaded and validated
    settings.validate()

    # Need a valid bot token and channel ID in .env for this to work
    if not settings.DISCORD_BOT_TOKEN or not os.getenv("TEST_DISCORD_CHANNEL_ID"):
        print("Please set DISCORD_BOT_TOKEN and TEST_DISCORD_CHANNEL_ID in your .env for testing.")
        return

    agent = DiscordCaptureAgent()
    
    # Dummy config ID for testing
    dummy_config_id = "test_config_123"
    
    # Example: Start capture from a specific time
    # from_ts = datetime(2024, 1, 1, tzinfo=timezone.utc)
    # result = await agent.start_capture(dummy_config_id, from_timestamp=from_ts, limit_messages=5)
    
    result = await agent.start_capture(dummy_config_id, limit_messages=5)
    print(f"Capture result: {result}")
    
    await agent.discord_client.close()

if __name__ == "__main__":
    asyncio.run(main())