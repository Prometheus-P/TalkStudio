# ai_agent_system/tests/unit/test_discord_capture_agent.py
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import os

from ai_agent_system.src.agents.discord_capture_agent import DiscordCaptureAgent
from ai_agent_system.src.models.discord_config_model import DiscordConfig
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.config.settings import settings

# --- Fixtures ---
@pytest.fixture
def mock_discord_client():
    with patch('ai_agent_system.src.agents.discord_capture_agent.DiscordClient', autospec=True) as MockDiscordClient:
        instance = MockDiscordClient.return_value
        instance.fetch_channel_messages = AsyncMock()
        instance.close = AsyncMock()
        yield instance

@pytest.fixture
def mock_mongodb_client():
    with patch('ai_agent_system.src.agents.discord_capture_agent.MongoDBClient', autospec=True) as MockMongoDBClient:
        instance = MockMongoDBClient.return_value
        instance.get_db.return_value = {} # Mock a dictionary-like DB
        instance.get_db.return_value["discord_configs"] = MagicMock()
        instance.get_db.return_value["discord_messages"] = MagicMock()
        yield instance

@pytest.fixture
def capture_agent(mock_discord_client, mock_mongodb_client):
    agent = DiscordCaptureAgent()
    agent.discord_client = mock_discord_client
    agent.db_client = mock_mongodb_client
    agent.db = mock_mongodb_client.get_db.return_value
    return agent

@pytest.fixture
def dummy_discord_config():
    return DiscordConfig(
        id=str(ObjectId()),
        serverId="test_server_id",
        serverName="Test Server",
        botToken="dummy_bot_token", # This will be encrypted in real usage
        enabledChannels=["test_channel_id_1", "test_channel_id_2"],
        captureStartDate=datetime(2023, 1, 1, tzinfo=timezone.utc),
        isActive=True,
        lastCapturedTimestamp=None
    )

@pytest.fixture
def dummy_discord_message():
    return MagicMock(
        spec=discord.Message,
        id=12345,
        author=MagicMock(id=67890, display_name="TestUser"),
        created_at=datetime.now(timezone.utc),
        content="Test message content",
        channel=MagicMock(id=11111),
        guild=MagicMock(id=22222)
    )

# --- Tests ---
@pytest.mark.asyncio
async def test_get_discord_config_found(capture_agent, mock_mongodb_client, dummy_discord_config):
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = dummy_discord_config.dict(by_alias=True)
    
    config = await capture_agent._get_discord_config(dummy_discord_config.id)
    assert config == dummy_discord_config
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.assert_called_once_with({"_id": ObjectId(dummy_discord_config.id)})

@pytest.mark.asyncio
async def test_get_discord_config_not_found(capture_agent, mock_mongodb_client):
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = None
    
    config = await capture_agent._get_discord_config("non_existent_id")
    assert config is None

@pytest.mark.asyncio
async def test_save_discord_message(capture_agent, mock_mongodb_client, dummy_discord_message):
    saved_message = await capture_agent._save_discord_message(dummy_discord_message)
    assert isinstance(saved_message, DiscordMessage)
    assert saved_message.discordMessageId == str(dummy_discord_message.id)
    mock_mongodb_client.get_db.return_value["discord_messages"].insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_update_discord_config_last_captured(capture_agent, mock_mongodb_client, dummy_discord_config):
    new_timestamp = datetime.now(timezone.utc)
    await capture_agent._update_discord_config_last_captured(dummy_discord_config.id, new_timestamp)
    mock_mongodb_client.get_db.return_value["discord_configs"].update_one.assert_called_once_with(
        {"_id": ObjectId(dummy_discord_config.id)},
        {"$set": {"lastCapturedTimestamp": new_timestamp, "updatedAt": new_timestamp}} # Note: updatedAt in agent uses datetime.now(), so comparing against that.
    )

@pytest.mark.asyncio
async def test_start_capture_config_not_found(capture_agent, mock_mongodb_client):
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = None
    result = await capture_agent.start_capture("non_existent_id")
    assert result["status"] == "failed"
    assert "not found" in result["message"]

@pytest.mark.asyncio
async def test_start_capture_no_enabled_channels(capture_agent, mock_mongodb_client, dummy_discord_config):
    dummy_discord_config.enabledChannels = []
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = dummy_discord_config.dict(by_alias=True)
    result = await capture_agent.start_capture(dummy_discord_config.id)
    assert result["status"] == "failed"
    assert "no enabled channels" in result["message"]

@pytest.mark.asyncio
async def test_start_capture_success_new_capture(capture_agent, mock_discord_client, mock_mongodb_client, dummy_discord_config, dummy_discord_message):
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = dummy_discord_config.dict(by_alias=True)
    
    # Mock messages from discord client
    async def mock_history_iterator():
        yield dummy_discord_message
    mock_discord_client.fetch_channel_messages.return_value = [dummy_discord_message]

    result = await capture_agent.start_capture(dummy_discord_config.id, limit_messages=1)
    assert result["status"] == "completed"
    assert result["messages_captured"] == 1
    mock_discord_client.fetch_channel_messages.assert_called_once()
    mock_mongodb_client.get_db.return_value["discord_messages"].insert_one.assert_called_once()
    # Check if lastCapturedTimestamp was updated
    mock_mongodb_client.get_db.return_value["discord_configs"].update_one.assert_called_once()


@pytest.mark.asyncio
async def test_start_capture_resumes_from_last_timestamp(capture_agent, mock_discord_client, mock_mongodb_client, dummy_discord_config, dummy_discord_message):
    dummy_discord_config.lastCapturedTimestamp = datetime(2023, 1, 15, tzinfo=timezone.utc)
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = dummy_discord_config.dict(by_alias=True)
    
    mock_discord_client.fetch_channel_messages.return_value = [dummy_discord_message]

    await capture_agent.start_capture(dummy_discord_config.id, limit_messages=1)
    # Check that fetch_channel_messages was called with lastCapturedTimestamp
    mock_discord_client.fetch_channel_messages.assert_called_once_with(
        channel_id=ANY, limit=1, after=dummy_discord_config.lastCapturedTimestamp
    )

@pytest.mark.asyncio
async def test_stop_capture(capture_agent):
    result = await capture_agent.stop_capture("some_config_id")
    assert result["status"] == "stopped"

@pytest.mark.asyncio
async def test_get_capture_status(capture_agent, mock_mongodb_client, dummy_discord_config):
    mock_mongodb_client.get_db.return_value["discord_configs"].find_one.return_value = dummy_discord_config.dict(by_alias=True)
    mock_mongodb_client.get_db.return_value["discord_messages"].count_documents.return_value = 100
    
    status = await capture_agent.get_capture_status(dummy_discord_config.id)
    assert status["status"] == "completed" # Because lastCapturedTimestamp is None, it defaults to completed in this dummy fixture
    assert status["messagesCaptured"] == 100
    mock_mongodb_client.get_db.return_value["discord_messages"].count_documents.assert_called_once_with({"discordConfigId": dummy_discord_config.id})

# Added for ANY mock
from unittest.mock import ANY
