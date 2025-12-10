# ai_agent_system/tests/unit/test_discord_notifier.py
import pytest
import asyncio
import discord
from unittest.mock import AsyncMock, MagicMock, patch
from ai_agent_system.src.services.discord_notifier import DiscordNotifier
import logging

# Suppress actual logging during tests
@pytest.fixture(autouse=True)
def caplog_fixture(caplog):
    caplog.set_level(logging.CRITICAL)

@pytest.fixture
def mock_settings():
    with patch('ai_agent_system.src.config.settings.settings') as mock_settings_obj:
        mock_settings_obj.DISCORD_BOT_TOKEN = "TEST_NOTIFIER_BOT_TOKEN"
        yield mock_settings_obj

@pytest.fixture
def mock_discord_client():
    with patch('discord.Client', spec=True) as MockDiscordClient:
        instance = MockDiscordClient.return_value
        instance.is_ready.return_value = False # Bot not ready initially
        instance.start = AsyncMock()
        instance.close = AsyncMock()
        instance.get_channel.return_value = MagicMock(spec=discord.TextChannel) # Return a TextChannel mock
        instance.get_channel.return_value.send = AsyncMock(return_value=MagicMock(spec=discord.Message, id=123))
        yield instance

@pytest.mark.asyncio
async def test_notifier_init_no_token_raises_error(mock_settings):
    mock_settings.DISCORD_BOT_TOKEN = None
    with pytest.raises(ValueError, match="Discord bot token not provided"):
        DiscordNotifier()

@pytest.mark.asyncio
async def test_notifier_init_with_token(mock_settings):
    notifier = DiscordNotifier("ANOTHER_NOTIFIER_TOKEN")
    assert notifier.bot_token == "ANOTHER_NOTIFIER_TOKEN"

@pytest.mark.asyncio
async def test_send_message_bot_starts_once(mock_discord_client):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client

    # Simulate on_ready event firing after start
    async def mock_start_and_ready():
        await asyncio.sleep(0.01) # Simulate some async work
        notifier.client.is_ready.return_value = True
        notifier.client.loop.call_soon_threadsafe(notifier._is_ready.set)
    
    mock_discord_client.start.side_effect = mock_start_and_ready

    await notifier.send_message("123", "test message")
    mock_discord_client.start.assert_called_once()
    mock_discord_client.get_channel.assert_called_once_with(123)
    mock_discord_client.get_channel.return_value.send.assert_called_once_with("test message")

@pytest.mark.asyncio
async def test_send_message_channel_not_found(mock_discord_client, caplog):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client
    mock_discord_client.is_ready.return_value = True # Assume bot is ready
    mock_discord_client.get_channel.return_value = None

    result = await notifier.send_message("non_existent_channel", "test message")
    assert result is None
    assert "Channel with ID non_existent_channel not found" in caplog.text

@pytest.mark.asyncio
async def test_send_message_not_text_channel(mock_discord_client, caplog):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client
    mock_discord_client.is_ready.return_value = True # Assume bot is ready
    mock_discord_client.get_channel.return_value = MagicMock(spec=discord.VoiceChannel) # Simulate non-text channel

    result = await notifier.send_message("voice_channel_id", "test message")
    assert result is None
    assert "is not a text channel" in caplog.text

@pytest.mark.asyncio
async def test_send_message_forbidden(mock_discord_client, caplog):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client
    mock_discord_client.is_ready.return_value = True # Assume bot is ready
    mock_discord_client.get_channel.return_value.send.side_effect = discord.errors.Forbidden(MagicMock(), MagicMock())

    result = await notifier.send_message("123", "test message")
    assert result is None
    assert "Forbidden" in caplog.text

@pytest.mark.asyncio
async def test_send_message_http_exception(mock_discord_client, caplog):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client
    mock_discord_client.is_ready.return_value = True # Assume bot is ready
    mock_discord_client.get_channel.return_value.send.side_effect = discord.errors.HTTPException(MagicMock(), MagicMock())

    result = await notifier.send_message("123", "test message")
    assert result is None
    assert "HTTPException" in caplog.text

@pytest.mark.asyncio
async def test_close_client(mock_discord_client):
    notifier = DiscordNotifier()
    notifier.client = mock_discord_client
    notifier.client.is_ready.return_value = True

    await notifier.close()
    mock_discord_client.close.assert_called_once()
