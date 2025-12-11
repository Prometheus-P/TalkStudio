# ai_agent_system/src/services/discord_client.py
import asyncio
import discord
from discord.errors import Forbidden, HTTPException, RateLimited
from ai_agent_system.src.config.settings import settings
from datetime import datetime, timezone, timedelta
import os
import backoff # Will need to install backoff

# Temporarily add TZ to settings for example if not set
if not hasattr(settings, 'TZ'):
    settings.TZ = timezone.utc

class DiscordClient:
    def __init__(self, bot_token: str = None):
        self.bot_token = bot_token if bot_token else settings.DISCORD_BOT_TOKEN
        if not self.bot_token:
            raise ValueError("Discord bot token not provided or not found in settings.")
        
        intents = discord.Intents.default()
        intents.message_content = True
        intents.guild_messages = True
        intents.members = True

        self.client = discord.Client(intents=intents)
        # self.lock = asyncio.Lock() # discord.py client handles rate limits internally for its own API calls

        @self.client.event
        async def on_ready():
            print(f'Logged in as {self.client.user} (ID: {self.client.user.id})')
            print('------')

    async def _start_bot(self):
        """Starts the discord bot if it's not already running."""
        # This approach of starting and stopping the bot client for each API call is not ideal
        # for a long-running bot. A better approach would be to manage the bot's lifecycle
        # as a separate background process or service. For a simple API call agent,
        # ensuring it's ready before a call is a quick way.
        if not self.client.is_ready():
            try:
                # Use a separate task to run the bot and wait for it to be ready.
                # This ensures the event loop doesn't block if the bot takes time to connect.
                asyncio.create_task(self.client.start(self.bot_token))
                await self.client.wait_until_ready()
                print("Discord client is ready to make API calls.")
            except discord.LoginFailure:
                print("Discord Login failed. Check bot token.")
                raise
            except Exception as e:
                print(f"An error occurred starting Discord bot: {e}")
                raise

    @backoff.on_exception(backoff.expo,
                          (RateLimited, HTTPException),
                          max_tries=5,
                          factor=2,
                          jitter=None) # Added jitter=None for deterministic retries in testing
    async def fetch_channel_messages(self, channel_id: str, limit: int = None, after: datetime = None):
        """
        Fetches messages from a specific Discord channel with retry logic.
        :param channel_id: The ID of the channel to fetch messages from.
        :param limit: Maximum number of messages to fetch.
        :param after: Only fetch messages sent after this datetime.
        :return: A list of discord.Message objects.
        """
        # Ensure bot is running before making API calls
        # This will block until the bot is ready.
        await self._start_bot()

        try:
            channel = self.client.get_channel(int(channel_id))
            if not channel:
                print(f"Channel with ID {channel_id} not found.")
                return []

            messages = []
            async for message in channel.history(limit=limit, after=after, oldest_first=True):
                messages.append(message)
            return messages
        except Forbidden:
            print(f"Bot does not have permissions to read messages in channel {channel_id}.")
            return []
        except RateLimited as e:
            print(f"Rate limited by Discord API. Retrying in {e.retry_after} seconds.")
            raise # backoff decorator will catch this
        except HTTPException as e:
            print(f"HTTPException while fetching messages: {e}")
            # Re-raise to let backoff handle it. discord.py often handles some HTTP exceptions internally.
            raise 
        except Exception as e:
            print(f"An unexpected error occurred while fetching messages: {e}")
            raise
        finally:
            # The client should ideally be managed by a higher-level agent lifecycle
            # rather than closing it after each fetch if it's part of a long-running process.
            pass

    async def close(self):
        """Closes the Discord client connection."""
        if self.client.is_ready():
            await self.client.close()

# Example usage (for testing purposes, not part of the main client logic)
async def main():
    import os
    
    # Ensure settings are loaded and validated
    settings.validate()

    # Need a valid bot token and channel ID in .env for this to work
    if not settings.DISCORD_BOT_TOKEN or not os.getenv("TEST_DISCORD_CHANNEL_ID"):
        print("Please set DISCORD_BOT_TOKEN and TEST_DISCORD_CHANNEL_ID in your .env for testing.")
        return

    discord_client = DiscordClient(settings.DISCORD_BOT_TOKEN)
    
    test_channel_id = os.getenv("TEST_DISCORD_CHANNEL_ID")
    if not test_channel_id:
        print("TEST_DISCORD_CHANNEL_ID is not set in your .env for testing.")
        await discord_client.close()
        return

    print(f"Fetching messages from channel {test_channel_id}...")
    
    # Example: Fetch 10 messages from the last 24 hours
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    messages = await discord_client.fetch_channel_messages(test_channel_id, limit=10, after=yesterday)

    for msg in messages:
        print(f"[{msg.created_at}] {msg.author.name}: {msg.content}")

    await discord_client.close()
    print("Bot client closed.")

if __name__ == '__main__':
    asyncio.run(main())