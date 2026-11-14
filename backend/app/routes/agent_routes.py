from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional
from app.auth import get_current_user
from app.agents.orchestrator import orchestrator
from app.schemas import RoadmapGenerateRequest

router = APIRouter(prefix="/api/agents", tags=["AI Agents & Multi-Agent Orchestrator"])

@router.post("/pipeline/run", response_model=Dict[str, Any])
def run_orchestration_pipeline(request: RoadmapGenerateRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    result = orchestrator.run_full_pipeline(
        user_id=user_id,
        target_career_override=request.target_career
    )
    return result

@router.get("/activity")
def get_agent_activity(limit: int = Query(default=50, le=100), current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return orchestrator.get_activity_feed(user_id=user_id, limit=limit)

@router.get("/overview")
def get_agents_overview():
    return {
        "status": "OPERATIONAL",
        "orchestrator": "Central Collaborative Multi-Agent Engine",
        "agents": [
            {
                "name": orchestrator.skill_agent.name,
                "role": orchestrator.skill_agent.role,
                "status": "ACTIVE",
                "specialization": "Skill-Gap Quantification, Proficiency Categorization"
            },
            {
                "name": orchestrator.career_agent.name,
                "role": orchestrator.career_agent.role,
                "status": "ACTIVE",
                "specialization": "Industry Role Benchmarking, Competency Match Index"
            },
            {
                "name": orchestrator.roadmap_agent.name,
                "role": orchestrator.roadmap_agent.role,
                "status": "ACTIVE",
                "specialization": "Adaptive Milestone Synthesis, Lab Exercises"
            },
            {
                "name": orchestrator.recommendation_agent.name,
                "role": orchestrator.recommendation_agent.role,
                "status": "ACTIVE",
                "specialization": "Verified Course Curation, Documentation Linking"
            },
            {
                "name": orchestrator.progress_agent.name,
                "role": orchestrator.progress_agent.role,
                "status": "ACTIVE",
                "specialization": "Performance Auditing, Dynamic Remediation Injection"
            },
            {
                "name": orchestrator.mentor_agent.name,
                "role": orchestrator.mentor_agent.role,
                "status": "ACTIVE",
                "specialization": "1-on-1 Personalized Coaching, Concept Explanation"
            }
        ]
    }
