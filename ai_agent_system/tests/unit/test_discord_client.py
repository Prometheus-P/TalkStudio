# ai_agent_system/tests/unit/test_discord_client.py
import pytest
import asyncio
import discord
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone, timedelta
import os

# Mock the settings module before importing DiscordClient
@pytest.fixture(autouse=True)
def mock_settings():
    with patch('ai_agent_system.src.config.settings.settings') as mock_settings_obj:
        mock_settings_obj.DISCORD_BOT_TOKEN = "TEST_BOT_TOKEN"
        mock_settings_obj.TZ = timezone.utc
        yield mock_settings_obj

@pytest.fixture
def mock_discord_client():
    with patch('discord.Client', spec=True) as MockDiscordClient:
        instance = MockDiscordClient.return_value
        instance.is_ready = AsyncMock(return_value=True)
        instance.start = AsyncMock()
        instance.wait_until_ready = AsyncMock()
        instance.close = AsyncMock()
        instance.get_channel.return_value = MagicMock(spec=discord.TextChannel)
        yield instance

@pytest.fixture
def mock_my_discord_bot():
    with patch('ai_agent_system.src.services.discord_client.MyDiscordBot', spec=True) as MockMyDiscordBot:
        instance = MockMyDiscordBot.return_value
        instance.is_ready.return_value = True
        instance.start = AsyncMock()
        instance.wait_until_ready_and_connected = AsyncMock()
        instance.close = AsyncMock()
        instance.get_channel.return_value = MagicMock(spec=discord.TextChannel)
        yield instance


@pytest.mark.asyncio
async def test_discord_client_init_no_token_in_settings_raises_error(mock_settings):
    mock_settings.DISCORD_BOT_TOKEN = None
    from ai_agent_system.src.services.discord_client import DiscordClient
    with pytest.raises(ValueError, match="Discord bot token not provided"):
        DiscordClient()

@pytest.mark.asyncio
async def test_discord_client_init_with_token(mock_settings):
    from ai_agent_system.src.services.discord_client import DiscordClient
    client = DiscordClient("ANOTHER_TOKEN")
    assert client.bot_token == "ANOTHER_TOKEN"

@pytest.mark.asyncio
async def test_discord_client_start_bot_called_on_fetch(mock_my_discord_bot):
    from ai_agent_system.src.services.discord_client import DiscordClient
    discord_client_instance = DiscordClient()
    discord_client_instance.client = mock_my_discord_bot
    mock_my_discord_bot.is_ready.return_value = False # Simulate bot not ready initially

    # Mock channel.history() to return an async iterator
    async def mock_history():
        yield MagicMock(spec=discord.Message)
    mock_my_discord_bot.get_channel.return_value.history.return_value = mock_history()

    await discord_client_instance.fetch_channel_messages("12345")
    mock_my_discord_bot.wait_until_ready_and_connected.assert_called_once()
    assert mock_my_discord_bot.start.call_count == 1

@pytest.mark.asyncio
async def test_fetch_channel_messages_no_channel_found(mock_my_discord_bot):
    from ai_agent_system.src.services.discord_client import DiscordClient
    discord_client_instance = DiscordClient()
    discord_client_instance.client = mock_my_discord_bot
    mock_my_discord_bot.get_channel.return_value = None # Simulate channel not found

    messages = await discord_client_instance.fetch_channel_messages("non_existent_channel")
    assert messages == []

@pytest.mark.asyncio
async def test_fetch_channel_messages_success(mock_my_discord_bot):
    from ai_agent_system.src.services.discord_client import DiscordClient
    discord_client_instance = DiscordClient()
    discord_client_instance.client = mock_my_discord_bot

    mock_msg1 = MagicMock(spec=discord.Message, created_at=datetime.now(timezone.utc) - timedelta(hours=1))
    mock_msg2 = MagicMock(spec=discord.Message, created_at=datetime.now(timezone.utc))

    async def mock_history_iterator():
        yield mock_msg1
        yield mock_msg2

    mock_my_discord_bot.get_channel.return_value.history.return_value = mock_history_iterator()

    messages = await discord_client_instance.fetch_channel_messages("12345", limit=2)
    assert len(messages) == 2
    assert messages[0] == mock_msg1
    assert messages[1] == mock_msg2

@pytest.mark.asyncio
async def test_fetch_channel_messages_forbidden(mock_my_discord_bot):
    from ai_agent_system.src.services.discord_client import DiscordClient
    discord_client_instance = DiscordClient()
    discord_client_instance.client = mock_my_discord_bot
    
    # Configure mock channel.history to raise Forbidden
    mock_my_discord_bot.get_channel.return_value.history.side_effect = discord.errors.Forbidden(MagicMock(), MagicMock())

    messages = await discord_client_instance.fetch_channel_messages("12345")
    assert messages == []

@pytest.mark.asyncio
async def test_fetch_channel_messages_http_exception_with_backoff(mock_my_discord_bot):
    from ai_agent_system.src.services.discord_client import DiscordClient
    discord_client_instance = DiscordClient()
    discord_client_instance.client = mock_my_discord_bot

    # Configure mock channel.history to raise HTTPException
    mock_my_discord_bot.get_channel.return_value.history.side_effect = discord.errors.HTTPException(MagicMock(), MagicMock())

    with pytest.raises(discord.errors.HTTPException):
        await discord_client_instance.fetch_channel_messages("12345")
    # backoff should have retried, but since it's raising immediately in test,
    # we just check if it raised the correct exception.
