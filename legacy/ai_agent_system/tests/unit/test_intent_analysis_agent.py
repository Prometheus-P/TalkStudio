# ai_agent_system/tests/unit/test_intent_analysis_agent.py
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from bson import ObjectId
from uuid import uuid4

from ai_agent_system.src.agents.intent_analysis_agent import IntentAnalysisAgent
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult
from ai_agent_system.src.services.nlp_processor import NLPProcessor

# --- Fixtures ---
@pytest.fixture
def mock_nlp_processor():
    with patch('ai_agent_system.src.agents.intent_analysis_agent.NLPProcessor', autospec=True) as MockNLPProcessor:
        instance = MockNLPProcessor.return_value
        instance.preprocess_discord_message.return_value = "preprocessed content"
        instance.extract_intent.return_value = ["질문"]
        instance.extract_keywords.return_value = ["키워드1", "키워드2"]
        instance.analyze_sentiment.return_value = "neutral"
        yield instance

@pytest.fixture
def mock_mongodb_client():
    with patch('ai_agent_system.src.agents.intent_analysis_agent.MongoDBClient', autospec=True) as MockMongoDBClient:
        instance = MockMongoDBClient.return_value
        instance.get_db.return_value = {} # Mock a dictionary-like DB
        instance.get_db.return_value["intent_analysis_results"] = MagicMock()
        instance.get_db.return_value["discord_messages"] = MagicMock()
        instance.get_db.return_value["intent_analysis_results"].insert_one = AsyncMock()
        instance.get_db.return_value["discord_messages"].update_one = AsyncMock()
        yield instance

@pytest.fixture
def analysis_agent(mock_nlp_processor, mock_mongodb_client):
    agent = IntentAnalysisAgent()
    agent.nlp_processor = mock_nlp_processor
    agent.db_client = mock_mongodb_client
    agent.db = mock_mongodb_client.get_db.return_value
    return agent

@pytest.fixture
def dummy_discord_message():
    return DiscordMessage(
        id=str(uuid4()),
        discordMessageId="test_msg_id_1", authorId="user_1", authorName="Test User",
        timestamp=datetime.now(timezone.utc), content="This is a test message content.",
        channelId="channel_1", serverId="server_1"
    )

# --- Tests ---
@pytest.mark.asyncio
async def test_analyze_message_no_content(analysis_agent, dummy_discord_message, capsys):
    dummy_discord_message.content = ""
    result = await analysis_agent.analyze_message(dummy_discord_message)
    assert result is None
    captured = capsys.readouterr()
    assert "Skipping analysis for message" in captured.out

@pytest.mark.asyncio
async def test_analyze_message_content_removed_after_preprocessing(analysis_agent, dummy_discord_message, mock_nlp_processor, capsys):
    mock_nlp_processor.preprocess_discord_message.return_value = ""
    result = await analysis_agent.analyze_message(dummy_discord_message)
    assert result is None
    captured = capsys.readouterr()
    assert "content removed during preprocessing" in captured.out

@pytest.mark.asyncio
async def test_analyze_message_success(analysis_agent, dummy_discord_message, mock_nlp_processor, mock_mongodb_client):
    result = await analysis_agent.analyze_message(dummy_discord_message)
    
    assert isinstance(result, IntentAnalysisResult)
    assert result.discordMessageId == dummy_discord_message.discordMessageId
    assert result.extractedIntents == ["질문"]
    assert result.keywords == ["키워드1", "키워드2"]
    assert result.sentiment == "neutral"

    mock_nlp_processor.preprocess_discord_message.assert_called_once_with(dummy_discord_message.content)
    mock_nlp_processor.extract_intent.assert_called_once_with("preprocessed content")
    mock_nlp_processor.extract_keywords.assert_called_once_with("preprocessed content")
    mock_nlp_processor.analyze_sentiment.assert_called_once_with("preprocessed content")
    
    mock_mongodb_client.get_db.return_value["intent_analysis_results"].insert_one.assert_called_once()
    mock_mongodb_client.get_db.return_value["discord_messages"].update_one.assert_called_once_with(
        {"_id": dummy_discord_message.id},
        {"$set": {"isProcessed": True, "updatedAt": MagicMock()}} # updatedAt will be datetime.now(), so use MagicMock()
    )

@pytest.mark.asyncio
async def test_analyze_message_db_save_failure(analysis_agent, dummy_discord_message, mock_mongodb_client, capsys):
    mock_mongodb_client.get_db.return_value["intent_analysis_results"].insert_one.side_effect = Exception("DB Error")
    result = await analysis_agent.analyze_message(dummy_discord_message)
    assert result is None
    captured = capsys.readouterr()
    assert "Error saving intent analysis result" in captured.out
