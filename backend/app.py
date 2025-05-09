import os
import fitz  # PyMuPDF
import chromadb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import requests

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
PDF_FOLDER = "./pdfs"
DB_FOLDER = "./db"
EMBED_MODEL = "all-MiniLM-L6-v2"
LLAMA_ENDPOINT = "http://localhost:11434/api/generate"  # Ollama

# Initialize
embedder = SentenceTransformer(EMBED_MODEL)
client = chromadb.Client()
collection = client.get_or_create_collection(name="pdf_knowledge")

# Zero-shot classifier (optional, but kept if needed later)
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Known intents
INTENT_LABELS = {
    "talk_to_ai": ["talk to AI", "chat with assistant", "open support chat"],
    "view_mood": ["mood trends", "mood report", "emotion graph" ,"mood check"],
    "mental_health": ["health exercises", "mental wellness", "daily workouts","mental activities","mental health"],
    "negative": ["no", "not now", "don't want", "cancel", "stop", "exit"]
}

# Precompute intent phrase embeddings for accuracy and efficiency
intent_embeddings = {
    intent: embedder.encode(phrases)
    for intent, phrases in INTENT_LABELS.items()
}

# Utility: PDF parsing
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

# Utility: Embed docs
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

# Semantic search
def search_documents(query, top_k=3):
    query_embedding = embedder.encode(query).tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
    return results["documents"][0]

# NLP intent detection using sentence embeddings and cosine similarity
def detect_intent_nlp(text: str):
    input_embedding = embedder.encode([text])  # shape: (1, 384)

    best_intent = None
    best_score = 0.0

    for intent, phrase_embeds in intent_embeddings.items():
        similarity_scores = cosine_similarity(input_embedding, phrase_embeds)[0]
        max_score = np.max(similarity_scores)

        if max_score > best_score:
            best_score = max_score
            best_intent = intent

    # Reject weak matches (confidence threshold)
    if best_score < 0.6:
        return {"intent": None, "score": round(float(best_score), 3)}
    else:
        return {"intent": best_intent, "score": round(float(best_score), 3)}

# Call to LLaMA model via Ollama
def call_ollama(prompt: str):
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(LLAMA_ENDPOINT, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "⚠️ Ollama returned no response.")
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return "⚠️ Failed to contact AI model."

# Pydantic input model
class Question(BaseModel):
    query: str

# Main endpoint: Ask agent
@app.post("/ask")
async def ask_agent(question: Question):
    query = question.query.strip()
    if not query:
        return {"answer": "⚠️ Please enter a valid question."}

    # Detect intent
    intent_result = detect_intent_nlp(query)
    intent = intent_result["intent"]

    # Search docs for relevant context
    relevant_docs = search_documents(query)
    context = "\n\n".join(relevant_docs)

    final_prompt = f"""Answer the user's question based on the context below.

Context:
{context}

User's Question: {query}

Answer:"""

    answer = call_ollama(final_prompt)

    return {
        "answer": answer,
        "intent": intent,
        "corrected": query
    }

# Intent detection only endpoint
@app.post("/detect_intent")
async def detect_intent_route(question: Question):
    text = question.query.strip()
    if not text:
        return {"intent": None, "score": 0.0}
    
    result = detect_intent_nlp(text)
    return result

# Ingest PDF content on startup
@app.on_event("startup")
def on_startup():
    ingest_pdfs()
