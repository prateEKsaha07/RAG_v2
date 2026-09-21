from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_cohere import CohereEmbeddings
from dotenv import load_dotenv
import os

def run_ingestion():
    load_dotenv()
    
    embeddings = CohereEmbeddings(
        model="embed-english-light-v3.0",
        cohere_api_key=os.getenv("COHERE_API_KEY")
    )

    loader = DirectoryLoader(
        "data/uploads/",
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}
    )
    documents = loader.load()
    print(f"Loaded {len(documents)} files.")

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)

    all_chunks = []
    for doc in documents:
        try:
            md_chunks = markdown_splitter.split_text(doc.page_content)
            for chunk in md_chunks:
                chunk.metadata.update(doc.metadata)
                header_context = " > ".join(
                    [chunk.metadata.get(h, "") for h in ["Header 1", "Header 2", "Header 3"] if chunk.metadata.get(h)]
                )
                if header_context:
                    chunk.page_content = f"{header_context}\n\n{chunk.page_content}"
            final_chunks = text_splitter.split_documents(md_chunks)
            all_chunks.extend(final_chunks)
        except Exception as e:
            print(f"Error processing {doc.metadata.get('source')}: {e}")

    # Deduplicate
    seen = set()
    unique_chunks = []
    for chunk in all_chunks:
        key = (chunk.metadata.get("source"), chunk.page_content[:100])
        if key not in seen:
            seen.add(key)
            unique_chunks.append(chunk)
    all_chunks = unique_chunks

    # Incremental indexing
    if os.path.exists("faiss_index"):
        vectorStores = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
        vectorStores.add_documents(all_chunks)
    else:
        vectorStores = FAISS.from_documents(all_chunks, embeddings)
    
    vectorStores.save_local("faiss_index")
    print(f"Saved {len(all_chunks)} chunks to FAISS.")
    return len(all_chunks)