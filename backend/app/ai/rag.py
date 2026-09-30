import json
import re
from typing import List, Dict, Any
from app.ai.embeddings import embedding_service
from app.ai.local_provider import LocalModelProvider
from app.ai.cloud_provider import CloudModelProvider

class RAGPipeline:
    """
    Retrieval-Augmented Generation Pipeline.
    Handles Document Chunking, Vector Indexing, Semantic Retrieval, and Context-Aware AI Generation.
    """
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        words = text.split()
        if not words:
            return []
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + chunk_size])
            chunks.append(chunk)
            i += (chunk_size - overlap)
        return chunks

    @staticmethod
    def index_document_content(doc_id: str, content: str) -> List[Dict[str, Any]]:
        chunks = RAGPipeline.chunk_text(content)
        indexed_chunks = []
        for idx, chunk_text in enumerate(chunks):
            vector = embedding_service.embed_text(chunk_text)
            indexed_chunks.append({
                "document_id": doc_id,
                "chunk_index": idx,
                "content": chunk_text,
                "embedding": vector,
                "metadata": {"length": len(chunk_text), "words": len(chunk_text.split())}
            })
        return indexed_chunks

    @staticmethod
    def search_chunks(
        query: str,
        chunks: List[Dict[str, Any]],
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        if not chunks:
            return []
            
        query_vec = embedding_service.embed_text(query)
        scored_chunks = []

        for chunk in chunks:
            emb = chunk.get("embedding")
            if isinstance(emb, str):
                try:
                    emb = json.loads(emb)
                except Exception:
                    emb = []
            
            sim = embedding_service.cosine_similarity(query_vec, emb)
            scored_chunks.append({
                "document_id": chunk.get("document_id", ""),
                "filename": chunk.get("filename", "Document"),
                "content": chunk.get("content", ""),
                "similarity": round(float(sim), 4)
            })

        scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_chunks[:top_k]

    @staticmethod
    async def query_rag(
        query: str,
        chunks: List[Dict[str, Any]],
        local_only: bool = True,
        top_k: int = 4
    ) -> Dict[str, Any]:
        top_sources = RAGPipeline.search_chunks(query, chunks, top_k=top_k)
        context_texts = [s["content"] for s in top_sources]

        provider = LocalModelProvider() if local_only else CloudModelProvider()
        result = await provider.generate_response(
            prompt=query,
            context_chunks=context_texts
        )

        result["sources"] = top_sources
        return result
