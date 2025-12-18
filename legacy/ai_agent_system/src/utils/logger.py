# ai_agent_system/src/utils/logger.py
# Structlog-based JSON logger (NFR-9)

import logging
import sys
import os
from datetime import datetime
from typing import Any, Dict, Optional
import json

# Try to import structlog, fall back to basic logging if not available
try:
    import structlog
    STRUCTLOG_AVAILABLE = True
except ImportError:
    STRUCTLOG_AVAILABLE = False


def get_log_level() -> int:
    """Get log level from environment variable."""
    level_name = os.getenv('LOG_LEVEL', 'INFO').upper()
    return getattr(logging, level_name, logging.INFO)


def json_serializer(obj: Any) -> str:
    """Custom JSON serializer for non-serializable objects."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if hasattr(obj, '__dict__'):
        return str(obj)
    return str(obj)


class JSONFormatter(logging.Formatter):
    """JSON formatter for standard logging (fallback when structlog not available)."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname.lower(),
            'message': record.getMessage(),
            'service': 'talkstudio-ai-agent',
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        # Add extra fields
        if hasattr(record, 'extra'):
            log_data.update(record.extra)

        return json.dumps(log_data, default=json_serializer)


def configure_structlog() -> None:
    """Configure structlog for JSON logging."""
    if not STRUCTLOG_AVAILABLE:
        return

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt='iso'),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(
                serializer=lambda obj, **kwargs: json.dumps(obj, default=json_serializer)
            ),
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = 'talkstudio') -> Any:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (module name recommended)

    Returns:
        Logger instance (structlog or standard logging)
    """
    if STRUCTLOG_AVAILABLE:
        configure_structlog()
        return structlog.get_logger(name).bind(service='talkstudio-ai-agent')
    else:
        # Fallback to standard logging with JSON formatter
        logger = logging.getLogger(name)
        if not logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(JSONFormatter())
            logger.addHandler(handler)
        logger.setLevel(get_log_level())
        return logger


class RequestLogger:
    """Context-aware request logger."""

    def __init__(self, request_id: Optional[str] = None, user_id: Optional[str] = None):
        self.logger = get_logger('request')
        self.context = {
            'request_id': request_id,
            'user_id': user_id,
        }

    def _log(self, level: str, message: str, **kwargs: Any) -> None:
        """Internal log method with context."""
        log_data = {**self.context, **kwargs}
        if STRUCTLOG_AVAILABLE:
            getattr(self.logger.bind(**log_data), level)(message)
        else:
            extra = {'extra': log_data}
            getattr(self.logger, level)(message, extra=extra)

    def info(self, message: str, **kwargs: Any) -> None:
        self._log('info', message, **kwargs)

    def warning(self, message: str, **kwargs: Any) -> None:
        self._log('warning', message, **kwargs)

    def error(self, message: str, **kwargs: Any) -> None:
        self._log('error', message, **kwargs)

    def debug(self, message: str, **kwargs: Any) -> None:
        self._log('debug', message, **kwargs)


# Module-level logger instance
logger = get_logger()


# Convenience functions
def info(message: str, **kwargs: Any) -> None:
    """Log info message."""
    if STRUCTLOG_AVAILABLE:
        logger.info(message, **kwargs)
    else:
        logger.info(message, extra={'extra': kwargs})


def warning(message: str, **kwargs: Any) -> None:
    """Log warning message."""
    if STRUCTLOG_AVAILABLE:
        logger.warning(message, **kwargs)
    else:
        logger.warning(message, extra={'extra': kwargs})


def error(message: str, **kwargs: Any) -> None:
    """Log error message."""
    if STRUCTLOG_AVAILABLE:
        logger.error(message, **kwargs)
    else:
        logger.error(message, extra={'extra': kwargs})


def debug(message: str, **kwargs: Any) -> None:
    """Log debug message."""
    if STRUCTLOG_AVAILABLE:
        logger.debug(message, **kwargs)
    else:
        logger.debug(message, extra={'extra': kwargs})


if __name__ == '__main__':
    # Test logging
    info('Application started', version='1.0.0')
    debug('Debug message', data={'key': 'value'})
    warning('Warning message', threshold=0.9)
    error('Error occurred', error_code='E001')

    # Test request logger
    req_logger = RequestLogger(request_id='test-123', user_id='user-456')
    req_logger.info('Request received', endpoint='/api/test')
