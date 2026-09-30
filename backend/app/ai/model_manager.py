from typing import List, Dict, Any
from app.snapdragon.detector import SnapdragonDetector

class ModelManager:
    """
    Manages local and cloud AI models, status, quantization, and loading states.
    """
    
    DEFAULT_MODELS = [
        {
            "id": "snapmind-local-7b",
            "name": "SnapMind Local 7B",
            "model_type": "LLM / Assistant",
            "size_gb": 3.8,
            "quantization": "INT4 (NPU Optimized)",
            "context_length": 8192,
            "backend": "ONNX / ARM64 (QNN Hexagon)",
            "is_local": True,
            "status": "Ready",
            "is_active": True
        },
        {
            "id": "snapmind-embed-mini",
            "name": "SnapMind Embedding Mini",
            "model_type": "Embedding",
            "size_gb": 0.3,
            "quantization": "FP16 (DirectML)",
            "context_length": 2048,
            "backend": "ARM64 Vector NEON",
            "is_local": True,
            "status": "Ready",
            "is_active": True
        },
        {
            "id": "snapmind-ocr-mobile",
            "name": "SnapMind Vision OCR",
            "model_type": "OCR / Vision",
            "size_gb": 0.8,
            "quantization": "INT8",
            "context_length": 1024,
            "backend": "DirectML / GPU",
            "is_local": True,
            "status": "Ready",
            "is_active": True
        },
        {
            "id": "snapmind-cloud-fallback",
            "name": "SnapMind Cloud Gateway",
            "model_type": "Cloud Fallback LLM",
            "size_gb": 0.0,
            "quantization": "FP16 (Server)",
            "context_length": 32768,
            "backend": "Cloud API (Remote)",
            "is_local": False,
            "status": "Available",
            "is_active": False
        }
    ]

    @classmethod
    def get_all_models(cls) -> List[Dict[str, Any]]:
        info = SnapdragonDetector.detect_architecture()
        models = [m.copy() for m in cls.DEFAULT_MODELS]
        
        # Annotate backend detection info
        for m in models:
            if m["is_local"] and info["is_arm64"]:
                m["backend"] = m["backend"].replace("ARM64", "ARM64 Native")
        return models

    @classmethod
    def get_model_by_id(cls, model_id: str) -> Dict[str, Any]:
        models = cls.get_all_models()
        for m in models:
            if m["id"] == model_id:
                return m
        return models[0]
