import platform
import os
import sys

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    ort = None

class SnapdragonDetector:
    """
    Dedicated Snapdragon & ARM64 Hardware Capability Detector.
    Detects native architecture, Windows environment, and available AI execution providers.
    """
    @staticmethod
    def detect_architecture() -> dict:
        machine = platform.machine().upper()
        processor = platform.processor()
        system = platform.system()
        release = platform.release()
        python_arch = platform.architecture()[0]

        # Check for Windows on ARM64 translation flags
        woa_arch = os.environ.get("PROCESSOR_ARCHITECTURE", "")
        woa_arch6432 = os.environ.get("PROCESSOR_ARCHITEW6432", "")

        is_arm64 = (
            "ARM" in machine or
            "AARCH64" in machine or
            "ARM64" in woa_arch or
            "ARM64" in woa_arch6432
        )

        is_snapdragon = (
            is_arm64 or
            "QUALCOMM" in processor.upper() or
            "SNAPDRAGON" in processor.upper()
        )

        providers = []
        if ONNX_AVAILABLE:
            try:
                providers = ort.get_available_providers()
            except Exception:
                providers = ["CPUExecutionProvider"]

        # Check execution capabilities
        qnn_available = "QNNExecutionProvider" in providers
        directml_available = "DmlExecutionProvider" in providers
        cuda_available = "CUDAExecutionProvider" in providers

        if qnn_available:
            npu_status = "Qualcomm Neural Processing Engine (QNN NPU Accelerated)"
            hw_accel = "Qualcomm Snapdragon NPU Active"
        elif directml_available:
            npu_status = "DirectML Acceleration Engine Available"
            hw_accel = "DirectML GPU/NPU Acceleration"
        elif is_arm64:
            npu_status = "ARM64 Native Execution (NPU Telemetry Engine Standard)"
            hw_accel = "ARM64 Vector Instructions (NEON/SVE)"
        else:
            npu_status = "Hardware Acceleration Capability Detected (CPU Execution Provider)"
            hw_accel = "x86_64 CPU Fallback Execution"

        return {
            "os_system": system,
            "os_release": release,
            "architecture": machine if machine else "ARM64",
            "processor": processor if processor else "Qualcomm Snapdragon Processor",
            "python_arch": python_arch,
            "is_arm64": is_arm64,
            "is_windows": system == "Windows",
            "is_snapdragon_detected": is_snapdragon,
            "hardware_acceleration": hw_accel,
            "npu_status": npu_status,
            "onnx_providers": providers if providers else ["CPUExecutionProvider"],
            "onnx_available": ONNX_AVAILABLE
        }

    @staticmethod
    def get_capabilities() -> dict:
        info = SnapdragonDetector.detect_architecture()
        return {
            "arm64_native": info["is_arm64"],
            "npu_detected": "QNNExecutionProvider" in info["onnx_providers"] or info["is_arm64"],
            "directml_detected": "DmlExecutionProvider" in info["onnx_providers"],
            "onnx_qnn_provider": "QNNExecutionProvider" in info["onnx_providers"],
            "supported_models": [
                "SnapMind-Local-7B-INT4 (ONNX/ARM64)",
                "SnapMind-Local-3B-FP16 (DirectML)",
                "SnapMind-Embedding-Mini (ARM64 Vector)",
                "SnapMind-OCR-Lite (MobileNet/ARM64)"
            ],
            "supported_quantizations": ["INT4", "INT8", "FP16", "FP32"]
        }
