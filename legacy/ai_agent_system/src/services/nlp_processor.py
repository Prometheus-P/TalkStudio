# ai_agent_system/src/services/nlp_processor.py
import re
from typing import Optional, List

# For more advanced intent classification, integrate scikit-learn or Hugging Face Transformers
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.linear_model import LogisticRegression
# from transformers import pipeline # For Hugging Face models

class NLPProcessor:
    def __init__(self):
        # Initialize models here if needed
        # self.intent_classifier = ...
        pass

    def preprocess_discord_message(self, message_content: str) -> str:
        """
        Cleans Discord message content by removing unwanted elements.
        - Removes bot commands (starting with !, ., /)
        - Removes Discord mentions (<@USER_ID>, <#CHANNEL_ID>, <@&ROLE_ID>)
        - Removes URLs
        - Removes emojis (simple regex, might not catch all)
        - Removes excess whitespace
        """
        # Remove bot commands (starts with !, ., /)
        if message_content.startswith(('!', '.', '/')):
            return "" # Ignore command messages
        
        cleaned_content = message_content

        # Remove Discord mentions (users, channels, roles)
        cleaned_content = re.sub(r'<@!?(\d+)>', '', cleaned_content) # User mentions
        cleaned_content = re.sub(r'<#(\d+)>', '', cleaned_content)    # Channel mentions
        cleaned_content = re.sub(r'<@&(\d+)>', '', cleaned_content)   # Role mentions

        # Remove URLs
        cleaned_content = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', cleaned_content)

        # Remove emojis (basic pattern, can be improved)
        cleaned_content = re.sub(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF]+', '', cleaned_content)

        # Remove excess whitespace
        cleaned_content = re.sub(r'\s+', ' ', cleaned_content).strip()

        return cleaned_content

    def extract_intent(self, text: str) -> List[str]:
        """
        Extracts intent from the given text.
        Placeholder implementation: Uses simple keyword matching.
        In a full implementation, this would involve a trained NLP model.
        """
        intents = []
        text_lower = text.lower()

        if any(keyword in text_lower for keyword in ["질문", "궁금", "ask", "question"]):
            intents.append("질문")
        if any(keyword in text_lower for keyword in ["제안", "아이디어", "suggest", "idea", "feature"]):
            intents.append("제안")
        if any(keyword in text_lower for keyword in ["버그", "에러", "문제", "bug", "error", "issue"]):
            intents.append("불만/버그")
        if any(keyword in text_lower for keyword in ["감사", "고마워", "thank", "good job"]):
            intents.append("감사")
        if any(keyword in text_lower for keyword in ["요청", "need", "request", "부탁"]):
            intents.append("요청")
        
        if not intents:
            intents.append("일반") # Default intent

        return intents

    def extract_keywords(self, text: str) -> List[str]:
        """
        Extracts keywords from the given text.
        Placeholder implementation: Splits text and returns capitalized words or a few common nouns.
        """
        words = text.split()
        keywords = [word for word in words if word.istitle() and len(word) > 3] # Simple heuristic
        if not keywords and len(words) > 2:
            keywords = words[:3] # Fallback to first few words
        return list(set(keywords)) # Return unique keywords

    def analyze_sentiment(self, text: str) -> str:
        """
        Analyzes the sentiment of the given text.
        Placeholder implementation: Simple keyword-based sentiment.
        """
        text_lower = text.lower()
        if any(keyword in text_lower for keyword in ["좋다", "긍정", "good", "great", "awesome", "행복"]):
            return "positive"
        if any(keyword in text_lower for keyword in ["나쁘다", "부정", "bad", "terrible", "sad", "문제", "불만"]):
            return "negative"
        return "neutral"