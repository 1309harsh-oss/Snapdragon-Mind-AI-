from typing import Optional
from pydantic import BaseModel, ConfigDict

class AIModelResponse(BaseModel):
    id: str
    name: str
    model_type: str
    size_gb: float
    quantization: str
    context_length: int
    backend: str
    is_local: bool
    status: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class AIModelLoadRequest(BaseModel):
    target_backend: Optional[str] = "ONNX / ARM64"
