import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    benchmarks = relationship("BenchmarkRun", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Conversation")
    model_id = Column(String, default="snapmind-local-7b")
    processing_mode = Column(String, default="Local AI")  # "Local AI" or "Cloud fallback"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    sender = Column(String, nullable=False)  # "user" | "assistant" | "system"
    content = Column(Text, nullable=False)
    backend_used = Column(String, default="CPUExecutionProvider")
    latency_ms = Column(Float, default=0.0)
    tokens_count = Column(Integer, default=0)
    sources_json = Column(Text, nullable=True)  # References to retrieved document chunks
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    page_count = Column(Integer, default=1)
    status = Column(String, default="uploaded")  # uploaded, processing, indexed, error
    summary = Column(Text, nullable=True)
    action_items_json = Column(Text, nullable=True)
    entities_json = Column(Text, nullable=True)
    extracted_text_preview = Column(Text, nullable=True)
    processing_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=False)  # Vector representation
    metadata_json = Column(Text, nullable=True)

    document = relationship("Document", back_populates="chunks")


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # LLM, Embedding, OCR, Vision
    size_gb = Column(Float, nullable=False)
    quantization = Column(String, nullable=False)
    context_length = Column(Integer, default=4096)
    backend = Column(String, nullable=False)  # ONNX / ARM64, DirectML, QNN, PyTorch
    is_local = Column(Boolean, default=True)
    status = Column(String, default="Ready")  # Ready, Downloaded, Downloading, Not Installed
    is_active = Column(Boolean, default=False)


class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    test_name = Column(String, nullable=False)
    backend = Column(String, nullable=False)
    duration_ms = Column(Float, nullable=False)
    throughput = Column(Float, nullable=False)  # ops/sec or tokens/sec
    latency_avg_ms = Column(Float, nullable=False)
    memory_mb = Column(Float, nullable=False)
    success_count = Column(Integer, default=1)
    fail_count = Column(Integer, default=0)
    report_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="benchmarks")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    theme = Column(String, default="dark")  # "dark" or "light"
    processing_preference = Column(String, default="local_preferred")  # local_only, local_preferred, cloud_fallback
    local_only = Column(Boolean, default=True)
    auto_summarize = Column(Boolean, default=True)
    telemetry_opt_in = Column(Boolean, default=True)
    demo_mode_enabled = Column(Boolean, default=False)
    cloud_api_key = Column(String, nullable=True)

    user = relationship("User", back_populates="settings")
