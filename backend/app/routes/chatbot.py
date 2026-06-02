from fastapi import APIRouter

from backend.app.schemas import ChatRequest
from backend.app.services.chatbot_service import chat_with_farmer


router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])


@router.post("/chat")
async def chat(payload: ChatRequest):
    return await chat_with_farmer(payload.message, payload.language, payload.context)
