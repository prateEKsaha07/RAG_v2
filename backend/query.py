from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
import os
from langchain_cohere import ChatCohere
from langchain_cohere import CohereEmbeddings
from langchain_classic.chains import RetrievalQA

load_dotenv()
embeddings = CohereEmbeddings(
    model="embed-english-light-v3.0",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)
vectorStoreDB =FAISS.load_local("faiss_index",embeddings,allow_dangerous_deserialization=True)

print("Index loaded successfully")

retriever = vectorStoreDB.as_retriever(search_kwargs={"k": 3})

llm = ChatCohere(
    model="command-r7b-12-2024",
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    max_tokens=150
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm, 
    retriever=retriever,
    return_source_documents=True
)

