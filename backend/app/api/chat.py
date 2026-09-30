import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.database.models import User, Conversation, Message, DocumentChunk, Document, UserSettings
from app.schemas.chat import ChatRequest, MessageResponse, ConversationResponse, ConversationUpdate
from app.ai.local_provider import LocalModelProvider
from app.ai.cloud_provider import CloudModelProvider
from app.ai.rag import RAGPipeline
from app.snapdragon.telemetry import TelemetryTracker

router = APIRouter(prefix="/chat", tags=["AI Chat Workspace"])

@router.post("", response_model=MessageResponse)
async def send_chat_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve user settings for privacy check
    settings_res = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = settings_res.scalars().first()
    local_only = user_settings.local_only if user_settings else True

    # Find or create conversation
    conversation = None
    if request.conversation_id:
        conv_res = await db.execute(
            select(Conversation).where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id
            )
        )
        conversation = conv_res.scalars().first()

    if not conversation:
        title = request.message[:35] + ("..." if len(request.message) > 35 else "")
        conversation = Conversation(
            user_id=current_user.id,
            title=title if title else "New Conversation",
            model_id=request.model_id or "snapmind-local-7b",
            processing_mode="Local AI" if local_only else "Cloud Fallback"
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        sender="user",
        content=request.message,
        backend_used="User Input"
    )
    db.add(user_msg)
    await db.flush()

    # RAG Context Retrieval if documents attached
    context_chunks = []
    source_items = []
    if request.document_ids and len(request.document_ids) > 0:
        chunks_res = await db.execute(
            select(DocumentChunk, Document.filename)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(DocumentChunk.document_id.in_(request.document_ids))
        )
        db_rows = chunks_res.all()
        chunks_list = []
        for chunk, filename in db_rows:
            try:
                emb = json.loads(chunk.embedding_json)
            except Exception:
                emb = []
            chunks_list.append({
                "document_id": chunk.document_id,
                "filename": filename,
                "content": chunk.content,
                "embedding": emb
            })

        top_sources = RAGPipeline.search_chunks(request.message, chunks_list, top_k=4)
        context_chunks = [s["content"] for s in top_sources]
        source_items = top_sources

    # AI Generation
    if local_only or request.local_only:
        provider = LocalModelProvider(model_name=request.model_id or "snapmind-local-7b")
        TelemetryTracker.record_request(is_local=True)
    else:
        provider = CloudModelProvider(model_name=request.model_id or "gpt-4o-mini")
        TelemetryTracker.record_request(is_local=False)

    response_data = await provider.generate_response(
        prompt=request.message,
        context_chunks=context_chunks
    )

    assistant_msg = Message(
        conversation_id=conversation.id,
        sender="assistant",
        content=response_data["content"],
        backend_used=response_data["backend_used"],
        latency_ms=response_data["latency_ms"],
        tokens_count=response_data["tokens_count"],
        sources_json=json.dumps(source_items)
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return MessageResponse(
        id=assistant_msg.id,
        conversation_id=conversation.id,
        sender="assistant",
        content=assistant_msg.content,
        backend_used=assistant_msg.backend_used,
        latency_ms=assistant_msg.latency_ms,
        tokens_count=assistant_msg.tokens_count,
        sources=source_items,
        created_at=assistant_msg.created_at
    )

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    
    out = []
    for c in conversations:
        msgs = []
        for m in c.messages:
            sources = []
            if m.sources_json:
                try:
                    sources = json.loads(m.sources_json)
                except Exception:
                    sources = []
            msgs.append(MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                sender=m.sender,
                content=m.content,
                backend_used=m.backend_used,
                latency_ms=m.latency_ms,
                tokens_count=m.tokens_count,
                sources=sources,
                created_at=m.created_at
            ))
        out.append(ConversationResponse(
            id=c.id,
            title=c.title,
            model_id=c.model_id,
            processing_mode=c.processing_mode,
            created_at=c.created_at,
            updated_at=c.updated_at,
            messages=msgs
        ))
    return out

@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
async def get_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conv_id, Conversation.user_id == current_user.id)
    )
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    msgs = []
    for m in c.messages:
        sources = []
        if m.sources_json:
            try:
                sources = json.loads(m.sources_json)
            except Exception:
                sources = []
        msgs.append(MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            content=m.content,
            backend_used=m.backend_used,
            latency_ms=m.latency_ms,
            tokens_count=m.tokens_count,
            sources=sources,
            created_at=m.created_at
        ))
    return ConversationResponse(
        id=c.id,
        title=c.title,
        model_id=c.model_id,
        processing_mode=c.processing_mode,
        created_at=c.created_at,
        updated_at=c.updated_at,
        messages=msgs
    )

@router.delete("/conversations/{conv_id}")
async def delete_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == current_user.id)
    )
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.delete(c)
    await db.commit()
    return {"message": "Conversation deleted successfully."}

@router.put("/conversations/{conv_id}", response_model=ConversationResponse)
async def update_conversation(
    conv_id: str,
    update_in: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == current_user.id)
    )
    c = result.scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if update_in.title:
        c.title = update_in.title
    await db.commit()
    await db.refresh(c)
    return await get_conversation(c.id, current_user, db)
