"""Security utilities and input sanitization."""

import html
import re
from typing import Any, Dict


def sanitize_string(value: str, max_length: int = 10000) -> str:
    """
    Sanitize string input to prevent XSS and injection attacks.
    - Escapes HTML entities
    - Removes control characters
    - Truncates to max length
    """
    if not value:
        return value

    # Truncate to max length
    value = value[:max_length]

    # Remove control characters (except newlines and tabs)
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)

    # Escape HTML entities
    value = html.escape(value, quote=True)

    return value


def sanitize_dict(data: Dict[str, Any], max_string_length: int = 10000) -> Dict[str, Any]:
    """Recursively sanitize all string values in a dictionary."""
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value, max_string_length)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value, max_string_length)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_dict(item, max_string_length) if isinstance(item, dict)
                else sanitize_string(item, max_string_length) if isinstance(item, str)
                else item
                for item in value
            ]
        else:
            sanitized[key] = value
    return sanitized


def validate_theme(theme: str) -> str:
    """Validate theme name against allowed values."""
    allowed_themes = {"kakao", "instagram", "telegram", "discord", "imessage"}
    theme_lower = theme.lower()
    if theme_lower not in allowed_themes:
        raise ValueError(f"Invalid theme. Allowed: {', '.join(sorted(allowed_themes))}")
    return theme_lower


def validate_speaker_type(speaker_type: str) -> str:
    """Validate speaker type."""
    allowed_types = {"me", "other", "system"}
    if speaker_type.lower() not in allowed_types:
        raise ValueError(f"Invalid speaker type. Allowed: {', '.join(sorted(allowed_types))}")
    return speaker_type.lower()
