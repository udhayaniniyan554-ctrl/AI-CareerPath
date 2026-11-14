import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.database import get_db
from app.auth import get_current_user
from app.agents.orchestrator import orchestrator
from app.schemas import TaskCompleteRequest

router = APIRouter(prefix="/api/roadmap", tags=["Learning Roadmap"])

@router.get("", response_model=Dict[str, Any])
def get_current_roadmap(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM learning_roadmaps WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", (user_id,))
        roadmap = cursor.fetchone()

        if not roadmap:
            # Auto-generate if not existing
            cursor.execute("SELECT target_career FROM student_profiles WHERE user_id = ?", (user_id,))
            prof = cursor.fetchone() or {}
            target = prof.get("target_career") or "Full Stack Developer"
            orchestrator.run_full_pipeline(user_id=user_id, target_career_override=target)
            cursor.execute("SELECT * FROM learning_roadmaps WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", (user_id,))
            roadmap = cursor.fetchone()

        if not roadmap:
            raise HTTPException(status_code=404, detail="No active roadmap found.")

        cursor.execute("""
            SELECT * FROM roadmap_tasks 
            WHERE roadmap_id = ? 
            ORDER BY stage_order ASC, id ASC
        """, (roadmap["id"],))
        raw_tasks = cursor.fetchall()

    tasks_formatted = []
    for t in raw_tasks:
        td = dict(t)
        td["learning_objectives"] = json.loads(t.get("learning_objectives") or "[]")
        td["required_skills"] = json.loads(t.get("required_skills") or "[]")
        td["practical_exercises"] = json.loads(t.get("practical_exercises") or "[]")
        td["recommended_resources"] = json.loads(t.get("recommended_resources") or "[]")
        tasks_formatted.append(td)

    completed_count = sum(1 for t in tasks_formatted if t["is_completed"])
    total_count = len(tasks_formatted)
    pct = round((completed_count / max(1, total_count)) * 100, 1)

    return {
        "roadmap": {
            "id": roadmap["id"],
            "user_id": roadmap["user_id"],
            "career_goal": roadmap["career_goal"],
            "title": roadmap["title"],
            "summary": roadmap["summary"],
            "total_stages": roadmap["total_stages"],
            "completion_percentage": pct,
            "created_at": str(roadmap["created_at"]),
            "updated_at": str(roadmap["updated_at"])
        },
        "tasks": tasks_formatted,
        "completed_count": completed_count,
        "total_count": total_count
    }

@router.post("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, request: TaskCompleteRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    result = orchestrator.progress_agent.track_task_completion(
        user_id=user_id,
        task_id=task_id,
        is_completed=request.is_completed
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
