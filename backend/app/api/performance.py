from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.database.models import User, UserSettings
from app.schemas.performance import SystemTelemetryResponse, BenchmarkRunRequest, BenchmarkResultResponse
from app.snapdragon.telemetry import TelemetryTracker
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/performance", tags=["Performance & Benchmarking"])

@router.get("/system", response_model=SystemTelemetryResponse)
@router.get("/current", response_model=SystemTelemetryResponse)
async def get_system_telemetry(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    demo_mode = user_settings.demo_mode_enabled if user_settings else False

    telemetry = TelemetryTracker.get_telemetry(demo_mode=demo_mode)
    return telemetry

@router.post("/benchmark", response_model=BenchmarkResultResponse)
async def run_benchmark(
    request: BenchmarkRunRequest = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    suite = request.suite if request and request.suite else "full"
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    demo_mode = user_settings.demo_mode_enabled if user_settings else False

    run = await BenchmarkService.run_and_record_benchmark(
        db=db,
        user_id=current_user.id,
        suite=suite,
        demo_mode=demo_mode
    )

    import json
    return BenchmarkResultResponse(
        id=run.id,
        test_name=run.test_name,
        backend=run.backend,
        duration_ms=run.duration_ms,
        throughput=run.throughput,
        latency_avg_ms=run.latency_avg_ms,
        memory_mb=run.memory_mb,
        success_count=run.success_count,
        fail_count=run.fail_count,
        report_json=json.loads(run.report_json) if run.report_json else {},
        created_at=run.created_at
    )

@router.get("/benchmarks", response_model=List[BenchmarkResultResponse])
async def get_benchmark_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    runs = await BenchmarkService.get_user_benchmarks(db, current_user.id, limit=limit)
    import json
    out = []
    for run in runs:
        out.append(BenchmarkResultResponse(
            id=run.id,
            test_name=run.test_name,
            backend=run.backend,
            duration_ms=run.duration_ms,
            throughput=run.throughput,
            latency_avg_ms=run.latency_avg_ms,
            memory_mb=run.memory_mb,
            success_count=run.success_count,
            fail_count=run.fail_count,
            report_json=json.loads(run.report_json) if run.report_json else {},
            created_at=run.created_at
        ))
    return out
