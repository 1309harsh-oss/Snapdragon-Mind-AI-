from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DeviceInfoResponse(BaseModel):
    os_system: str
    os_release: str
    architecture: str
    processor: str
    python_arch: str
    is_arm64: bool
    is_windows: bool
    hardware_acceleration: str
    npu_status: str
    onnx_providers: List[str]
    demo_mode: bool

class CapabilitiesResponse(BaseModel):
    arm64_native: bool
    npu_detected: bool
    directml_detected: bool
    onnx_qnn_provider: bool
    supported_models: List[str]
    supported_quantizations: List[str]

class WorkloadRoutingResponse(BaseModel):
    task: str
    preferred_backend: str
    fallback_backend: str
    hardware_target: str  # NPU, GPU, CPU
    rationale: str
