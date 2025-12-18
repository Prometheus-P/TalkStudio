"""Chat and conversation schemas using Pydantic v2."""

from datetime import datetime
from enum import Enum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MessageType(str, Enum):
    """Type of chat message."""

    TEXT = "text"
    IMAGE = "image"
    EMOJI = "emoji"
    SYSTEM = "system"


class SpeakerType(str, Enum):
    """Speaker identifier."""

    ME = "me"
    OTHER = "other"
    SYSTEM = "system"


class Theme(str, Enum):
    """Supported chat themes."""

    KAKAO = "kakao"
    INSTAGRAM = "instagram"
    TELEGRAM = "telegram"
    DISCORD = "discord"
    IMESSAGE = "imessage"


class ChatMessage(BaseModel):
    """Single chat message."""

    model_config = ConfigDict(str_strip_whitespace=True)

    id: str = Field(..., min_length=1, max_length=100, description="Unique message ID")
    speaker: SpeakerType = Field(..., description="Who sent the message")
    speaker_name: str | None = Field(
        default=None, max_length=50, description="Display name of speaker"
    )
    text: str = Field(..., min_length=1, max_length=5000, description="Message content")
    type: MessageType = Field(default=MessageType.TEXT, description="Message type")
    timestamp: datetime | None = Field(default=None, description="Message timestamp")
    read: bool = Field(default=True, description="Whether message has been read")

    @field_validator("text")
    @classmethod
    def validate_text_not_empty(cls, v: str) -> str:
        """Ensure text is not just whitespace."""
        if not v.strip():
            raise ValueError("Message text cannot be empty or whitespace only")
        return v.strip()


class ConversationRequest(BaseModel):
    """Request to create/update a conversation."""

    model_config = ConfigDict(str_strip_whitespace=True)

    theme: Theme = Field(default=Theme.KAKAO, description="Chat theme")
    title: str = Field(default="", max_length=100, description="Conversation title")
    messages: list[ChatMessage] = Field(
        default_factory=list,
        max_length=200,
        description="List of messages",
    )
    profiles: dict[str, dict] = Field(
        default_factory=lambda: {
            "me": {"name": "나", "avatar": None},
            "other": {"name": "상대방", "avatar": None},
        },
        description="Speaker profiles",
    )

    @field_validator("messages")
    @classmethod
    def validate_messages_count(cls, v: list[ChatMessage]) -> list[ChatMessage]:
        """Validate message count."""
        if len(v) > 200:
            raise ValueError("Maximum 200 messages allowed per conversation")
        return v


class ConversationResponse(BaseModel):
    """Response containing conversation data."""

    id: str
    theme: Theme
    title: str
    messages: list[ChatMessage]
    profiles: dict[str, dict]
    created_at: datetime
    updated_at: datetime


# AI Generation Schemas
class GenerateRequest(BaseModel):
    """Request to generate AI conversation."""

    model_config = ConfigDict(str_strip_whitespace=True)

    prompt: Annotated[str, Field(min_length=10, max_length=2000)]
    theme: Theme = Field(default=Theme.KAKAO)
    message_count: Annotated[int, Field(ge=2, le=50)] = 10
    style: Literal["casual", "formal", "romantic", "funny", "dramatic"] = "casual"
    language: Literal["ko", "en", "ja"] = "ko"
    provider: Literal["openai", "upstage"] = "openai"

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        """Validate and clean prompt."""
        cleaned = v.strip()
        if len(cleaned) < 10:
            raise ValueError("Prompt must be at least 10 characters")
        return cleaned


class GenerateResponse(BaseModel):
    """Response from AI generation."""

    success: bool
    messages: list[ChatMessage]
    metadata: dict = Field(default_factory=dict)
    tokens_used: int | None = None
    provider: str


# Excel Parsing Schemas
class ParseExcelRequest(BaseModel):
    """Request to parse Excel file."""

    column_mapping: dict[str, str] = Field(
        default_factory=lambda: {
            "speaker": "speaker",
            "text": "text",
            "type": "type",
            "time": "time",
        },
        description="Mapping of expected columns to actual column names",
    )
    sheet_name: str | None = Field(default=None, description="Specific sheet to parse")
    skip_rows: int = Field(default=0, ge=0, le=100, description="Rows to skip at start")


class ParseExcelResponse(BaseModel):
    """Response from Excel parsing."""

    success: bool
    messages: list[ChatMessage]
    total_rows: int
    parsed_rows: int
    errors: list[dict] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
