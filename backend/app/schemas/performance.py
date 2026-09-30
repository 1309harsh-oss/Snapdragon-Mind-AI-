from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class BenchmarkRunRequest(BaseModel):
    suite: Optional[str] = "full"

class BenchmarkResultResponse(BaseModel):
    id: str
    test_name: str
    backend: str
    duration_ms: float
    throughput: float
    latency_avg_ms: float
    memory_mb: float
    success_count: int
    fail_count: int
    report_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SystemTelemetryResponse(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    memory_total_gb: float
    active_backend: str
    npu_status: str
    hardware_acceleration: str
    total_requests: int
    local_ratio: float
    demo_mode: bool
    timestamp: str
