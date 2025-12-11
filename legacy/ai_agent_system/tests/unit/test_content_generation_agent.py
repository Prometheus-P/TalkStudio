# ai_agent_system/tests/unit/test_content_generation_agent.py
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from bson import ObjectId
from uuid import uuid4

from ai_agent_system.src.agents.content_generation_agent import ContentGenerationAgent
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult
from ai_agent_system.src.models.generated_content_model import GeneratedContent
from ai_agent_system.src.services.upstage_client import UpstageClient
from ai_agent_system.src.services.prompt_engineer import PromptEngineer

# --- Fixtures ---
@pytest.fixture
def mock_upstage_client():
    with patch('ai_agent_system.src.agents.content_generation_agent.UpstageClient', autospec=True) as MockUpstageClient:
        instance = MockUpstageClient.return_value
        instance.text_generation = AsyncMock(return_value="Generated text by Upstage.")
        yield instance

@pytest.fixture
def mock_prompt_engineer():
    with patch('ai_agent_system.src.agents.content_generation_agent.PromptEngineer', autospec=True) as MockPromptEngineer:
        instance = MockPromptEngineer.return_value
        instance.generate_summary_prompt.return_value = "summary prompt"
        instance.generate_faq_answer_prompt.return_value = "faq prompt"
        instance.generate_idea_prompt.return_value = "idea prompt"
        yield instance

@pytest.fixture
def mock_mongodb_client():
    with patch('ai_agent_system.src.agents.content_generation_agent.MongoDBClient', autospec=True) as MockMongoDBClient:
        instance = MockMongoDBClient.return_value
        instance.get_db.return_value = {} # Mock a dictionary-like DB
        instance.get_db.return_value["discord_messages"] = MagicMock()
        instance.get_db.return_value["intent_analysis_results"] = MagicMock()
        instance.get_db.return_value["generated_contents"] = MagicMock()
        instance.get_db.return_value["generated_contents"].insert_one = AsyncMock()
        yield instance

@pytest.fixture
def content_generation_agent(mock_upstage_client, mock_prompt_engineer, mock_mongodb_client):
    agent = ContentGenerationAgent()
    agent.upstage_client = mock_upstage_client
    agent.prompt_engineer = mock_prompt_engineer
    agent.db_client = mock_mongodb_client
    agent.db = mock_mongodb_client.get_db.return_value
    return agent

@pytest.fixture
def dummy_discord_message_obj(): # Renamed to avoid conflict with list fixture
    return DiscordMessage(
        id=str(uuid4()),
        discordMessageId="test_msg_id_1", authorId="user_1", authorName="Test User",
        timestamp=datetime.now(timezone.utc), content="This is a test message content.",
        channelId="channel_1", serverId="server_1"
    )

@pytest.fixture
def dummy_intent_analysis_result():
    return IntentAnalysisResult(
        id=str(uuid4()),
        discordMessageId="test_msg_id_1", extractedIntents=["질문"], keywords=["test"], sentiment="neutral", analysisModelVersion="v1.0"
    )

@pytest.fixture
def mock_discord_messages_for_prompt():
    return [
        DiscordMessage(
            id=str(uuid4()),
            discordMessageId="msg1", authorId="user1", authorName="Alice",
            timestamp=datetime(2023, 1, 1, 10, 0, 0, tzinfo=timezone.utc), content="Hello, everyone! Any questions about the new feature?"
        ),
        DiscordMessage(
            id=str(uuid4()),
            discordMessageId="msg2", authorId="user2", authorName="Bob",
            timestamp=datetime(2023, 1, 1, 10, 5, 0, tzinfo=timezone.utc), content="Yes, I have a question about the pricing model."
        )
    ]

@pytest.fixture
def mock_intent_results_for_prompt():
    return [
        IntentAnalysisResult(
            id=str(uuid4()),
            discordMessageId="msg1", extractedIntents=["질문"], keywords=["new feature"], sentiment="neutral", analysisModelVersion="v1.0"
        ),
        IntentAnalysisResult(
            id=str(uuid4()),
            discordMessageId="msg2", extractedIntents=["질문"], keywords=["pricing model"], sentiment="neutral", analysisModelVersion="v1.0"
        )
    ]


# --- Tests ---
@pytest.mark.asyncio
async def test_generate_content_no_message_ids(content_generation_agent, capsys):
    result = await content_generation_agent.generate_content([], "summary")
    assert result is None
    captured = capsys.readouterr()
    assert "No Discord message IDs provided" in captured.out

@pytest.mark.asyncio
async def test_generate_content_no_messages_found(content_generation_agent, mock_mongodb_client, capsys):
    mock_mongodb_client.get_db.return_value["discord_messages"].find.return_value = [] # No messages found
    result = await content_generation_agent.generate_content(["non_existent_id"], "summary")
    assert result is None
    captured = capsys.readouterr()
    assert "No Discord messages found" in captured.out

@pytest.mark.asyncio
async def test_generate_content_unsupported_content_type(content_generation_agent, mock_discord_messages_for_prompt, mock_mongodb_client, capsys):
    mock_mongodb_client.get_db.return_value["discord_messages"].find.return_value = mock_discord_messages_for_prompt
    result = await content_generation_agent.generate_content([str(mock_discord_messages_for_prompt[0].id)], "unsupported_type")
    assert result is None
    captured = capsys.readouterr()
    assert "Unsupported content type" in captured.out

@pytest.mark.asyncio
async def test_generate_content_upstage_api_failure(content_generation_agent, mock_discord_messages_for_prompt, mock_mongodb_client, mock_upstage_client, capsys):
    mock_mongodb_client.get_db.return_value["discord_messages"].find.return_value = mock_discord_messages_for_prompt
    mock_upstage_client.text_generation.return_value = None # Simulate API failure
    
    result = await content_generation_agent.generate_content([str(mock_discord_messages_for_prompt[0].id)], "summary") # Pass actual ID
    assert result is None
    captured = capsys.readouterr()
    assert "Upstage API did not return generated text" in captured.out

@pytest.mark.asyncio
async def test_generate_content_summary_success(content_generation_agent, mock_discord_messages_for_prompt, mock_mongodb_client, mock_upstage_client, mock_prompt_engineer):
    mock_mongodb_client.get_db.return_value["discord_messages"].find.return_value = [mock_discord_messages_for_prompt[0]]
    mock_mongodb_client.get_db.return_value["intent_analysis_results"].find.return_value = [] # Not needed for summary
    
    result = await content_generation_agent.generate_content([str(mock_discord_messages_for_prompt[0].id)], "summary", {"max_tokens": 100})
    
    assert isinstance(result, GeneratedContent)
    assert result.generatedText == "Generated text by Upstage."
    mock_prompt_engineer.generate_summary_prompt.assert_called_once()
    mock_upstage_client.text_generation.assert_called_once_with(
        prompt="summary prompt", model_name="llama-2-70b-chat", temperature=0.7, max_tokens=100, top_p=1.0, stop_sequences=[]
    )
    mock_mongodb_client.get_db.return_value["generated_contents"].insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_generate_content_idea_list_success(content_generation_agent, mock_discord_messages_for_prompt, mock_mongodb_client, mock_upstage_client, mock_prompt_engineer, mock_intent_results_for_prompt):
    mock_mongodb_client.get_db.return_value["discord_messages"].find.return_value = [mock_discord_messages_for_prompt[0]]
    mock_mongodb_client.get_db.return_value["intent_analysis_results"].find.return_value = [mock_intent_results_for_prompt[0]] # Pass actual result
    
    result = await content_generation_agent.generate_content([str(mock_discord_messages_for_prompt[0].id)], "idea_list")
    
    assert isinstance(result, GeneratedContent)
    assert result.generatedText == "Generated text by Upstage."
    mock_prompt_engineer.generate_idea_prompt.assert_called_once()
    mock_upstage_client.text_generation.assert_called_once()
    mock_mongodb_client.get_db.return_value["generated_contents"].insert_one.assert_called_once()