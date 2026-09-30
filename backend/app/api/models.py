from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.ai.model_manager import ModelManager
from app.schemas.models import AIModelResponse, AIModelLoadRequest
from app.core.security import get_current_user
from app.database.models import User

router = APIRouter(prefix="/models", tags=["AI Model Center"])

@router.get("", response_model=List[AIModelResponse])
async def list_models(current_user: User = Depends(get_current_user)):
    models = ModelManager.get_all_models()
    return models

@router.post("/{model_id}/load", response_model=AIModelResponse)
async def load_model(
    model_id: str,
    load_in: AIModelLoadRequest = None,
    current_user: User = Depends(get_current_user)
):
    model = ModelManager.get_model_by_id(model_id)
    model["status"] = "Ready"
    model["is_active"] = True
    if load_in and load_in.target_backend:
        model["backend"] = load_in.target_backend
    return model

@router.post("/{model_id}/unload", response_model=AIModelResponse)
async def unload_model(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    model = ModelManager.get_model_by_id(model_id)
    model["status"] = "Ready"
    model["is_active"] = False
    return model
