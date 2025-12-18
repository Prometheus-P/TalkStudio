# ai_agent_system/tests/unit/test_settings.py
import os
import pytest
from unittest.mock import patch
from ai_agent_system.src.config.settings import Settings

@pytest.fixture
def mock_env_vars():
    with patch.dict(os.environ, {
        "DISCORD_BOT_TOKEN": "test_discord_token",
        "UPSTAGE_API_KEY": "test_upstage_key",
        "DATABASE_URL": "mongodb://localhost:27017/test_db",
    }):
        yield

@pytest.fixture
def clear_env_vars():
    original_discord_token = os.getenv("DISCORD_BOT_TOKEN")
    original_upstage_key = os.getenv("UPSTAGE_API_KEY")
    original_db_url = os.getenv("DATABASE_URL")

    if original_discord_token:
        del os.environ["DISCORD_BOT_TOKEN"]
    if original_upstage_key:
        del os.environ["UPSTAGE_API_KEY"]
    if original_db_url:
        del os.environ["DATABASE_URL"]
    yield
    if original_discord_token:
        os.environ["DISCORD_BOT_TOKEN"] = original_discord_token
    if original_upstage_key:
        os.environ["UPSTAGE_API_KEY"] = original_upstage_key
    if original_db_url:
        os.environ["DATABASE_URL"] = original_db_url


def test_settings_load_from_env(mock_env_vars):
    # Re-import settings to ensure environment variables are re-read
    from importlib import reload
    import ai_agent_system.src.config.settings
    settings = reload(ai_agent_system.src.config.settings).settings

    assert settings.DISCORD_BOT_TOKEN == "test_discord_token"
    assert settings.UPSTAGE_API_KEY == "test_upstage_key"
    assert settings.DATABASE_URL == "mongodb://localhost:27017/test_db"

def test_settings_validation_missing_db_url(clear_env_vars, capsys):
    from importlib import reload
    
    with pytest.raises(SystemExit) as excinfo:
        reload(ai_agent_system.src.config.settings)
    assert excinfo.value.code == 1
    
    captured = capsys.readouterr()
    assert "ERROR: DATABASE_URL is not set." in captured.out

def test_settings_validation_missing_discord_token(clear_env_vars, capsys):
    with patch.dict(os.environ, {"DATABASE_URL": "dummy_db"}):
        from importlib import reload
        settings = reload(ai_agent_system.src.config.settings).settings
        settings.validate() # Manually call validate if not done on import

    captured = capsys.readouterr()
    assert "WARNING: DISCORD_BOT_TOKEN is not set." in captured.out
    assert settings.DATABASE_URL == "dummy_db"

def test_settings_validation_missing_upstage_key(clear_env_vars, capsys):
    with patch.dict(os.environ, {"DATABASE_URL": "dummy_db", "DISCORD_BOT_TOKEN": "dummy_token"}):
        from importlib import reload
        settings = reload(ai_agent_system.src.config.settings).settings
        settings.validate()

    captured = capsys.readouterr()
    assert "WARNING: UPSTAGE_API_KEY is not set." in captured.out
