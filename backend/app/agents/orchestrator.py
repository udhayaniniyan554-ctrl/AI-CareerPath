import time
import json
from typing import Dict, Any, List, Optional
from app.agents.skill_analysis_agent import SkillAnalysisAgent
from app.agents.career_matching_agent import CareerMatchingAgent
from app.agents.learning_roadmap_agent import LearningRoadmapAgent
from app.agents.learning_recommendation_agent import LearningRecommendationAgent
from app.agents.progress_tracking_agent import ProgressTrackingAgent
from app.agents.ai_mentor_agent import AIMentorAgent
from app.database import get_db

class AgentOrchestrator:
    def __init__(self):
        self.skill_agent = SkillAnalysisAgent()
        self.career_agent = CareerMatchingAgent()
        self.roadmap_agent = LearningRoadmapAgent()
        self.recommendation_agent = LearningRecommendationAgent()
        self.progress_agent = ProgressTrackingAgent()
        self.mentor_agent = AIMentorAgent()

    def run_full_pipeline(self, user_id: int, target_career_override: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes the coordinated Multi-Agent workflow:
        Student Profile 
        -> 1. Skill Analysis Agent 
        -> 2. Career Matching Agent 
        -> 3. Learning Roadmap Agent 
        -> 4. Learning Recommendation Agent 
        -> 5. Progress Tracking Agent Sync 
        -> 6. AI Mentor Guidance
        """
        pipeline_start = time.time()
        pipeline_steps = []

        # Step 0: Ingest Student Profile & Skills
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone() or {}
            
            cursor.execute("SELECT * FROM student_skills WHERE user_id = ?", (user_id,))
            user_skills = cursor.fetchall() or []

            cursor.execute("""
                SELECT ar.*, a.title, a.skill_target, a.category 
                FROM assessment_results ar
                JOIN assessments a ON ar.assessment_id = a.id
                WHERE ar.user_id = ?
            """, (user_id,))
            quiz_results = cursor.fetchall() or []

        target_career = target_career_override or profile.get("target_career") or "Full Stack Developer"

        # Update target career in profile if provided
        if target_career_override and target_career_override != profile.get("target_career"):
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE student_profiles SET target_career = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", (target_career, user_id))

        # ----------------------------------------------------------------------
        # Agent 1: Skill Analysis Agent
        # ----------------------------------------------------------------------
        t0 = time.time()
        skill_analysis_result = self.skill_agent.analyze(
            user_id=user_id,
            target_career=target_career,
            user_skills=user_skills,
            quiz_results=quiz_results
        )
        pipeline_steps.append({
            "step_order": 1,
            "agent": self.skill_agent.name,
            "role": self.skill_agent.role,
            "task": "Skill Proficiency & Gap Analysis",
            "input_received": f"Ingested {len(user_skills)} self-reported skills & {len(quiz_results)} assessment results",
            "output_produced": f"Calculated {skill_analysis_result['gap_percentage']}% Skill Gap. Missing: {len(skill_analysis_result['missing_skills'])} critical skills.",
            "latency_ms": int((time.time() - t0) * 1000),
            "handoff_to": "Career Matching Agent",
            "status": "COMPLETED"
        })

        # ----------------------------------------------------------------------
        # Agent 2: Career Matching Agent
        # ----------------------------------------------------------------------
        t0 = time.time()
        career_matching_result = self.career_agent.match_career(
            user_id=user_id,
            target_career=target_career,
            user_skills=user_skills,
            skill_analysis=skill_analysis_result
        )
        pipeline_steps.append({
            "step_order": 2,
            "agent": self.career_agent.name,
            "role": self.career_agent.role,
            "task": "Role Requirements & Competency Matching",
            "input_received": f"Received skill gap profile from Skill Analysis Agent for '{target_career}'",
            "output_produced": f"Match Score: {career_matching_result['target_match_percentage']}%. Analyzed against {len(career_matching_result['all_careers'])} industry roles.",
            "latency_ms": int((time.time() - t0) * 1000),
            "handoff_to": "Learning Roadmap Agent",
            "status": "COMPLETED"
        })

        # ----------------------------------------------------------------------
        # Agent 3: Learning Roadmap Agent
        # ----------------------------------------------------------------------
        t0 = time.time()
        roadmap_result = self.roadmap_agent.generate_roadmap(
            user_id=user_id,
            target_career=target_career,
            skill_analysis=skill_analysis_result,
            career_match=career_matching_result
        )
        pipeline_steps.append({
            "step_order": 3,
            "agent": self.roadmap_agent.name,
            "role": self.roadmap_agent.role,
            "task": "Adaptive Milestone & Curriculum Synthesis",
            "input_received": f"Received missing skills & target match profile from Career Matching Agent",
            "output_produced": f"Generated {roadmap_result['total_stages']} progressive learning stages with practical exercises & assessment checkpoints.",
            "latency_ms": int((time.time() - t0) * 1000),
            "handoff_to": "Learning Recommendation Agent",
            "status": "COMPLETED"
        })

        # ----------------------------------------------------------------------
        # Agent 4: Learning Recommendation Agent
        # ----------------------------------------------------------------------
        t0 = time.time()
        recommendation_result = self.recommendation_agent.recommend(
            user_id=user_id,
            target_career=target_career,
            missing_skills=skill_analysis_result.get("missing_skills", []),
            active_stage_title=roadmap_result["stages"][0]["stage_title"] if roadmap_result["stages"] else ""
        )
        pipeline_steps.append({
            "step_order": 4,
            "agent": self.recommendation_agent.name,
            "role": self.recommendation_agent.role,
            "task": "Curate Real Learning Assets & Mini-Projects",
            "input_received": f"Received {len(skill_analysis_result.get('missing_skills', []))} missing skill targets from Roadmap Agent",
            "output_produced": f"Curated {len(recommendation_result['recommended_courses'])} courses, {len(recommendation_result['recommended_docs'])} docs, & {len(recommendation_result['mini_projects'])} mini-projects.",
            "latency_ms": int((time.time() - t0) * 1000),
            "handoff_to": "AI Mentor Agent",
            "status": "COMPLETED"
        })

        # ----------------------------------------------------------------------
        # Agent 5: AI Mentor Initial Guidance Briefing
        # ----------------------------------------------------------------------
        t0 = time.time()
        mentor_brief = self.mentor_agent.chat(
            user_id=user_id,
            message="Please provide my initial roadmap walkthrough and priorities for this career track.",
            context_topic=f"Roadmap Launch for {target_career}"
        )
        pipeline_steps.append({
            "step_order": 5,
            "agent": self.mentor_agent.name,
            "role": self.mentor_agent.role,
            "task": "Personalized 1-on-1 Onboarding Coaching",
            "input_received": "Received comprehensive roadmap, gaps, and recommendations from previous agents",
            "output_produced": f"Prepared personalized mentoring brief with {len(mentor_brief.get('action_items', []))} priority action items.",
            "latency_ms": int((time.time() - t0) * 1000),
            "handoff_to": "Student Dashboard & Progress Tracker",
            "status": "COMPLETED"
        })

        total_latency_ms = int((time.time() - pipeline_start) * 1000)

        # Log overarching orchestration event
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO agent_activity_logs 
                (user_id, agent_name, task_name, input_summary, output_summary, details_json, latency_ms, status)
                VALUES (?, 'Central Orchestrator', 'Full Pipeline Coordinated Execution', ?, ?, ?, ?, 'SUCCESS')
            """, (
                user_id,
                f"Multi-Agent pipeline triggered for {target_career}",
                f"Completed 5 agents in sequence across {total_latency_ms}ms",
                json.dumps({"pipeline_steps": pipeline_steps}),
                total_latency_ms
            ))

        return {
            "target_career": target_career,
            "total_latency_ms": total_latency_ms,
            "pipeline_steps": pipeline_steps,
            "skill_analysis": skill_analysis_result,
            "career_matching": career_matching_result,
            "roadmap": roadmap_result,
            "recommendations": recommendation_result,
            "mentor_brief": mentor_brief
        }

    def get_activity_feed(self, user_id: Optional[int] = None, limit: int = 50) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("""
                    SELECT id, agent_name, task_name, input_summary, output_summary, latency_ms, status, created_at, details_json
                    FROM agent_activity_logs
                    WHERE user_id = ? OR user_id IS NULL
                    ORDER BY id DESC LIMIT ?
                """, (user_id, limit))
            else:
                cursor.execute("""
                    SELECT id, agent_name, task_name, input_summary, output_summary, latency_ms, status, created_at, details_json
                    FROM agent_activity_logs
                    ORDER BY id DESC LIMIT ?
                """, (limit,))
            
            rows = cursor.fetchall()
            for r in rows:
                if r.get("details_json"):
                    try:
                        r["details"] = json.loads(r["details_json"])
                    except Exception:
                        r["details"] = {}
            return rows

# Singleton instance
orchestrator = AgentOrchestrator()
