from abc import ABC, abstractmethod
from typing import Dict, Any, List

class AIModelProvider(ABC):
    """
    Abstract Base Class for AI Model Providers (Local, Cloud, Mock).
    Enables seamless swapping between ARM64 ONNX local models and external cloud models.
    """
    
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str = "You are SnapMind AI, an intelligent, privacy-first local assistant optimized for Snapdragon AI PCs.",
        context_chunks: List[str] = None,
        max_tokens: int = 512
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def generate_embeddings(self, text_list: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        pass
