import json
import os
import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.database.models import User, Document, DocumentChunk, UserSettings
from app.schemas.documents import DocumentResponse, DocumentDetailResponse, DocumentQueryRequest, DocumentQueryResult
from app.services.document_service import DocumentService
from app.ai.rag import RAGPipeline

router = APIRouter(prefix="/documents", tags=["Document Intelligence"])

@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    filename = file.filename or "uploaded_file.pdf"
    
    valid, err_msg = DocumentService.validate_file(filename, len(content))
    if not valid:
        raise HTTPException(status_code=400, detail=err_msg)

    doc = await DocumentService.process_and_save_document(
        db=db,
        user_id=current_user.id,
        file_content=content,
        filename=filename
    )

    action_items = json.loads(doc.action_items_json) if doc.action_items_json else []
    entities = json.loads(doc.entities_json) if doc.entities_json else []
    
    chunks_count_res = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
    chunks_count = len(chunks_count_res.scalars().all())

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        page_count=doc.page_count,
        status=doc.status,
        summary=doc.summary,
        extracted_text_preview=doc.extracted_text_preview,
        processing_time_ms=doc.processing_time_ms,
        created_at=doc.created_at,
        action_items=action_items,
        entities=entities,
        chunks_count=chunks_count
    )

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return docs

@router.get("/{doc_id}", response_model=DocumentDetailResponse)
async def get_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    action_items = json.loads(doc.action_items_json) if doc.action_items_json else []
    entities = json.loads(doc.entities_json) if doc.entities_json else []

    chunks_res = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
    chunks_count = len(chunks_res.scalars().all())

    return DocumentDetailResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        page_count=doc.page_count,
        status=doc.status,
        summary=doc.summary,
        extracted_text_preview=doc.extracted_text_preview,
        processing_time_ms=doc.processing_time_ms,
        created_at=doc.created_at,
        action_items=action_items,
        entities=entities,
        chunks_count=chunks_count
    )

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully."}

@router.post("/{doc_id}/summarize")
async def summarize_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "summary": doc.summary,
        "action_items": json.loads(doc.action_items_json) if doc.action_items_json else [],
        "entities": json.loads(doc.entities_json) if doc.entities_json else []
    }

@router.post("/{doc_id}/query", response_model=DocumentQueryResult)
async def query_document(
    doc_id: str,
    query_in: DocumentQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    start_t = time.time()
    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.user_id == current_user.id)
    )
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunks_res = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == doc.id))
    chunks = chunks_res.scalars().all()

    chunks_list = []
    for c in chunks:
        try:
            emb = json.loads(c.embedding_json)
        except Exception:
            emb = []
        chunks_list.append({
            "document_id": c.document_id,
            "filename": doc.filename,
            "content": c.content,
            "embedding": emb
        })

    # Retrieve user privacy preference
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    local_only = user_settings.local_only if user_settings else True

    rag_res = await RAGPipeline.query_rag(
        query=query_in.query,
        chunks=chunks_list,
        local_only=local_only,
        top_k=query_in.top_k
    )

    elapsed_ms = round((time.time() - start_t) * 1000, 2)

    return DocumentQueryResult(
        query=query_in.query,
        answer=rag_res["content"],
        sources=rag_res["sources"],
        backend_used=rag_res["backend_used"],
        processing_time_ms=elapsed_ms
    )
