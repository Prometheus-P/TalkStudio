# ai_agent_system/src/services/discord_notifier.py
import asyncio
import discord
from discord.errors import Forbidden, HTTPException
from ai_agent_system.src.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class DiscordNotifier:
    def __init__(self, bot_token: str = None):
        self.bot_token = bot_token if bot_token else settings.DISCORD_BOT_TOKEN
        if not self.bot_token:
            raise ValueError("Discord bot token not provided or not found in settings.")
        
        intents = discord.Intents.default()
        # Message content intent is generally not needed for sending messages, but might be if bot reads its own messages
        # intents.message_content = True 

        self.client = discord.Client(intents=intents)
        self._is_ready = asyncio.Event()

        @self.client.event
        async def on_ready():
            logger.info(f'Notifier Bot logged in as {self.client.user} (ID: {self.client.user.id})')
            self.client.loop.call_soon_threadsafe(self._is_ready.set) # Signal that the bot is ready

    async def _start_bot_once(self):
        """Starts the discord bot client if not already running."""
        if not self.client.is_ready() and not self._is_ready.is_set():
            logger.info("Starting Discord Notifier bot client...")
            try:
                # Run the bot in the background without blocking the current event loop
                asyncio.create_task(self.client.start(self.bot_token))
                await self._is_ready.wait() # Wait until on_ready signals readiness
                logger.info("Discord Notifier bot is ready.")
            except discord.LoginFailure:
                logger.error("Discord Notifier Login failed. Check bot token.")
                raise
            except Exception as e:
                logger.error(f"An error occurred starting Discord Notifier bot: {e}")
                raise
        elif self.client.is_ready():
            logger.debug("Discord Notifier bot is already running.")
        else:
            await self._is_ready.wait() # If bot is starting in another task, wait for it


    async def send_message(self, channel_id: str, message_content: str) -> Optional[discord.Message]:
        """
        Sends a message to a specified Discord channel.
        :param channel_id: The ID of the channel to send the message to.
        :param message_content: The content of the message to send.
        :return: The sent discord.Message object, or None if an error occurs.
        """
        await self._start_bot_once()

        try:
            channel = self.client.get_channel(int(channel_id))
            if not channel:
                logger.error(f"Channel with ID {channel_id} not found by notifier bot.")
                return None
            
            if not isinstance(channel, discord.TextChannel):
                logger.warning(f"Channel {channel_id} is not a text channel. Cannot send message.")
                return None

            sent_message = await channel.send(message_content)
            logger.info(f"Message sent to channel {channel_id}: {message_content[:50]}...")
            return sent_message
        except Forbidden:
            logger.error(f"Notifier bot does not have permissions to send messages in channel {channel_id}.")
            return None
        except HTTPException as e:
            logger.error(f"HTTPException while sending message: {e}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred while sending message: {e}")
            return None

    async def close(self):
        """Closes the Discord client connection."""
        if self.client.is_ready():
            await self.client.close()
            logger.info("Discord Notifier bot client closed.")

# Example usage
async def main():
    from ai_agent_system.src.config.settings import settings
    settings.validate()
    
    # Needs DISCORD_BOT_TOKEN and TEST_NOTIFICATION_CHANNEL_ID in .env
    if not settings.DISCORD_BOT_TOKEN or not os.getenv("TEST_NOTIFICATION_CHANNEL_ID"):
        logger.warning("Please set DISCORD_BOT_TOKEN and TEST_NOTIFICATION_CHANNEL_ID in your .env for testing.")
        return

    notifier = DiscordNotifier()
    
    test_channel_id = os.getenv("TEST_NOTIFICATION_CHANNEL_ID")
    test_message = "TalkStudio에서 생성된 새로운 콘텐츠 요약입니다: ... #TEST"
    
    print(f"Sending test message to channel {test_channel_id}...")
    sent = await notifier.send_message(test_channel_id, test_message)
    
    if sent:
        print(f"Message sent successfully: {sent.id}")
    else:
        print("Failed to send message.")
        
    await notifier.close()

if __name__ == "__main__":
    asyncio.run(main())
