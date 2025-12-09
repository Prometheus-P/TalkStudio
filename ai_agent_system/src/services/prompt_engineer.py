# ai_agent_system/src/services/prompt_engineer.py
from typing import List, Dict, Any
from ai_agent_system.src.models.discord_message_model import DiscordMessage
from ai_agent_system.src.models.intent_analysis_result_model import IntentAnalysisResult

class PromptEngineer:
    def __init__(self):
        pass

    def generate_summary_prompt(self, messages: List[DiscordMessage]) -> str:
        """
        Generates a prompt to summarize a list of Discord messages.
        """
        conversation_text = "\n".join([f"{msg.authorName} ({msg.timestamp.isoformat()}): {msg.content}" for msg in messages])
        prompt = f"""다음은 Discord 대화 내역입니다. 이 대화의 핵심 내용을 1-2문단으로 요약해주세요:

---
{conversation_text}
---

요약:"""
        return prompt

    def generate_faq_answer_prompt(self, question: str, related_messages: List[DiscordMessage]) -> str:
        """
        Generates a prompt to answer an FAQ question based on related messages.
        """
        context_text = "\n".join([f"{msg.authorName}: {msg.content}" for msg in related_messages])
        prompt = f"""다음 대화 내용을 참고하여 '{question}'에 대한 답변을 생성해주세요. 답변은 간결하고 명확해야 합니다.

---
대화 내용:
{context_text}
---
질문: {question}
답변:"""
        return prompt

    def generate_idea_prompt(self, intent_results: List[IntentAnalysisResult], messages: List[DiscordMessage]) -> str:
        """
        Generates a prompt to brainstorm ideas based on user intents and messages.
        """
        intents_summary = ", ".join(list(set([intent for res in intent_results for intent in res.extractedIntents])))
        keywords_summary = ", ".join(list(set([kw for res in intent_results for kw in res.keywords])))
        conversation_text = "\n".join([f"{msg.authorName}: {msg.content}" for msg in messages])

        prompt = f"""다음은 Discord 대화 내역과 분석된 의도/키워드입니다. 이 정보를 바탕으로 5가지 새로운 아이디어나 개선 방안을 제안해주세요.

---
주요 의도: {intents_summary}
핵심 키워드: {keywords_summary}
대화 내용:
{conversation_text}
---
아이디어:
1. """
        return prompt

    def generate_custom_prompt(self, template: str, data: Dict[str, Any]) -> str:
        """
        Generates a custom prompt from a template and data.
        """
        # This allows for flexible prompt generation based on user-defined templates
        # Example: template = "The user's intent is {intent}. Messages: {messages}. Generate a response."
        # data = {"intent": ["question"], "messages": "..."}
        # For more complex templating, consider using Python's string.Template or Jinja2
        formatted_prompt = template
        for key, value in data.items():
            formatted_prompt = formatted_prompt.replace(f"{{{key}}}", str(value))
        return formatted_prompt
