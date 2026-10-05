from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.app.services.copilot_service import copilot_service

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])

class CopilotQueryRequest(BaseModel):
    query: str
    symbol_context: Optional[str] = "RELIANCE"

@router.post("/chat")
async def chat_with_copilot(req: CopilotQueryRequest):
    """
    Interacts with TradeGuard Copilot trading assistant.
    Provides data-backed explanations for signals, risk parameters, portfolio exposure, and blocked trades.
    """
    result = await copilot_service.answer_query(req.query, req.symbol_context or "RELIANCE")
    return result
