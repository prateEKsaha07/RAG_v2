from fastapi import HTTPException
from app.core.rag import rag

def get_llm():
    if rag.llm is None:
        raise HTTPException(503, "LLM not ready. Server still starting.")
    return rag.llm

def get_vector_store():
    if rag.vector_store_db is None:
        raise HTTPException(
            503, "Vector store not ready. Please ingest documents first."
        )
    return rag.vector_store_db

def get_embeddings():
    if rag.embeddings is None:
        raise HTTPException(503, "Embeddings not ready.")
    return rag.embeddings