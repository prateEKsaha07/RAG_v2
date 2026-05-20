from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

loader = DirectoryLoader("data/", 
                         glob="**/*.txt", 
                         loader_cls = TextLoader,
                         loader_kwargs={"encoding": "utf-8"})

documents = loader.load()
print(f"Successfully loaded {len(documents)} text files.")
print(documents[0].page_content)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 200,
    chunk_overlap = 20,
    length_function=len
)

chunks = text_splitter.split_documents(documents)

print(len(chunks))

embeddings = HuggingFaceEmbeddings(
    model_name = "all-MiniLM-L6-v2"
)
vector = embeddings.embed_query(chunks[0].page_content)

vectorStores = FAISS.from_documents(documents, embeddings)
vectorStores.save_local("faiss_index")
print("vectorDB saved")