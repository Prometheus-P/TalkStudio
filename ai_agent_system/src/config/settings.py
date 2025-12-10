# ai_agent_system/src/config/settings.py
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# Assuming .env file is in the project root or ai_agent_system root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../.env'))
load_dotenv() # Load from current directory if exists

class Settings:
    DISCORD_BOT_TOKEN: str = os.getenv("DISCORD_BOT_TOKEN")
    UPSTAGE_API_KEY: str = os.getenv("UPSTAGE_API_KEY")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mongodb://localhost:27017/talkstudio")

    @classmethod
    def validate(cls):
        if not cls.DISCORD_BOT_TOKEN:
            print("WARNING: DISCORD_BOT_TOKEN is not set.")
        if not cls.UPSTAGE_API_KEY:
            print("WARNING: UPSTAGE_API_KEY is not set.")
        if not cls.DATABASE_URL:
            print("ERROR: DATABASE_URL is not set. Please set it in .env file.")
            exit(1)

settings = Settings()
settings.validate()
