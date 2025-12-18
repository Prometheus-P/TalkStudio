"""AI conversation generation endpoints."""

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from slowapi import Limiter

from app.core.config import settings
from app.core.rate_limiter import check_daily_quota, get_client_ip, limiter
from app.schemas.chat import (
    ChatMessage,
    GenerateRequest,
    GenerateResponse,
    MessageType,
    ParseExcelRequest,
    ParseExcelResponse,
    SpeakerType,
)
from app.services.ai_service import AIService
from app.services.excel_service import ExcelService

router = APIRouter()
ai_service = AIService()
excel_service = ExcelService()


@router.post(
    "/conversation",
    response_model=GenerateResponse,
    summary="Generate AI conversation",
    description="Generate a chat conversation using AI based on the provided prompt.",
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def generate_conversation(
    request: Request,
    body: GenerateRequest,
    _: Annotated[None, Depends(check_daily_quota)],
) -> GenerateResponse:
    """
    Generate a chat conversation using AI.

    - **prompt**: Description of the conversation to generate
    - **theme**: Chat theme (kakao, instagram, telegram, discord, imessage)
    - **message_count**: Number of messages to generate (2-50)
    - **style**: Conversation style (casual, formal, romantic, funny, dramatic)
    - **language**: Output language (ko, en, ja)
    - **provider**: AI provider to use (openai, upstage)
    """
    try:
        messages, metadata = await ai_service.generate_conversation(
            prompt=body.prompt,
            message_count=body.message_count,
            style=body.style,
            language=body.language,
            provider=body.provider,
        )

        return GenerateResponse(
            success=True,
            messages=messages,
            metadata=metadata,
            tokens_used=metadata.get("tokens_used"),
            provider=body.provider,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "validation_error", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "generation_failed",
                "message": "Failed to generate conversation. Please try again.",
            },
        )


@router.post(
    "/parse-excel",
    response_model=ParseExcelResponse,
    summary="Parse Excel file to chat messages",
    description="Upload an Excel file and convert it to chat messages.",
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def parse_excel(
    request: Request,
    file: Annotated[UploadFile, File(description="Excel file (.xlsx, .xls)")],
    _: Annotated[None, Depends(check_daily_quota)],
) -> ParseExcelResponse:
    """
    Parse an Excel file and convert it to chat messages.

    Expected Excel format:
    | speaker | text | type | time |
    |---------|------|------|------|
    | me      | Hi!  | text | 10:30|
    | other   | Hey  | text | 10:31|
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "invalid_file", "message": "No filename provided"},
        )

    allowed_extensions = {".xlsx", ".xls"}
    file_ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "invalid_file_type",
                "message": f"Only Excel files allowed: {', '.join(allowed_extensions)}",
            },
        )

    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"error": "file_too_large", "message": "File size exceeds 5MB limit"},
        )

    try:
        messages, stats = await excel_service.parse_excel(content, file.filename)

        return ParseExcelResponse(
            success=True,
            messages=messages,
            total_rows=stats["total_rows"],
            parsed_rows=stats["parsed_rows"],
            errors=stats.get("errors", []),
            warnings=stats.get("warnings", []),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "parse_error", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "parse_failed", "message": "Failed to parse Excel file"},
        )


@router.post(
    "/demo",
    response_model=GenerateResponse,
    summary="Generate demo conversation (no AI)",
    description="Generate a demo conversation without using AI API.",
)
async def generate_demo(request: Request) -> GenerateResponse:
    """Generate a demo conversation for testing purposes."""
    demo_messages = [
        ChatMessage(
            id=str(uuid.uuid4()),
            speaker=SpeakerType.OTHER,
            speaker_name="지수",
            text="오늘 저녁 뭐 먹을까?",
            type=MessageType.TEXT,
            timestamp=datetime.now(timezone.utc),
        ),
        ChatMessage(
            id=str(uuid.uuid4()),
            speaker=SpeakerType.ME,
            speaker_name="나",
            text="음... 치킨 어때?",
            type=MessageType.TEXT,
            timestamp=datetime.now(timezone.utc),
        ),
        ChatMessage(
            id=str(uuid.uuid4()),
            speaker=SpeakerType.OTHER,
            speaker_name="지수",
            text="좋아! 어디서 시킬까?",
            type=MessageType.TEXT,
            timestamp=datetime.now(timezone.utc),
        ),
        ChatMessage(
            id=str(uuid.uuid4()),
            speaker=SpeakerType.ME,
            speaker_name="나",
            text="교촌 어때? 허니콤보 최고지",
            type=MessageType.TEXT,
            timestamp=datetime.now(timezone.utc),
        ),
        ChatMessage(
            id=str(uuid.uuid4()),
            speaker=SpeakerType.OTHER,
            speaker_name="지수",
            text="ㅋㅋㅋ 완전 동의! 콜!",
            type=MessageType.TEXT,
            timestamp=datetime.now(timezone.utc),
        ),
    ]

    return GenerateResponse(
        success=True,
        messages=demo_messages,
        metadata={"source": "demo", "generated_at": datetime.now(timezone.utc).isoformat()},
        tokens_used=0,
        provider="demo",
    )
