# ai_agent_system/tests/unit/test_nlp_processor.py
import pytest
from ai_agent_system.src.services.nlp_processor import NLPProcessor

@pytest.fixture
def nlp_processor():
    return NLPProcessor()

def test_preprocess_discord_message_bot_command(nlp_processor):
    assert nlp_processor.preprocess_discord_message("!command arg1") == ""
    assert nlp_processor.preprocess_discord_message(".help") == ""
    assert nlp_processor.preprocess_discord_message("/status") == ""
    assert nlp_processor.preprocess_discord_message("Hello !command") == "Hello !command" # Only start of message

def test_preprocess_discord_message_mentions(nlp_processor):
    assert nlp_processor.preprocess_discord_message("Hello <@12345> and <#67890>") == "Hello and"
    assert nlp_processor.preprocess_discord_message("Hey <@!12345> check this out.") == "Hey check this out."
    assert nlp_processor.preprocess_discord_message("Role <@&12345> mentioned.") == "Role mentioned."

def test_preprocess_discord_message_urls(nlp_processor):
    assert nlp_processor.preprocess_discord_message("Check this link: https://example.com/path?query=1") == "Check this link:"
    assert nlp_processor.preprocess_discord_message("Link: http://test.org") == "Link:"

def test_preprocess_discord_message_emojis(nlp_processor):
    assert nlp_processor.preprocess_discord_message("Hello 👋 world ✨") == "Hello world"
    assert nlp_processor.preprocess_discord_message("Great 👍 work! 🎉") == "Great work!"

def test_preprocess_discord_message_whitespace(nlp_processor):
    assert nlp_processor.preprocess_discord_message("  hello   world  ") == "hello world"
    assert nlp_processor.preprocess_discord_message("line1\n\nline2") == "line1 line2"

def test_preprocess_discord_message_combined(nlp_processor):
    message = "!help <@123> Check this out: https://example.com/ 🎉"
    assert nlp_processor.preprocess_discord_message(message) == "" # Starts with command

    message = "Hey <@123> check this: https://example.com/ 🚀 Awesome!"
    expected = "Hey check this: Awesome!"
    assert nlp_processor.preprocess_discord_message(message) == expected

def test_extract_intent_basic(nlp_processor):
    assert nlp_processor.extract_intent("이 기능에 대해 질문이 있습니다.") == ["질문"]
    assert nlp_processor.extract_intent("새로운 아이디어를 제안합니다.") == ["제안"]
    assert nlp_processor.extract_intent("버그가 발생했어요 ㅠㅠ") == ["불만/버그"]
    assert nlp_processor.extract_intent("정말 감사합니다!") == ["감사"]
    assert nlp_processor.extract_intent("이거 요청해도 될까요?") == ["요청"]
    assert nlp_processor.extract_intent("오늘 날씨 좋네요") == ["일반"]
    assert "질문" in nlp_processor.extract_intent("질문과 제안이 있어요.")

def test_extract_keywords_basic(nlp_processor):
    assert "Feature" in nlp_processor.extract_keywords("New Feature Request")
    assert "Example" in nlp_processor.extract_keywords("This is an Example Message")
    assert "Message" in nlp_processor.extract_keywords("This is an Example Message")
    assert nlp_processor.extract_keywords("hello world") == ["hello", "world"] # Fallback

def test_analyze_sentiment_basic(nlp_processor):
    assert nlp_processor.analyze_sentiment("정말 좋은 기능입니다!") == "positive"
    assert nlp_processor.analyze_sentiment("버그 때문에 너무 짜증나요.") == "negative"
    assert nlp_processor.analyze_sentiment("그냥 그렇네요.") == "neutral"
