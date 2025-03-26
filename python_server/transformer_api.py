from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import os

app = FastAPI()

# Load Sentence Transformer model
vectorizer_model_path = "models/all-MiniLM-L6-v2"
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
