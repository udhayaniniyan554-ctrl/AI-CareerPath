import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.auth import get_current_admin
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/admin", tags=["Admin Command Center"])

@router.get("/stats", response_model=Dict[str, Any])
def get_admin_stats(admin: dict = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as total_users, SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students FROM users")
        user_counts = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_assessments_taken, AVG(score) as avg_score, SUM(passed) as total_passed FROM assessment_results")
        quiz_stats = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_roadmaps, AVG(completion_percentage) as avg_completion FROM learning_roadmaps WHERE status = 'active'")
        roadmap_stats = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_agent_calls, AVG(latency_ms) as avg_latency FROM agent_activity_logs")
        agent_stats = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total_resources FROM learning_resources")
        total_resources = cursor.fetchone()["total_resources"]

        cursor.execute("SELECT COUNT(*) as total_roles FROM career_roles")
        total_roles = cursor.fetchone()["total_roles"]

        # Career distribution
        cursor.execute("SELECT target_career, COUNT(*) as count FROM student_profiles GROUP BY target_career")
        career_distribution = cursor.fetchall()

    return {
        "overview": {
            "total_users": user_counts["total_users"],
            "total_students": user_counts["total_students"],
            "total_assessments_taken": quiz_stats["total_assessments_taken"] or 0,
            "avg_assessment_score": round(quiz_stats["avg_score"] or 0.0, 1),
            "total_passed_assessments": quiz_stats["total_passed"] or 0,
            "active_roadmaps": roadmap_stats["total_roadmaps"] or 0,
            "avg_roadmap_completion": round(roadmap_stats["avg_completion"] or 0.0, 1),
            "total_agent_orchestrations": agent_stats["total_agent_calls"] or 0,
            "avg_agent_latency_ms": round(agent_stats["avg_latency"] or 0.0, 1),
            "total_learning_resources": total_resources,
            "total_career_roles": total_roles
        },
        "career_distribution": career_distribution
    }

@router.get("/users", response_model=List[Dict[str, Any]])
def list_users(admin: dict = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.full_name, u.role, u.created_at,
                   p.target_career, p.college, p.department, p.current_year, p.experience_level
            FROM users u
            LEFT JOIN student_profiles p ON u.id = p.user_id
            ORDER BY u.id DESC
        """)
        users = cursor.fetchall()
    return users

@router.get("/career-roles", response_model=List[Dict[str, Any]])
def list_career_roles(admin: dict = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM career_roles ORDER BY id ASC")
        roles = cursor.fetchall()
        
    for r in roles:
        r["required_technical_skills"] = json.loads(r.get("required_technical_skills") or "[]")
        r["required_soft_skills"] = json.loads(r.get("required_soft_skills") or "[]")
    return roles

@router.get("/logs", response_model=List[Dict[str, Any]])
def get_all_agent_logs(admin: dict = Depends(get_current_admin)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT l.*, u.email as user_email, u.full_name as user_name
            FROM agent_activity_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.id DESC LIMIT 100
        """)
        logs = cursor.fetchall()
    return logs
