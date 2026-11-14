import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class SkillAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Skill Analysis Agent", role="Evaluates student skill proficiency and identifies gaps")

    def analyze(self, user_id: int, target_career: str, user_skills: List[Dict[str, Any]], quiz_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Fetch required skills for target career
        required_skills = []
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT required_technical_skills, required_soft_skills FROM career_roles WHERE title = ?", (target_career,))
            role = cursor.fetchone()
            if role:
                tech = json.loads(role["required_technical_skills"]) if role["required_technical_skills"] else []
                soft = json.loads(role["required_soft_skills"]) if role["required_soft_skills"] else []
                required_skills = tech + soft
            else:
                required_skills = ["Python", "JavaScript", "SQL", "Git", "Problem Solving", "Communication"]

        # 2. Map existing skills
        possessed_skill_names = {s["skill_name"].lower(): s for s in user_skills}
        
        # Incorporate quiz results
        quiz_skill_scores = {}
        for q in quiz_results:
            skill = q.get("skill_target") or q.get("category")
            if skill:
                s_lower = skill.lower()
                score = q.get("score", 0)
                if s_lower not in quiz_skill_scores or score > quiz_skill_scores[s_lower]:
                    quiz_skill_scores[s_lower] = score

        strong_skills = []
        intermediate_skills = []
        beginner_skills = []
        missing_skills = []

        for req in required_skills:
            req_lower = req.lower()
            if req_lower in possessed_skill_names or req_lower in quiz_skill_scores:
                item = possessed_skill_names.get(req_lower, {})
                score = quiz_skill_scores.get(req_lower, item.get("score", 50))
                prof = item.get("proficiency", "Beginner")
                
                # Check verified proficiency
                if score >= 80 or prof == "Advanced":
                    strong_skills.append({"name": req, "proficiency": "Advanced", "score": score, "verified": item.get("verified", 0)})
                elif score >= 55 or prof == "Intermediate":
                    intermediate_skills.append({"name": req, "proficiency": "Intermediate", "score": score, "verified": item.get("verified", 0)})
                else:
                    beginner_skills.append({"name": req, "proficiency": "Beginner", "score": score, "verified": item.get("verified", 0)})
            else:
                missing_skills.append(req)

        # Possessed skills outside of direct requirement
        additional_skills = []
        req_lowers = [r.lower() for r in required_skills]
        for s in user_skills:
            if s["skill_name"].lower() not in req_lowers:
                additional_skills.append(s["skill_name"])

        # Calculate metrics
        total_req = len(required_skills)
        matched_count = len(strong_skills) + len(intermediate_skills) + len(beginner_skills)
        gap_percentage = round((len(missing_skills) / max(1, total_req)) * 100, 1)
        competency_score = round(
            ((len(strong_skills) * 1.0 + len(intermediate_skills) * 0.65 + len(beginner_skills) * 0.35) / max(1, total_req)) * 100, 1
        )

        strengths = [s["name"] for s in strong_skills]
        weaknesses = [s["name"] for s in beginner_skills] + missing_skills[:3]
        
        summary = (
            f"Analysis complete for target career '{target_career}'. "
            f"Evaluated {total_req} core skills: {len(strong_skills)} Strong, {len(intermediate_skills)} Intermediate, "
            f"{len(beginner_skills)} Beginner, and {len(missing_skills)} Missing. "
            f"Identified Skill Gap: {gap_percentage}%."
        )

        result = {
            "target_career": target_career,
            "gap_percentage": gap_percentage,
            "competency_score": competency_score,
            "total_required_skills": total_req,
            "matched_skills_count": matched_count,
            "strong_skills": strong_skills,
            "intermediate_skills": intermediate_skills,
            "beginner_skills": beginner_skills,
            "missing_skills": missing_skills,
            "additional_skills": additional_skills,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "summary": summary
        }

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="Skill Gap Evaluation",
            input_summary=f"Profile skills: {len(user_skills)} | Target: {target_career}",
            output_summary=summary,
            details=result,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return result
