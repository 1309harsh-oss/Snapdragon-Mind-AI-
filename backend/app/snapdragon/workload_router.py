from typing import Dict, Any
from app.snapdragon.detector import SnapdragonDetector

class WorkloadRouter:
    """
    Snapdragon Workload Router.
    Routes AI operations to optimal hardware backends (NPU, GPU, CPU)
    based on task type, latency target, privacy policy, and detected hardware capabilities.
    """
    
    TASK_ROUTING_TABLE = {
        "text_generation": {
            "target": "NPU",
            "preferred_provider": "QNNExecutionProvider",
            "fallback_provider": "CPUExecutionProvider",
            "rationale": "High throughput, low-power LLM token generation optimized for Snapdragon Hexagon NPU."
        },
        "document_embedding": {
            "target": "NPU",
            "preferred_provider": "QNNExecutionProvider",
            "fallback_provider": "CPUExecutionProvider",
            "rationale": "Batch vector quantization and dense matrix operations accelerated on Hexagon NPU / ARM NEON."
        },
        "ocr_processing": {
            "target": "GPU",
            "preferred_provider": "DmlExecutionProvider",
            "fallback_provider": "CPUExecutionProvider",
            "rationale": "Parallel spatial image feature extraction and computer vision matrix transforms."
        },
        "semantic_search": {
            "target": "CPU",
            "preferred_provider": "CPUExecutionProvider",
            "fallback_provider": "CPUExecutionProvider",
            "rationale": "Fast in-memory index search and cosine similarity scoring using ARM64 SIMD instructions."
        },
        "document_parsing": {
            "target": "CPU",
            "preferred_provider": "CPUExecutionProvider",
            "fallback_provider": "CPUExecutionProvider",
            "rationale": "Text extraction, file parsing, and chunking handled on general high-efficiency CPU cores."
        }
    }

    @classmethod
    def route_task(cls, task_name: str, local_only: bool = True) -> Dict[str, Any]:
        info = SnapdragonDetector.detect_architecture()
        routing = cls.TASK_ROUTING_TABLE.get(
            task_name.lower(),
            {
                "target": "NPU",
                "preferred_provider": "QNNExecutionProvider",
                "fallback_provider": "CPUExecutionProvider",
                "rationale": "General AI task hardware acceleration routing."
            }
        )

        providers = info["onnx_providers"]
        active_provider = routing["preferred_provider"]
        if active_provider not in providers:
            active_provider = routing["fallback_provider"]

        # Formulate active execution label
        if "QNNExecutionProvider" in providers:
            execution_label = "Qualcomm Hexagon NPU"
        elif "DmlExecutionProvider" in providers:
            execution_label = "DirectML GPU Accelerator"
        elif info["is_arm64"]:
            execution_label = f"ARM64 CPU ({routing['target']} Preferred)"
        else:
            execution_label = f"CPU Execution ({routing['target']} Target)"

        return {
            "task": task_name,
            "hardware_target": routing["target"],
            "preferred_backend": routing["preferred_provider"],
            "active_backend": active_provider,
            "execution_label": execution_label,
            "rationale": routing["rationale"],
            "privacy_mode": "Local Only" if local_only else "Cloud Allowed",
            "arm64_optimized": info["is_arm64"]
        }
