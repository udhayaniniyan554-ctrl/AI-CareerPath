import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class ProgressTrackingAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Progress Tracking Agent", role="Monitors student progress, assessment mastery, and triggers adaptive roadmap adjustments")

    def track_task_completion(self, user_id: int, task_id: int, is_completed: bool) -> Dict[str, Any]:
        start_time = time.time()
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Update task
            cursor.execute("""
                UPDATE roadmap_tasks 
                SET is_completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
                WHERE id = ?
            """, (1 if is_completed else 0, 1 if is_completed else 0, task_id))
            
            # Fetch roadmap ID
            cursor.execute("SELECT roadmap_id FROM roadmap_tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            if not row:
                return {"error": "Task not found"}
            roadmap_id = row["roadmap_id"]

            # Recalculate completion percentage
            cursor.execute("SELECT COUNT(*) as total, SUM(is_completed) as completed FROM roadmap_tasks WHERE roadmap_id = ?", (roadmap_id,))
            counts = cursor.fetchone()
            total = counts["total"] or 1
            completed = counts["completed"] or 0
            pct = round((completed / total) * 100, 1)

            cursor.execute("UPDATE learning_roadmaps SET completion_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (pct, roadmap_id))

            # Record overall progress metric
            cursor.execute("""
                INSERT INTO student_progress (user_id, metric_key, metric_value, notes)
                VALUES (?, 'roadmap_completion_percentage', ?, 'Updated after task toggled')
            """, (user_id, pct))

        summary = f"Updated Task #{task_id} status to {'Completed' if is_completed else 'Pending'}. Roadmap progress is now {pct}% ({completed}/{total} tasks)."
        latency_ms = int((time.time() - start_time) * 1000)

        result = {
            "task_id": task_id,
            "roadmap_id": roadmap_id,
            "is_completed": is_completed,
            "total_tasks": total,
            "completed_tasks": completed,
            "completion_percentage": pct,
            "summary": summary
        }

        self.log_activity(
            user_id=user_id,
            task_name="Roadmap Progress Tracking",
            input_summary=f"Task #{task_id} toggled to {is_completed}",
            output_summary=summary,
            details=result,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return result

    def process_assessment_result(
        self,
        user_id: int,
        assessment_id: int,
        score: int,
        total_questions: int,
        correct_count: int,
        passed: bool,
        strengths: List[str],
        weaknesses: List[str]
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        adaptive_actions = []
        roadmap_updated = False

        with get_db() as conn:
            cursor = conn.cursor()
            
            # Fetch assessment details
            cursor.execute("SELECT title, skill_target, category FROM assessments WHERE id = ?", (assessment_id,))
            asm = cursor.fetchone() or {"title": "Quiz", "skill_target": "General", "category": "General"}
            target_skill = asm["skill_target"]

            # 1. Adapt student skill record
            if score >= 80:
                prof = "Advanced"
                verified = 1
                adaptive_actions.append(f"Promoted '{target_skill}' proficiency to Advanced (Score: {score}%). Verified badge granted.")
            elif score >= 55:
                prof = "Intermediate"
                verified = 1
                adaptive_actions.append(f"Updated '{target_skill}' proficiency to Intermediate (Score: {score}%).")
            else:
                prof = "Beginner"
                verified = 0
                adaptive_actions.append(f"Flagged '{target_skill}' for targeted remediation. Need revision (Score: {score}%).")

            cursor.execute("""
                INSERT INTO student_skills (user_id, skill_name, proficiency, score, verified, source, updated_at)
                VALUES (?, ?, ?, ?, ?, 'assessment', CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, skill_name) DO UPDATE SET
                    proficiency = excluded.proficiency,
                    score = excluded.score,
                    verified = excluded.verified,
                    source = 'assessment',
                    updated_at = CURRENT_TIMESTAMP
            """, (user_id, target_skill, prof, score, verified))

            # 2. ADAPTIVE ROADMAP INTERVENTION
            # If student performed poorly (< 70%), insert remedial milestone task into their active roadmap!
            if score < 70:
                cursor.execute("SELECT id FROM learning_roadmaps WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1", (user_id,))
                active_roadmap = cursor.fetchone()
                if active_roadmap:
                    roadmap_id = active_roadmap["id"]
                    remedial_title = f"Remediation Lab: Focused Mastery on {target_skill}"
                    remedial_desc = (
                        f"Adaptive Agent Intervention: Recent assessment on '{asm['title']}' revealed gaps in {', '.join(weaknesses) if weaknesses else target_skill}. "
                        f"Review core principles, inspect debug patterns, and complete remediation drills before advancing."
                    )
                    objectives = [
                        f"Revisit key syntax and edge cases of {target_skill}",
                        "Analyze incorrect assessment concepts and resolve root misconceptions",
                        "Complete the reinforcement drill and retake assessment"
                    ]
                    exercises = [
                        f"Build a standalone diagnostic sandbox isolating {target_skill}",
                        "Write unit tests verifying correct output on common edge cases"
                    ]
                    
                    cursor.execute("""
                        INSERT INTO roadmap_tasks 
                        (roadmap_id, stage_order, stage_title, task_title, description, learning_objectives, required_skills, practical_exercises, is_completed, assessment_milestone)
                        VALUES (?, 99, 'Adaptive Remediation Checkpoint', ?, ?, ?, ?, ?, 0, 'Retake Assessment (Score >= 75%)')
                    """, (
                        roadmap_id,
                        remedial_title,
                        remedial_desc,
                        json.dumps(objectives),
                        json.dumps([target_skill]),
                        json.dumps(exercises)
                    ))
                    roadmap_updated = True
                    adaptive_actions.append(f"Dynamically inserted remedial module into active roadmap for '{target_skill}'.")

            # 3. Calculate Overall Readiness Index
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_skills,
                    SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_skills,
                    AVG(score) as avg_score
                FROM student_skills WHERE user_id = ?
            """, (user_id,))
            skill_stats = cursor.fetchone()
            
            tot_s = skill_stats["total_skills"] or 1
            ver_s = skill_stats["verified_skills"] or 0
            avg_sc = skill_stats["avg_score"] or 50.0

            # Calculate readiness index
            readiness_score = round(min(100.0, ((ver_s / max(1, tot_s)) * 40.0) + (avg_sc * 0.4) + (score * 0.2)), 1)

            cursor.execute("""
                INSERT INTO student_progress (user_id, metric_key, metric_value, notes)
                VALUES (?, 'career_readiness_index', ?, ?)
            """, (user_id, readiness_score, f"Assessment #{assessment_id} processed with score {score}%"))

        summary = (
            f"Processed assessment #{assessment_id} ('{asm['title']}'). Score: {score}%. "
            f"{'PASSED' if passed else 'NEEDS REVISION'}. "
            f"Adaptive interventions executed: {len(adaptive_actions)}."
        )

        result = {
            "assessment_id": assessment_id,
            "title": asm["title"],
            "score": score,
            "passed": passed,
            "proficiency_assigned": prof,
            "verified": verified,
            "adaptive_actions": adaptive_actions,
            "roadmap_updated": roadmap_updated,
            "overall_readiness_score": readiness_score,
            "summary": summary
        }

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="Assessment Progress & Adaptive Adjustment",
            input_summary=f"Assessment #{assessment_id} | Score: {score}%",
            output_summary=summary,
            details=result,
            latency_ms=latency_ms,
            status="REVISED" if roadmap_updated else "SUCCESS"
        )

        return result
