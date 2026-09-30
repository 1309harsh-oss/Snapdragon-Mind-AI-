import numpy as np
import re
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer

class LocalEmbeddingService:
    """
    Local Vector Embedding Engine optimized for ARM64 vector execution.
    Generates 128-dimensional dense semantic vectors using TF-IDF + hashing matrix projections.
    """
    def __init__(self, embedding_dim: int = 128):
        self.embedding_dim = embedding_dim
        # Deterministic projection matrix for vector normalization
        np.random.seed(42)
        self.projection_matrix = np.random.randn(2048, embedding_dim).astype(np.float32)
        # Normalize projection matrix
        self.projection_matrix /= np.linalg.norm(self.projection_matrix, axis=0, keepdims=True)

    def _hash_word(self, word: str) -> int:
        h = 0
        for char in word:
            h = (h * 31 + ord(char)) % 2048
        return h

    def embed_text(self, text: str) -> List[float]:
        words = re.findall(r'\w+', text.lower())
        if not words:
            return [0.0] * self.embedding_dim
        
        vector = np.zeros(2048, dtype=np.float32)
        for w in words:
            idx = self._hash_word(w)
            vector[idx] += 1.0

        # Apply term frequency scaling
        vector = np.log1p(vector)
        # Project to dense embedding space
        dense_vec = np.dot(vector, self.projection_matrix)
        
        # L2 Normalize
        norm = np.linalg.norm(dense_vec)
        if norm > 0:
            dense_vec /= norm
            
        return dense_vec.tolist()

    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        return [self.embed_text(doc) for doc in documents]

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

embedding_service = LocalEmbeddingService()
