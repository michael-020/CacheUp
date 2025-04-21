from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Load Sentence Transformer model
vectorizer_model_path = "models/multi-qa-MiniLM-L6-cos-v1"
vectorizer = SentenceTransformer(vectorizer_model_path)

def encode_text(text: str):
    """Generate a text embedding vector."""
    embedding = vectorizer.encode(text).tolist()
    return embedding

@app.get("/vectorize")
def vectorize(text: str):
    """API endpoint to return embeddings for a given text."""
    vector = encode_text(text)
    return {"vector": vector}

if __name__ == "__main__":
    import uvicorn
    print("Running on port 8081...") 
    uvicorn.run(app, host="0.0.0.0", port=8081)
