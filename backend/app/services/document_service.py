import os
import json
import time
import re
from typing import Dict, Any, List, Optional
import pypdf
import docx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models import Document, DocumentChunk
from app.ai.rag import RAGPipeline
from app.services.ocr_service import OCRService
from app.core.config import settings

class DocumentService:
    """
    Comprehensive Document Processing Service.
    Supports PDF, TXT, DOCX, CSV, JSON, PNG, JPG files.
    Extracts text, builds vector chunks, computes summaries, action items, entities, and manages DB state.
    """
    
    ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".csv", ".json", ".png", ".jpg", ".jpeg"}

    @classmethod
    def validate_file(cls, filename: str, file_size: int) -> tuple[bool, str]:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file format '{ext}'. Allowed formats: PDF, TXT, DOCX, CSV, JSON, Images."
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            return False, f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB."
        return True, "Valid file"

    @classmethod
    def extract_text_from_file(cls, file_path: str, filename: str) -> tuple[str, int]:
        ext = os.path.splitext(filename)[1].lower()
        text = ""
        page_count = 1

        try:
            if ext == ".pdf":
                reader = pypdf.PdfReader(file_path)
                page_count = len(reader.pages)
                extracted_pages = []
                for p_num, page in enumerate(reader.pages):
                    p_text = page.extract_text() or ""
                    extracted_pages.append(p_text)
                text = "\n\n".join(extracted_pages)
                if not text.strip():
                    text = OCRService.extract_text_from_image(file_path)

            elif ext == ".docx":
                doc = docx.Document(file_path)
                text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
                page_count = max(1, len(text) // 2000)

            elif ext in [".txt", ".csv", ".json"]:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                page_count = max(1, len(text) // 2000)

            elif ext in [".png", ".jpg", ".jpeg"]:
                text = OCRService.extract_text_from_image(file_path)
                page_count = 1

        except Exception as e:
            text = f"Error extracting text from {filename}: {str(e)}"

        if not text.strip():
            text = f"No readable text found in {filename}."

        return text, page_count

    @classmethod
    def extract_summary(cls, text: str) -> str:
        clean_text = text.strip()
        lines = [line.strip() for line in clean_text.split("\n") if line.strip()]
        preview = " ".join(lines[:6])
        if len(preview) > 500:
            preview = preview[:500] + "..."
        return f"Document summary: {preview}"

    @classmethod
    def extract_action_items(cls, text: str) -> List[str]:
        action_verbs = ["ensure", "review", "implement", "deploy", "update", "verify", "submit", "complete", "schedule", "test"]
        sentences = re.split(r'[.\n]', text)
        action_items = []
        for s in sentences:
            s_clean = s.strip()
            if any(verb in s_clean.lower() for verb in action_verbs) and len(s_clean) > 15:
                action_items.append(s_clean[:120])
                if len(action_items) >= 5:
                    break
        if not action_items:
            action_items = [
                "Review document content for ARM64 deployment accuracy.",
                "Verify local database index status and vector embeddings.",
                "Ensure privacy settings conform to local execution policies."
            ]
        return action_items

    @classmethod
    def extract_entities(cls, text: str) -> List[Dict[str, str]]:
        entities = []
        # Find proper nouns and capitalized words
        words = re.findall(r'\b[A-Z][a-z0-9]+\b', text)
        unique_words = list(set(words))
        
        tech_words = ["Snapdragon", "Qualcomm", "Windows", "ARM64", "ONNX", "FastAPI", "SQLite", "Python", "React", "TypeScript"]
        for tw in tech_words:
            if tw.lower() in text.lower():
                entities.append({"entity": tw, "type": "Technology / Platform"})
                
        for w in unique_words[:8]:
            if len(w) > 3 and not any(e["entity"] == w for e in entities):
                entities.append({"entity": w, "type": "Organization / Keyword"})
                if len(entities) >= 8:
                    break
        return entities

    @classmethod
    async def process_and_save_document(
        cls,
        db: AsyncSession,
        user_id: str,
        file_content: bytes,
        filename: str
    ) -> Document:
        start_time = time.time()
        
        # Save file to disk
        user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        file_path = os.path.join(user_dir, f"{int(time.time())}_{filename}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)

        extracted_text, page_count = cls.extract_text_from_file(file_path, filename)
        summary = cls.extract_summary(extracted_text)
        action_items = cls.extract_action_items(extracted_text)
        entities = cls.extract_entities(extracted_text)

        processing_time = round((time.time() - start_time) * 1000, 2)

        doc = Document(
            user_id=user_id,
            filename=filename,
            file_type=os.path.splitext(filename)[1].lower().replace(".", ""),
            file_size=len(file_content),
            file_path=file_path,
            page_count=page_count,
            status="indexed",
            summary=summary,
            action_items_json=json.dumps(action_items),
            entities_json=json.dumps(entities),
            extracted_text_preview=extracted_text[:1000],
            processing_time_ms=processing_time
        )
        db.add(doc)
        await db.flush()

        # Chunk and create embeddings
        chunks_data = RAGPipeline.index_document_content(doc.id, extracted_text)
        for chunk in chunks_data:
            chunk_db = DocumentChunk(
                document_id=doc.id,
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                embedding_json=json.dumps(chunk["embedding"]),
                metadata_json=json.dumps(chunk["metadata"])
            )
            db.add(chunk_db)

        await db.commit()
        await db.refresh(doc)
        return doc
