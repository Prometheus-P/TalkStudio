# ai_agent_system/tests/unit/test_upstage_client.py
import pytest
import httpx
import asyncio
from unittest.mock import AsyncMock, patch
from ai_agent_system.src.services.upstage_client import UpstageClient
import logging

# Suppress actual logging during tests
@pytest.fixture(autouse=True)
def caplog_fixture(caplog):
    caplog.set_level(logging.CRITICAL)

@pytest.fixture
def mock_settings():
    with patch('ai_agent_system.src.config.settings.settings') as mock_settings_obj:
        mock_settings_obj.UPSTAGE_API_KEY = "test_upstage_api_key"
        yield mock_settings_obj

@pytest.fixture
def mock_httpx_async_client():
    with patch('httpx.AsyncClient', autospec=True) as MockAsyncClient:
        instance = MockAsyncClient.return_value
        instance.post = AsyncMock()
        instance.aclose = AsyncMock()
        yield instance

@pytest.mark.asyncio
async def test_upstage_client_init_no_api_key_raises_error(mock_settings):
    mock_settings.UPSTAGE_API_KEY = None
    with pytest.raises(ValueError, match="Upstage API key not provided"):
        UpstageClient()

@pytest.mark.asyncio
async def test_upstage_client_init_with_api_key(mock_settings):
    client = UpstageClient("ANOTHER_API_KEY")
    assert client.api_key == "ANOTHER_API_KEY"
    assert "Bearer ANOTHER_API_KEY" in client.headers["Authorization"]

@pytest.mark.asyncio
async def test_text_generation_success(mock_httpx_async_client):
    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.json.return_value = {"choices": [{"text": "Generated response."}]}
    mock_response.raise_for_status.return_value = None # Ensure no exception is raised
    mock_httpx_async_client.post.return_value = mock_response

    client = UpstageClient()
    result = await client.text_generation(prompt="test prompt")

    assert result == "Generated response."
    mock_httpx_async_client.post.assert_called_once()
    assert client.api_call_count == 1
    assert client.total_input_tokens > 0 # Based on prompt splitting

@pytest.mark.asyncio
async def test_text_generation_success_with_completion_field(mock_httpx_async_client):
    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.json.return_value = {"completion": "Generated response with completion."}
    mock_response.raise_for_status.return_value = None
    mock_httpx_async_client.post.return_value = mock_response

    client = UpstageClient()
    result = await client.text_generation(prompt="test prompt")

    assert result == "Generated response with completion."
    mock_httpx_async_client.post.assert_called_once()
    assert client.api_call_count == 1
    assert client.total_input_tokens > 0

@pytest.mark.asyncio
async def test_text_generation_http_status_error(mock_httpx_async_client):
    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 400
    mock_response.raise_for_status.side_effect = httpx.HTTPStatusError("Bad Request", request=MagicMock(), response=mock_response)
    mock_httpx_async_client.post.return_value = mock_response

    client = UpstageClient()
    result = await client.text_generation(prompt="test prompt")

    assert result is None
    assert client.api_call_count == 1

@pytest.mark.asyncio
async def test_text_generation_request_error(mock_httpx_async_client):
    mock_httpx_async_client.post.side_effect = httpx.RequestError("Network error", request=MagicMock())

    client = UpstageClient()
    result = await client.text_generation(prompt="test prompt")

    assert result is None
    assert client.api_call_count == 1

@pytest.mark.asyncio
async def test_text_generation_unexpected_response_format(mock_httpx_async_client):
    mock_response = MagicMock(spec=httpx.Response)
    mock_response.status_code = 200
    mock_response.json.return_value = {"invalid_field": "some data"} # Invalid format
    mock_response.raise_for_status.return_value = None
    mock_httpx_async_client.post.return_value = mock_response

    client = UpstageClient()
    result = await client.text_generation(prompt="test prompt")

    assert result is None
    assert client.api_call_count == 1

@pytest.mark.asyncio
async def test_close_client(mock_httpx_async_client):
    client = UpstageClient()
    await client.close()
    mock_httpx_async_client.aclose.assert_called_once()
