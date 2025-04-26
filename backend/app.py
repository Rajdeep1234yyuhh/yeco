# /backend/app.py
import os
import fitz  # PyMuPDF
import chromadb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import requests

app = FastAPI()

# CORS settings: Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set ["http://localhost:3000"] if you want safer
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
PDF_FOLDER = "./pdfs"
DB_FOLDER = "./db"
EMBED_MODEL = "all-MiniLM-L6-v2"
LLAMA_ENDPOINT = "http://localhost:11434/api/generate"  # Ollama local

# Initialize
embedder = SentenceTransformer(EMBED_MODEL)
client = chromadb.Client()
collection = client.get_or_create_collection(name="pdf_knowledge")

# Parse PDFs
def parse_pdfs(folder_path):
    docs = []
    for filename in os.listdir(folder_path):
        if filename.endswith(".pdf"):
            pdf_path = os.path.join(folder_path, filename)
            doc = fitz.open(pdf_path)
            for page in doc:
                text = page.get_text().strip()
                if text:
                    docs.append({"text": text, "source": filename})
    return docs

# Ingest PDFs into vector db
def ingest_pdfs():
    docs = parse_pdfs(PDF_FOLDER)
    for idx, doc in enumerate(docs):
        embedding = embedder.encode(doc["text"]).tolist()
        collection.add(
            documents=[doc["text"]],
            embeddings=[embedding],
            metadatas=[{"source": doc["source"]}],
            ids=[f"doc_{idx}"]
        )
    print(f"[+] Ingested {len(docs)} documents.")

# Search most relevant document chunks
def search_documents(query, top_k=3):
    query_embedding = embedder.encode(query).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    documents = results["documents"][0]
    return documents

# Send prompt to Ollama
def call_ollama(prompt):
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(LLAMA_ENDPOINT, json=payload)
        response.raise_for_status()  # raise error if bad HTTP
        result = response.json()
        if "response" in result:
            return result["response"]
        else:
            return "⚠️ Ollama returned no response."
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return "⚠️ Failed to contact AI model."


# API Schemas
class Question(BaseModel):
    query: str

@app.post("/ask")
async def ask_agent(question: Question):
    relevant_docs = search_documents(question.query)
    context = "\n\n".join(relevant_docs)
    final_prompt = f"""Answer the user's question based on the context below.

Context:
{context}

User's Question: {question.query}

Answer:"""
    answer = call_ollama(final_prompt)
    return {"answer": answer}

# Ingest PDFs at startup (important!!)
@app.on_event("startup")
def on_startup():
    ingest_pdfs()
