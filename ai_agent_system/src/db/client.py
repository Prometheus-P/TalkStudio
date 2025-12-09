# ai_agent_system/src/db/client.py
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from ai_agent_system.src.config.settings import settings

class MongoDBClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        try:
            self.client = MongoClient(settings.DATABASE_URL)
            self.db = self.client.get_database() # Get database from connection string
            # The ismaster command is cheap and does not require auth.
            self.client.admin.command('ismaster')
            print("MongoDB connected successfully for AI Agent System.")
        except ConnectionFailure as e:
            print(f"MongoDB connection error for AI Agent System: {e}")
            self.client = None
            self.db = None
            exit(1)
        except Exception as e:
            print(f"An unexpected error occurred during MongoDB connection for AI Agent System: {e}")
            self.client = None
            self.db = None
            exit(1)

    def get_db(self):
        if not self.db:
            # Re-attempt connection if not connected (e.g., after temporary network issue)
            self._connect()
            if not self.db:
                raise ConnectionFailure("Failed to reconnect to MongoDB.")
        return self.db
