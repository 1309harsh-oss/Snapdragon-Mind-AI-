import time
from typing import Dict, Any, List
from app.ai.provider_base import AIModelProvider

class MockModelProvider(AIModelProvider):
    """
    Mock Provider for automated test suites and isolated offline verification.
    """
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str = "Mock System",
        context_chunks: List[str] = None,
        max_tokens: int = 512
    ) -> Dict[str, Any]:
        return {
            "content": f"Mock Response to: {prompt}",
            "backend_used": "MockExecutionProvider",
            "execution_label": "Test Mock Engine",
            "latency_ms": 1.5,
            "tokens_count": 10,
            "is_local": True,
            "hardware_target": "CPU"
        }

    async def generate_embeddings(self, text_list: List[str]) -> List[List[float]]:
        return [[0.1] * 128 for _ in text_list]

    def get_provider_info(self) -> Dict[str, Any]:
        return {
            "provider": "MockModelProvider",
            "model_name": "Mock-7B",
            "is_local": True,
            "hardware_acceleration": "Mock CPU"
        }
