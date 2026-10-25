import os
from dotenv import load_dotenv

load_dotenv()

class RagState:
    embeddings = None
    vector_store_db = None
    llm = None
    notes_dbs: dict = {} 
    chat_histories: dict = {}  

rag = RagState()

def _load_faiss_safe(path: str):
    from langchain_community.vectorstores import FAISS

    index_file = os.path.join(path, "index.faiss")
    if not os.path.exists(index_file):
        print(f"FAISS index not found at '{path}'. Skipping load.")
        return None

    try:
        db = FAISS.load_local(
            path, rag.embeddings, allow_dangerous_deserialization=True
        )
        print(f"FAISS index loaded from '{path}'.")
        return db
    except Exception as e:
        print(f"Failed to load FAISS from '{path}': {e}")
        return None

def reload_vector_store(path: str = "faiss_index"):
    rag.vector_store_db = _load_faiss_safe(path)
    return rag.vector_store_db

def load_rag():
    from langchain_cohere import CohereEmbeddings, ChatCohere

    print("API Key exists:", bool(os.getenv("COHERE_API_KEY")))
    rag.embeddings = CohereEmbeddings(
        model="embed-english-light-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    )
    rag.vector_store_db = _load_faiss_safe("faiss_index")
    rag.llm = ChatCohere(
        model="command-r7b-12-2024",
        cohere_api_key=os.getenv("COHERE_API_KEY"),
    )
    print("RAG stack loaded")