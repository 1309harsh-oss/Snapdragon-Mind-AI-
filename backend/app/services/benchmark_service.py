import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models import BenchmarkRun
from app.snapdragon.benchmark import SnapdragonBenchmarkRunner

class BenchmarkService:
    """
    Executes and records Snapdragon AI PC Benchmarks.
    """
    @classmethod
    async def run_and_record_benchmark(
        cls,
        db: AsyncSession,
        user_id: str,
        suite: str = "full",
        demo_mode: bool = False
    ) -> BenchmarkRun:
        report = SnapdragonBenchmarkRunner.run_benchmark(suite=suite, demo_mode=demo_mode)
        
        run = BenchmarkRun(
            user_id=user_id,
            test_name=report["test_name"],
            backend=report["backend"],
            duration_ms=report["duration_ms"],
            throughput=report["throughput"],
            latency_avg_ms=report["latency_avg_ms"],
            memory_mb=report["memory_mb"],
            success_count=report["success_count"],
            fail_count=report["fail_count"],
            report_json=json.dumps(report["report_json"])
        )
        db.add(run)
        await db.commit()
        await db.refresh(run)
        return run

    @classmethod
    async def get_user_benchmarks(
        cls,
        db: AsyncSession,
        user_id: str,
        limit: int = 10
    ) -> list[BenchmarkRun]:
        result = await db.execute(
            select(BenchmarkRun)
            .where(BenchmarkRun.user_id == user_id)
            .order_by(BenchmarkRun.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
