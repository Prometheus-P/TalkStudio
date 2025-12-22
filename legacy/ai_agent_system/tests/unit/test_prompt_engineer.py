# ai_agent_system/tests/unit/test_prompt_engineer.py
import pytest
from datetime import datetime, timezone
from ai_agent_system.src.services.prompt_engineer import PromptEngineer
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult

@pytest.fixture
def prompt_engineer():
    return PromptEngineer()

@pytest.fixture
def mock_discord_messages():
    return [
        DiscordMessage(
            discordMessageId="msg1", authorId="user1", authorName="Alice",
            timestamp=datetime(2023, 1, 1, 10, 0, 0, tzinfo=timezone.utc), content="Hello, everyone! Any questions about the new feature?"
        ),
        DiscordMessage(
            discordMessageId="msg2", authorId="user2", authorName="Bob",
            timestamp=datetime(2023, 1, 1, 10, 5, 0, tzinfo=timezone.utc), content="Yes, I have a question about the pricing model."
        ),
        DiscordMessage(
            discordMessageId="msg3", authorId="user1", authorName="Alice",
            timestamp=datetime(2023, 1, 1, 10, 10, 0, tzinfo=timezone.utc), content="The pricing is tiered. See our website."
        )
    ]

@pytest.fixture
def mock_intent_results():
    return [
        IntentAnalysisResult(
            discordMessageId="msg1", extractedIntents=["질문"], keywords=["new feature"], sentiment="neutral", analysisModelVersion="v1.0"
        ),
        IntentAnalysisResult(
            discordMessageId="msg2", extractedIntents=["질문"], keywords=["pricing model"], sentiment="neutral", analysisModelVersion="v1.0"
        )
    ]


def test_generate_summary_prompt(prompt_engineer, mock_discord_messages):
    prompt = prompt_engineer.generate_summary_prompt(mock_discord_messages)
    assert "다음은 Discord 대화 내역입니다. 이 대화의 핵심 내용을 1-2문단으로 요약해주세요:" in prompt
    assert "Alice (2023-01-01T10:00:00+00:00): Hello, everyone! Any questions about the new feature?" in prompt
    assert "Bob (2023-01-01T10:05:00+00:00): Yes, I have a question about the pricing model." in prompt

def test_generate_faq_answer_prompt(prompt_engineer, mock_discord_messages):
    question = "새로운 기능의 가격 정책은 어떻게 되나요?"
    prompt = prompt_engineer.generate_faq_answer_prompt(question, mock_discord_messages)
    assert f"다음 대화 내용을 참고하여 '{question}'에 대한 답변을 생성해주세요." in prompt
    assert "Bob: Yes, I have a question about the pricing model." in prompt
    assert "답변:" in prompt

def test_generate_idea_prompt(prompt_engineer, mock_intent_results, mock_discord_messages):
    prompt = prompt_engineer.generate_idea_prompt(mock_intent_results, mock_discord_messages)
    assert "다음은 Discord 대화 내역과 분석된 의도/키워드입니다. 이 정보를 바탕으로 5가지 새로운 아이디어나 개선 방안을 제안해주세요." in prompt
    assert "주요 의도: 질문" in prompt # Only '질문' from mock_intent_results
    assert "핵심 키워드: new feature, pricing model" in prompt # All unique keywords
    assert "Alice: The pricing is tiered. See our website." in prompt
    assert "아이디어:" in prompt

def test_generate_custom_prompt(prompt_engineer):
    template = "User {username} said: {message_content}. Intent: {intent_list}"
    data = {
        "username": "Charlie",
        "message_content": "I love this tool!",
        "intent_list": ["positive feedback"]
    }
    prompt = prompt_engineer.generate_custom_prompt(template, data)
    assert prompt == "User Charlie said: I love this tool!. Intent: ['positive feedback']"

