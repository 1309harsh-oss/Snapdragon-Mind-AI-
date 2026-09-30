from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.database.models import User, UserSettings
from app.schemas.snapdragon import DeviceInfoResponse, CapabilitiesResponse, WorkloadRoutingResponse
from app.schemas.performance import SystemTelemetryResponse
from app.snapdragon.detector import SnapdragonDetector
from app.snapdragon.workload_router import WorkloadRouter
from app.snapdragon.telemetry import TelemetryTracker

router = APIRouter(prefix="/snapdragon", tags=["Snapdragon Optimization Engine"])

@router.get("/device", response_model=DeviceInfoResponse)
async def get_device_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    demo_mode = user_settings.demo_mode_enabled if user_settings else False

    arch_info = SnapdragonDetector.detect_architecture()
    return DeviceInfoResponse(
        os_system=arch_info["os_system"],
        os_release=arch_info["os_release"],
        architecture=arch_info["architecture"],
        processor=arch_info["processor"],
        python_arch=arch_info["python_arch"],
        is_arm64=arch_info["is_arm64"],
        is_windows=arch_info["is_windows"],
        hardware_acceleration=arch_info["hardware_acceleration"],
        npu_status=arch_info["npu_status"],
        onnx_providers=arch_info["onnx_providers"],
        demo_mode=demo_mode
    )

@router.get("/capabilities", response_model=CapabilitiesResponse)
async def get_capabilities(current_user: User = Depends(get_current_user)):
    caps = SnapdragonDetector.get_capabilities()
    return CapabilitiesResponse(**caps)

@router.get("/workload", response_model=List[WorkloadRoutingResponse])
async def get_workload_routing(current_user: User = Depends(get_current_user)):
    tasks = ["text_generation", "document_embedding", "ocr_processing", "semantic_search", "document_parsing"]
    routings = []
    for task in tasks:
        r = WorkloadRouter.route_task(task, local_only=True)
        routings.append(WorkloadRoutingResponse(
            task=r["task"],
            preferred_backend=r["preferred_backend"],
            fallback_backend=r["active_backend"],
            hardware_target=r["hardware_target"],
            rationale=r["rationale"]
        ))
    return routings

@router.get("/telemetry", response_model=SystemTelemetryResponse)
async def get_snapdragon_telemetry(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    demo_mode = user_settings.demo_mode_enabled if user_settings else False

    return TelemetryTracker.get_telemetry(demo_mode=demo_mode)
