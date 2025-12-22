"""Chat and conversation schemas using Pydantic v2."""

from datetime import datetime
from enum import Enum
from typing import Annotated, Dict, List, Literal, Optional

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
    speaker_name: Optional[str] = Field(
        default=None, max_length=50, description="Display name of speaker"
    )
    text: str = Field(..., min_length=1, max_length=5000, description="Message content")
    type: MessageType = Field(default=MessageType.TEXT, description="Message type")
    timestamp: Optional[datetime] = Field(default=None, description="Message timestamp")
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
    messages: List[ChatMessage] = Field(
        default_factory=list,
        max_length=200,
        description="List of messages",
    )
    profiles: Dict[str, dict] = Field(
        default_factory=lambda: {
            "me": {"name": "나", "avatar": None},
            "other": {"name": "상대방", "avatar": None},
        },
        description="Speaker profiles",
    )

    @field_validator("messages")
    @classmethod
    def validate_messages_count(cls, v: List[ChatMessage]) -> List[ChatMessage]:
        """Validate message count."""
        if len(v) > 200:
            raise ValueError("Maximum 200 messages allowed per conversation")
        return v


class ConversationResponse(BaseModel):
    """Response containing conversation data."""

    id: str
    theme: Theme
    title: str
    messages: List[ChatMessage]
    profiles: Dict[str, dict]
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
    messages: List[ChatMessage]
    metadata: Dict = Field(default_factory=dict)
    tokens_used: Optional[int] = None
    provider: str


# Excel Parsing Schemas
class ParseExcelRequest(BaseModel):
    """Request to parse Excel file."""

    column_mapping: Dict[str, str] = Field(
        default_factory=lambda: {
            "speaker": "speaker",
            "text": "text",
            "type": "type",
            "time": "time",
        },
        description="Mapping of expected columns to actual column names",
    )
    sheet_name: Optional[str] = Field(default=None, description="Specific sheet to parse")
    skip_rows: int = Field(default=0, ge=0, le=100, description="Rows to skip at start")


class ParseExcelResponse(BaseModel):
    """Response from Excel parsing."""

    success: bool
    messages: List[ChatMessage]
    total_rows: int
    parsed_rows: int
    errors: List[dict] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# Batch Processing Schemas
class BatchPromptItem(BaseModel):
    """Single prompt item from batch Excel file."""

    model_config = ConfigDict(str_strip_whitespace=True)

    prompt: str = Field(..., min_length=10, max_length=2000, description="Conversation prompt")
    message_count: int = Field(default=10, ge=2, le=50, description="Number of messages")
    style: Literal["casual", "formal", "romantic", "funny", "dramatic"] = Field(
        default="casual", description="Conversation style"
    )
    language: Literal["ko", "en", "ja"] = Field(default="ko", description="Output language")
    provider: Literal["openai", "upstage"] = Field(default="upstage", description="AI provider")
    theme: Theme = Field(default=Theme.KAKAO, description="Chat theme")

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        """Validate and clean prompt."""
        cleaned = v.strip()
        if len(cleaned) < 10:
            raise ValueError("Prompt must be at least 10 characters")
        return cleaned


class BatchResultItem(BaseModel):
    """Result of processing a single prompt in batch."""

    row_number: int = Field(..., description="Excel row number (1-indexed)")
    prompt: str = Field(..., description="Original prompt")
    status: Literal["success", "failed", "skipped"] = Field(..., description="Processing status")
    messages: Optional[List[ChatMessage]] = Field(default=None, description="Generated messages")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    tokens_used: int = Field(default=0, description="Tokens consumed")


class BatchResponse(BaseModel):
    """Response from batch processing."""

    success: bool = Field(..., description="Overall success status")
    total: int = Field(..., description="Total prompts in batch")
    processed: int = Field(..., description="Successfully processed count")
    failed: int = Field(..., description="Failed count")
    results: List[BatchResultItem] = Field(..., description="Individual results")
    remaining_quota: int = Field(..., description="Remaining daily quota")
