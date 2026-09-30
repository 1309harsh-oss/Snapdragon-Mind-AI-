import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import logger
from app.api import auth, chat, documents, models, performance, snapdragon, privacy, system
from app.snapdragon.detector import SnapdragonDetector

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SnapMind AI Backend Engine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified.")

    arch_info = SnapdragonDetector.detect_architecture()
    logger.info(f"Snapdragon Detector: System={arch_info['os_system']} Arch={arch_info['architecture']} ARM64={arch_info['is_arm64']}")
    logger.info(f"NPU Status: {arch_info['npu_status']}")
    
    yield
    logger.info("Shutting down SnapMind AI Backend Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_TAGLINE} - Privacy-first, hardware-aware AI platform optimized for Snapdragon PCs.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)}
    )

# Register System Routers at root /api and /api/v1
app.include_router(system.router, prefix="/api")
app.include_router(system.router, prefix=settings.API_V1_STR)

# Register API V1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(models.router, prefix=settings.API_V1_STR)
app.include_router(performance.router, prefix=settings.API_V1_STR)
app.include_router(snapdragon.router, prefix=settings.API_V1_STR)
app.include_router(privacy.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
