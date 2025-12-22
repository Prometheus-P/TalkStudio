"""API v1 routers."""

from fastapi import APIRouter

from app.api.v1 import generate, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(generate.router, prefix="/generate", tags=["Generation"])
