# ai_agent_system/src/models/discord_message_model.py
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing_extensions import Annotated
from bson import ObjectId

# Custom type for PyMongo's ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class DiscordMessage(BaseModel):
    """
    Represents a captured Discord message.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # Internal ID
    discordMessageId: str = Field(..., description="Discord's actual message ID")
    authorId: str = Field(..., description="Discord user ID of the author")
    authorName: str = Field(..., description="Display name of the message author")
    timestamp: datetime = Field(..., description="Timestamp when the message was sent")
    content: str = Field(..., description="Content of the message")
    channelId: str = Field(..., description="Discord channel ID where the message was sent")
    serverId: str = Field(..., description="Discord server ID where the message was sent")
    rawContent: Optional[dict[str, Any]] = Field(default=None, description="Raw Discord API message JSON data")
    isProcessed: bool = Field(default=False, description="Whether the message has been processed for intent analysis")
    createdAt: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the message was captured")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True, # Required for PyObjectId
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "discordMessageId": "123456789012345678",
                "authorId": "987654321098765432",
                "authorName": "TestUser",
                "timestamp": "2023-11-20T10:00:00Z",
                "content": "Hello, this is a test message!",
                "channelId": "112233445566778899",
                "serverId": "998877665544332211",
                "isProcessed": False
            }
        }
    )
