from fastapi import APIRouter
from app.core.config import settings
from app.snapdragon.detector import SnapdragonDetector

router = APIRouter(tags=["System"])

@router.get("/health")
async def health_check():
    info = SnapdragonDetector.detect_architecture()
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "architecture": info["architecture"],
        "is_arm64": info["is_arm64"],
        "npu_status": info["npu_status"]
    }

@router.get("/version")
async def get_version():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "environment": "Production / ARM64 Windows PC"
    }
