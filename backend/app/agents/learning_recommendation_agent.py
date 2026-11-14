import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class LearningRecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Learning Recommendation Agent", role="Curates verified courses, documentation, and practical mini-projects")

    def recommend(
        self,
        user_id: int,
        target_career: str,
        missing_skills: List[str],
        active_stage_title: str = ""
    ) -> Dict[str, Any]:
        start_time = time.time()

        with get_db() as conn:
            cursor = conn.cursor()
            
            # Fetch saved resource IDs for this user
            cursor.execute("SELECT resource_id FROM saved_resources WHERE user_id = ?", (user_id,))
            saved_ids = {row["resource_id"] for row in cursor.fetchall()}

            # Fetch all resources
            cursor.execute("SELECT * FROM learning_resources")
            all_resources = cursor.fetchall()

        # Score and rank resources
        target_skill_set = {s.lower() for s in missing_skills}
        matched_resources = []

        for r in all_resources:
            r_skill = r["skill_name"].lower()
            is_match = False
            priority = 0
            
            for s in target_skill_set:
                if s in r_skill or r_skill in s:
                    is_match = True
                    priority += 2
            
            if target_career.lower() in (r.get("description", "") + r.get("title", "")).lower():
                is_match = True
                priority += 1

            if is_match or not target_skill_set:
                res_dict = dict(r)
                res_dict["is_saved"] = r["id"] in saved_ids
                res_dict["relevance_score"] = priority
                matched_resources.append(res_dict)

        # Sort by relevance, then rating
        matched_resources.sort(key=lambda x: (x.get("relevance_score", 0), x.get("rating", 4.5)), reverse=True)

        top_courses = [r for r in matched_resources if r["resource_type"] == "Course"][:4]
        top_docs = [r for r in matched_resources if r["resource_type"] == "Documentation"][:4]
        top_projects = [r for r in matched_resources if r["resource_type"] in ["Project", "Tutorial"]][:4]

        # In case some lists are short, fill from all matched
        if not top_courses:
            top_courses = matched_resources[:3]
        if not top_docs:
            top_docs = [r for r in all_resources if r["resource_type"] == "Documentation"][:3]

        # Recommended mini-projects based on missing skills
        mini_projects = self._generate_mini_projects(target_career, missing_skills)

        summary = (
            f"Curated {len(top_courses)} verified courses, {len(top_docs)} documentation guides, "
            f"and {len(mini_projects)} targeted mini-projects matching missing skills for {target_career}."
        )

        result = {
            "target_career": target_career,
            "recommended_courses": top_courses,
            "recommended_docs": top_docs,
            "recommended_projects": top_projects,
            "mini_projects": mini_projects,
            "total_matches": len(matched_resources),
            "summary": summary
        }

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="Learning Resource Curation",
            input_summary=f"Curating for {len(missing_skills)} missing skills | Career: {target_career}",
            output_summary=summary,
            details=result,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return result

    def _generate_mini_projects(self, target_career: str, missing_skills: List[str]) -> List[Dict[str, Any]]:
        projects = []
        m_set = {s.lower() for s in missing_skills}

        if "javascript" in m_set or "react" in m_set or "frontend" in target_career.lower() or "full stack" in target_career.lower():
            projects.append({
                "title": "Interactive Kanban Task Management App",
                "focus_skills": ["React", "JavaScript", "Local Storage", "Tailwind CSS"],
                "difficulty": "Intermediate",
                "estimated_hours": 6,
                "description": "Build a responsive Trello-style board with drag-and-drop columns, task filtering, priority tags, and JSON export.",
                "deliverables": ["Clean React component hierarchy", "State persistence across browser reloads", "Responsive mobile drawer"]
            })

        if "python" in m_set or "fastapi" in m_set or "backend" in target_career.lower() or "full stack" in target_career.lower():
            projects.append({
                "title": "Secure REST API with JWT Auth & SQLite",
                "focus_skills": ["Python", "FastAPI", "JWT", "Bcrypt", "SQLite"],
                "difficulty": "Intermediate",
                "estimated_hours": 8,
                "description": "Construct a production-ready API with student registration, password hashing, role-based endpoints, and Swagger docs.",
                "deliverables": ["JWT authentication dependency", "Pydantic request validation models", "Auto-generated OpenAPI schema"]
            })

        if "sql" in m_set or "database" in m_set:
            projects.append({
                "title": "E-Commerce Database Schema & Analytical Queries",
                "focus_skills": ["SQL", "Relational Modeling", "Indexing", "Aggregations"],
                "difficulty": "Beginner-Intermediate",
                "estimated_hours": 4,
                "description": "Design 3NF relational tables for an e-commerce platform and write complex window functions and sales aggregation queries.",
                "deliverables": ["DDL creation scripts with foreign keys", "5 high-performance reporting queries", "Query EXPLAIN optimization report"]
            })

        if "ai" in target_career.lower() or "machine learning" in m_set or "pytorch" in m_set:
            projects.append({
                "title": "Customer Churn Prediction Model & FastAPI Serving",
                "focus_skills": ["Python", "Scikit-Learn", "FastAPI", "Pandas"],
                "difficulty": "Advanced",
                "estimated_hours": 10,
                "description": "Train a Random Forest classifier on tabular customer data, evaluate ROC-AUC, export model weights, and expose via FastAPI.",
                "deliverables": ["Jupyter notebook with feature engineering", "Serialized model file", "FastAPI POST /predict endpoint"]
            })

        # Fallback default project
        if not projects:
            projects.append({
                "title": f"Production Portfolio Milestone for {target_career}",
                "focus_skills": missing_skills[:3] if missing_skills else ["Clean Code", "Git", "Testing"],
                "difficulty": "Intermediate",
                "estimated_hours": 8,
                "description": f"Build and deploy an end-to-end practical solution demonstrating your readiness for {target_career} roles.",
                "deliverables": ["Public GitHub repository", "Comprehensive README with setup instructions", "Automated test suite"]
            })

        return projects
