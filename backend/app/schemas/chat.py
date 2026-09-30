from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    model_id: Optional[str] = "snapmind-local-7b"
    document_ids: Optional[List[str]] = []
    local_only: bool = True

class SourceChunk(BaseModel):
    document_id: str
    filename: str
    content: str
    similarity: float

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    backend_used: str
    latency_ms: float
    tokens_count: int
    sources: List[SourceChunk] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: str
    title: str
    model_id: str
    processing_mode: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
