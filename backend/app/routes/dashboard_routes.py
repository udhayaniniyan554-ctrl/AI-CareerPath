import json
from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.database import get_db
from app.auth import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/dashboard", tags=["Student Dashboard"])

@router.get("", response_model=Dict[str, Any])
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Profile & Target Career
        cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone() or {}
        target_career = profile.get("target_career") or "Full Stack Developer"
        exp_level = profile.get("experience_level") or "Beginner"

        # 2. Active Roadmap
        cursor.execute("SELECT * FROM learning_roadmaps WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", (user_id,))
        active_roadmap = cursor.fetchone()

        roadmap_tasks = []
        completed_tasks_count = 0
        total_tasks_count = 0
        roadmap_completion_pct = 0.0

        if active_roadmap:
            cursor.execute("""
                SELECT * FROM roadmap_tasks 
                WHERE roadmap_id = ? 
                ORDER BY stage_order ASC, id ASC
            """, (active_roadmap["id"],))
            raw_tasks = cursor.fetchall()
            total_tasks_count = len(raw_tasks)
            completed_tasks_count = sum(1 for t in raw_tasks if t["is_completed"])
            roadmap_completion_pct = round((completed_tasks_count / max(1, total_tasks_count)) * 100, 1)

            for t in raw_tasks:
                t_dict = dict(t)
                t_dict["learning_objectives"] = json.loads(t.get("learning_objectives") or "[]")
                t_dict["required_skills"] = json.loads(t.get("required_skills") or "[]")
                t_dict["practical_exercises"] = json.loads(t.get("practical_exercises") or "[]")
                roadmap_tasks.append(t_dict)
        else:
            # If no active roadmap, run the orchestrator to synthesize one
            try:
                orchestrator.run_full_pipeline(user_id=user_id, target_career_override=target_career)
                cursor.execute("SELECT * FROM learning_roadmaps WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", (user_id,))
                active_roadmap = cursor.fetchone()
                if active_roadmap:
                    cursor.execute("SELECT * FROM roadmap_tasks WHERE roadmap_id = ? ORDER BY stage_order ASC, id ASC", (active_roadmap["id"],))
                    raw_tasks = cursor.fetchall()
                    total_tasks_count = len(raw_tasks)
                    completed_tasks_count = sum(1 for t in raw_tasks if t["is_completed"])
                    roadmap_completion_pct = round((completed_tasks_count / max(1, total_tasks_count)) * 100, 1)
                    for t in raw_tasks:
                        t_dict = dict(t)
                        t_dict["learning_objectives"] = json.loads(t.get("learning_objectives") or "[]")
                        t_dict["required_skills"] = json.loads(t.get("required_skills") or "[]")
                        t_dict["practical_exercises"] = json.loads(t.get("practical_exercises") or "[]")
                        roadmap_tasks.append(t_dict)
            except Exception as e:
                print(f"Roadmap auto-init error: {e}")

        # 3. Skills Summary
        cursor.execute("""
            SELECT 
                id, user_id, skill_id, skill_name, 
                COALESCE(proficiency_percentage, score, 50) as proficiency_percentage,
                proficiency, score, COALESCE(category, 'Technical') as category, verified, source, updated_at
            FROM student_skills 
            WHERE user_id = ? 
            ORDER BY COALESCE(proficiency_percentage, score, 50) DESC, skill_name ASC
        """, (user_id,))
        skills = [dict(s) for s in cursor.fetchall()]

        # 4. Assessment Performance
        cursor.execute("""
            SELECT ar.*, a.title as assessment_title, a.category, a.skill_target
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.user_id = ?
            ORDER BY ar.id DESC LIMIT 5
        """, (user_id,))
        recent_assessments = cursor.fetchall()
        for a in recent_assessments:
            a["strengths"] = json.loads(a.get("strengths") or "[]")
            a["weaknesses"] = json.loads(a.get("weaknesses") or "[]")

        # 5. Calculate skill gap & readiness from database
        cursor.execute("SELECT required_technical_skills FROM career_roles WHERE title = ?", (target_career,))
        role_row = cursor.fetchone()
        req_skills = json.loads(role_row["required_technical_skills"]) if role_row and role_row["required_technical_skills"] else []

        user_skill_names = {s["skill_name"].lower() for s in skills}
        missing_skills = [r for r in req_skills if r.lower() not in user_skill_names]
        skill_gap_pct = round((len(missing_skills) / max(1, len(req_skills))) * 100, 1) if req_skills else 25.0
        career_readiness_pct = round(max(0.0, 100.0 - skill_gap_pct), 1)

        # 6. Pending vs Next Steps
        pending_tasks = [t for t in roadmap_tasks if not t["is_completed"]]
        recommended_next_step = pending_tasks[0] if pending_tasks else (roadmap_tasks[0] if roadmap_tasks else None)

        # 7. Recent Agent Activities
        cursor.execute("""
            SELECT id, agent_name, task_name, input_summary, output_summary, latency_ms, status, created_at
            FROM agent_activity_logs
            WHERE user_id = ? OR user_id IS NULL
            ORDER BY id DESC LIMIT 6
        """, (user_id,))
        recent_activities = cursor.fetchall()

    return {
        "user": current_user,
        "selected_career_goal": target_career,
        "current_skill_level": exp_level,
        "skill_gap_percentage": skill_gap_pct,
        "career_readiness_percentage": career_readiness_pct,
        "learning_progress": {
            "completion_percentage": roadmap_completion_pct,
            "completed_tasks": completed_tasks_count,
            "total_tasks": total_tasks_count,
            "active_roadmap_id": active_roadmap["id"] if active_roadmap else None,
            "active_roadmap_title": active_roadmap["title"] if active_roadmap else "Custom Track"
        },
        "skills_overview": skills,
        "missing_skills": missing_skills,
        "pending_tasks": pending_tasks[:3],
        "recommended_next_step": recommended_next_step,
        "recent_assessments": recent_assessments,
        "recent_activities": recent_activities
    }
