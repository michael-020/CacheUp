from sentence_transformers import SentenceTransformer
import torch
import os

# Create a directory to store models
os.makedirs("models", exist_ok=True)

# Model 1: Sentence Transformer for Embeddings
text2vec_path = "models/multi-qa-MiniLM-L6-cos-v1"
if not os.path.exists(text2vec_path):
    print("Downloading Sentence Transformer model...")
    text2vec_model = SentenceTransformer("sentence-transformers/multi-qa-MiniLM-L6-cos-v1")
    text2vec_model.save(text2vec_path)

print("✅ Model downloaded successfully!")
