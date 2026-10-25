import os
import re
from collections import Counter

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS

from app.core.rag import rag
from app.core.text_utils import normalize_subject_key

def extract_subject_from_filename(filepath: str) -> str:
    """
    'data/uploads/Computer-Graphics.md' -> 'Computer Graphics'
    """
    filename = os.path.basename(filepath).replace(".md", "")
    subject = filename.replace("-", " ").replace("_", " ").strip()
    return subject.title()

def extract_unit_info(unit_header: str):
    """
    'Unit I: Fundamentals of Computer Graphics' -> (1, 'Fundamentals of Computer Graphics')
    Returns (None, None) if no match.
    """
    if not unit_header:
        return None, None

    roman_map = {
        "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5,
        "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10,
    }

    match = re.match(r"Unit\s+([IVX]+)\s*:?\s*(.*)", unit_header, re.IGNORECASE)
    if match:
        roman = match.group(1).upper()
        name = match.group(2).strip() or None
        number = roman_map.get(roman)
        return number, name

    return None, None

def run_ingestion(embeddings=None) -> int:
    """
    Load all .md files from data/uploads/, chunk them, embed, and merge into
    the shared FAISS index at faiss_index/. Returns the number of chunks added.
    """
    if embeddings is None:
        embeddings = rag.embeddings
    if embeddings is None:
        raise RuntimeError(
            "Embeddings not initialised. Call load_rag() before running ingestion."
        )

    loader = DirectoryLoader(
        "data/uploads/",
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
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
            source_path = doc.metadata.get("source", "")
            subject = extract_subject_from_filename(source_path)
            subject_key = normalize_subject_key(subject)

            md_chunks = markdown_splitter.split_text(doc.page_content)

            for chunk in md_chunks:
                chunk.metadata.update(doc.metadata)

                unit_header = chunk.metadata.get("Header 1", "")
                unit_number, unit_name = extract_unit_info(unit_header)

                chunk.metadata["subject"] = subject
                chunk.metadata["subject_key"] = subject_key
                chunk.metadata["unit_number"] = unit_number
                chunk.metadata["unit_name"] = unit_name
                chunk.metadata["unit_header"] = unit_header
                chunk.metadata["chapter"] = chunk.metadata.get("Header 2", "")
                chunk.metadata["topic"] = chunk.metadata.get("Header 3", "")

            final_chunks = text_splitter.split_documents(md_chunks)

            for chunk in final_chunks:
                header_context = " > ".join(
                    chunk.metadata.get(h, "")
                    for h in ["Header 1", "Header 2", "Header 3"]
                    if chunk.metadata.get(h)
                )
                if header_context:
                    chunk.page_content = f"{header_context}\n\n{chunk.page_content}"

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
    index_file = os.path.join("faiss_index", "index.faiss")

    if os.path.exists(index_file):
        print("Existing FAISS index found. Appending new chunks...")
        vector_store = FAISS.load_local(
            "faiss_index",
            embeddings,
            allow_dangerous_deserialization=True,
        )
        vector_store.add_documents(all_chunks)
    else:
        print("No existing FAISS index. Creating a new one...")
        vector_store = FAISS.from_documents(all_chunks, embeddings)

    vector_store.save_local("faiss_index")
    print(f"Saved {len(all_chunks)} chunks to FAISS.")

    try:
        subject_counts = Counter(c.metadata.get("subject") for c in all_chunks)
        unit_counts = Counter(
            f"{c.metadata.get('subject')} — Unit {c.metadata.get('unit_number')}"
            for c in all_chunks
            if c.metadata.get("unit_number")
        )
        print("Chunks per subject:", dict(subject_counts))
        print("Chunks per unit:", dict(unit_counts))
    except Exception as e:
        print(f"Summary failed: {e}")

    return len(all_chunks)