import psutil
import time
from typing import Dict, Any
from app.snapdragon.detector import SnapdragonDetector

class TelemetryTracker:
    _total_requests = 0
    _local_requests = 0
    _cloud_requests = 0
    _start_time = time.time()

    @classmethod
    def record_request(cls, is_local: bool = True):
        cls._total_requests += 1
        if is_local:
            cls._local_requests += 1
        else:
            cls._cloud_requests += 1

    @classmethod
    def get_telemetry(cls, demo_mode: bool = False) -> Dict[str, Any]:
        info = SnapdragonDetector.detect_architecture()
        mem = psutil.virtual_memory()
        cpu_pct = psutil.cpu_percent(interval=None)

        local_ratio = (
            (cls._local_requests / cls._total_requests) if cls._total_requests > 0 else 1.0
        )

        if demo_mode:
            # Explicitly labeled DEMO MODE simulated hardware telemetry for non-ARM dev showcase
            return {
                "cpu_percent": round(14.5 + (cpu_pct * 0.2), 1),
                "memory_percent": round(mem.percent * 0.8, 1),
                "memory_used_gb": round(mem.used / (1024**3), 2),
                "memory_total_gb": round(mem.total / (1024**3), 2),
                "active_backend": "QNNExecutionProvider (Hexagon NPU)",
                "npu_status": "Qualcomm Hexagon NPU — 45 TOPS Active",
                "hardware_acceleration": "Snapdragon X Elite NPU",
                "total_requests": cls._total_requests + 42,
                "local_ratio": 1.0,
                "demo_mode": True,
                "telemetry_status": "DEMO MODE — Simulated hardware telemetry",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }

        # Real hardware telemetry
        return {
            "cpu_percent": round(cpu_pct, 1),
            "memory_percent": round(mem.percent, 1),
            "memory_used_gb": round(mem.used / (1024**3), 2),
            "memory_total_gb": round(mem.total / (1024**3), 2),
            "active_backend": info["onnx_providers"][0] if info["onnx_providers"] else "CPUExecutionProvider",
            "npu_status": info["npu_status"],
            "hardware_acceleration": info["hardware_acceleration"],
            "total_requests": cls._total_requests,
            "local_ratio": round(local_ratio, 2),
            "demo_mode": False,
            "telemetry_status": "Real System Telemetry",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
