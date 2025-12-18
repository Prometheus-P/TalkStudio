"""
TalkStudio Backend - FastAPI Application
Viral Chat Generator API with Rate Limiting
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1 import api_router
from app.core.config import settings
from app.core.rate_limiter import limiter

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info(f"Starting TalkStudio API v2.0 [{settings.environment}]")
    logger.info(f"Rate limits: {settings.rate_limit_per_minute}/min, {settings.rate_limit_per_day}/day")
    yield
    logger.info("Shutting down TalkStudio API")


# Create FastAPI application
app = FastAPI(
    title="TalkStudio API",
    description="Viral Chat Screenshot Generator - Backend API",
    version="2.0.0",
    docs_url="/docs" if settings.debug or not settings.is_production else None,
    redoc_url="/redoc" if settings.debug or not settings.is_production else None,
    openapi_url="/openapi.json" if settings.debug or not settings.is_production else None,
    lifespan=lifespan,
)

# Add rate limiter to app state
app.state.limiter = limiter


# ============================================================
# Middleware
# ============================================================

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Daily-Quota-Remaining", "X-Daily-Quota-Limit"],
)


# ============================================================
# Exception Handlers
# ============================================================

# Rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Handle Pydantic validation errors with clear messages."""
    errors = []
    for error in exc.errors():
        loc = " -> ".join(str(l) for l in error["loc"])
        errors.append({
            "field": loc,
            "message": error["msg"],
            "type": error["type"],
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "validation_error",
            "message": "Request validation failed",
            "details": errors,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """Global exception handler for unhandled errors."""
    logger.exception(f"Unhandled exception: {exc}")

    # Don't expose internal errors in production
    if settings.is_production:
        message = "An unexpected error occurred"
    else:
        message = str(exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "internal_error",
            "message": message,
        },
    )


# ============================================================
# Routes
# ============================================================

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")


# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirect to docs."""
    return {
        "service": "TalkStudio API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


# ============================================================
# Development Server
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
