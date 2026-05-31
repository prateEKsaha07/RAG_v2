from dotenv import load_dotenv
import os

load_dotenv()

def get_answer(question, llm, vectorStoreDB):
    # Get relevant chunks
    docs = vectorStoreDB.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    # Build prompt manually
    prompt = f"""You are a helpful study assistant.
Answer using ONLY the context below in 2-4 sentences.
Paraphrase in your own words, no bullet points or headers.
If answer is not in context say "I don't have enough information in your notes."

Context:
{context}

Question: {question}

Answer:"""
    
    response = llm.invoke(prompt)
    
    return {
        "answer": response.content,
        "sources": list(set([
            doc.metadata.get("source", "")
            for doc in docs
        ]))
    }