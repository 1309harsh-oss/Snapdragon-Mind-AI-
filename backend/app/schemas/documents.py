from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class DocumentQueryRequest(BaseModel):
    query: str
    top_k: int = 4

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    status: str
    summary: Optional[str] = None
    extracted_text_preview: Optional[str] = None
    processing_time_ms: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentDetailResponse(DocumentResponse):
    action_items: List[str] = []
    entities: List[Dict[str, str]] = []
    chunks_count: int = 0

class DocumentQueryResult(BaseModel):
    query: str
    answer: str
    sources: List[Dict[str, Any]]
    backend_used: str
    processing_time_ms: float
