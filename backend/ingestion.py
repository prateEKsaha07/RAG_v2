from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import MarkdownHeaderTextSplitter

def run_ingestion():
    embeddings = HuggingFaceEmbeddings(
        model_name = "all-MiniLM-L6-v2"
    )

    loader = DirectoryLoader("data/", 
                         glob="**/*.md", 
                         loader_cls = TextLoader,
                         loader_kwargs={"encoding": "utf-8"})

    documents = loader.load()
    print(f"Successfully loaded {len(documents)} text files.")
    headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
    ]

    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on
    )

    all_chunks = []
    for doc in documents:
        text = doc.page_content
        chunks = markdown_splitter.split_text(text)
        for chunk in chunks:
            chunk.metadata["source"] = doc.metadata["source"]
        all_chunks.extend(chunks)
    vectorStores = FAISS.from_documents(all_chunks, embeddings)
    vectorStores.save_local("faiss_index")
    print("vectorDB saved")
    return len(all_chunks)


