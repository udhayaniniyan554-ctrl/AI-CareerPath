import json
from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.auth import get_current_user
from app.schemas import MentorMessageRequest
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/mentor", tags=["AI Mentor Studio"])

@router.post("/chat", response_model=Dict[str, Any])
def chat_with_mentor(request: MentorMessageRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    reply = orchestrator.mentor_agent.chat(
        user_id=user_id,
        message=request.message,
        context_topic=request.context_topic or ""
    )
    return reply

@router.get("/history", response_model=List[Dict[str, Any]])
def get_conversation_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, sender, message, metadata, created_at
            FROM mentor_conversations
            WHERE user_id = ?
            ORDER BY id ASC
            LIMIT 100
        """, (user_id,))
        rows = cursor.fetchall()

    history = []
    for r in rows:
        meta = json.loads(r["metadata"]) if r.get("metadata") else {}
        history.append({
            "id": r["id"],
            "sender": r["sender"],
            "message": r["message"],
            "metadata": meta,
            "created_at": str(r["created_at"])
        })
    return history
