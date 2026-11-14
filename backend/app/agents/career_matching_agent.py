import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class CareerMatchingAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Career Matching Agent", role="Matches skills against career profiles and calculates match index")

    def match_career(
        self,
        user_id: int,
        target_career: str,
        user_skills: List[Dict[str, Any]],
        skill_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        start_time = time.time()

        user_skill_map = {s["skill_name"].lower(): s.get("proficiency", "Beginner") for s in user_skills}
        
        # Factors: Advanced: 1.0, Intermediate: 0.7, Beginner: 0.4
        weight_map = {"Advanced": 1.0, "Intermediate": 0.7, "Beginner": 0.4}

        career_evaluations = []

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, category, description, salary_range, demand_level, required_technical_skills, required_soft_skills FROM career_roles")
            roles = cursor.fetchall()

        for role in roles:
            tech = json.loads(role["required_technical_skills"]) if role["required_technical_skills"] else []
            soft = json.loads(role["required_soft_skills"]) if role["required_soft_skills"] else []
            all_reqs = tech + soft
            total_possible_score = len(all_reqs) * 1.0

            matched_skills = []
            missing_skills = []
            earned_score = 0.0

            for req in all_reqs:
                req_low = req.lower()
                if req_low in user_skill_map:
                    prof = user_skill_map[req_low]
                    factor = weight_map.get(prof, 0.4)
                    earned_score += factor
                    matched_skills.append({"name": req, "proficiency": prof})
                else:
                    missing_skills.append(req)

            match_pct = round((earned_score / max(1.0, total_possible_score)) * 100, 1)

            career_evaluations.append({
                "id": role["id"],
                "title": role["title"],
                "category": role["category"],
                "description": role["description"],
                "salary_range": role["salary_range"],
                "demand_level": role["demand_level"],
                "match_percentage": match_pct,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "total_skills_count": len(all_reqs)
            })

        # Sort descending by match percentage
        career_evaluations.sort(key=lambda x: x["match_percentage"], reverse=True)

        # Find target career specific evaluation
        target_eval = next((c for c in career_evaluations if c["title"].lower() == target_career.lower()), None)
        if not target_eval and career_evaluations:
            target_eval = career_evaluations[0]

        top_recommendations = [c for c in career_evaluations if c["title"].lower() != target_career.lower()][:3]

        summary = (
            f"Evaluated {len(career_evaluations)} career benchmarks. "
            f"Target career '{target_eval['title']}' has a {target_eval['match_percentage']}% skill match. "
            f"Top alternative recommendations: {', '.join([c['title'] + ' (' + str(c['match_percentage']) + '%)' for c in top_recommendations])}."
        )

        result = {
            "target_career": target_eval["title"],
            "target_match_percentage": target_eval["match_percentage"],
            "target_matched_skills": target_eval["matched_skills"],
            "target_missing_skills": target_eval["missing_skills"],
            "target_salary_range": target_eval["salary_range"],
            "target_demand_level": target_eval["demand_level"],
            "top_recommendations": top_recommendations,
            "all_careers": career_evaluations,
            "summary": summary
        }

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="Career Readiness Benchmark",
            input_summary=f"Evaluated against target: {target_career}",
            output_summary=summary,
            details=result,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return result
