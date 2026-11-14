import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class AIMentorAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="AI Mentor Agent", role="Provides personalized 1-on-1 technical coaching, concept explanations, and roadmap guidance")

    def chat(self, user_id: int, message: str, context_topic: str = "") -> Dict[str, Any]:
        start_time = time.time()

        # 1. Gather comprehensive student context
        with get_db() as conn:
            cursor = conn.cursor()
            
            # User and Profile
            cursor.execute("SELECT email, full_name FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone() or {"full_name": "Learner"}
            
            cursor.execute("SELECT target_career, experience_level, technical_skills, college, department FROM student_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone() or {}
            
            target_career = profile.get("target_career") or "Full Stack Developer"
            exp_level = profile.get("experience_level") or "Beginner"
            skills = json.loads(profile.get("technical_skills") or "[]")

            # Active roadmap and next task
            cursor.execute("""
                SELECT rt.task_title, rt.stage_title, rt.description, rt.learning_objectives 
                FROM roadmap_tasks rt
                JOIN learning_roadmaps lr ON rt.roadmap_id = lr.id
                WHERE lr.user_id = ? AND lr.status = 'active' AND rt.is_completed = 0
                ORDER BY rt.stage_order ASC, rt.id ASC
                LIMIT 1
            """, (user_id,))
            next_task = cursor.fetchone()

            # Recent assessment performance
            cursor.execute("""
                SELECT ar.score, ar.passed, a.title, ar.weaknesses
                FROM assessment_results ar
                JOIN assessments a ON ar.assessment_id = a.id
                WHERE ar.user_id = ?
                ORDER BY ar.id DESC LIMIT 2
            """, (user_id,))
            recent_assessments = cursor.fetchall()

        # 2. Build system instruction
        system_instruction = (
            f"You are the senior AI Engineering Mentor for '{user.get('full_name')}' on the AI CareerPath platform. "
            f"Target Career: {target_career}. Current Experience Level: {exp_level}. "
            f"Current Skills: {', '.join(skills) if skills else 'Just starting'}. "
            f"Current Active Roadmap Task: {next_task['task_title'] if next_task else 'General Preparation'}. "
            f"Recent Assessment History: {json.dumps(recent_assessments)}. "
            f"Tone: Expert, encouraging, rigorous, practical, and concise. "
            f"Provide direct technical answers, clean code snippets where relevant, and clear next steps."
        )

        llm_reply = None
        if self.api_key:
            llm_reply = self.call_llm(
                prompt=f"Student says: {message}\nFocus topic: {context_topic}",
                system_instruction=system_instruction
            )

        # Fallback intelligent contextual response
        if not llm_reply:
            reply_data = self._generate_contextual_reply(
                message=message,
                student_name=user.get("full_name", "Learner"),
                target_career=target_career,
                next_task=next_task,
                recent_assessments=recent_assessments,
                skills=skills
            )
        else:
            reply_data = {
                "reply": llm_reply,
                "action_items": [
                    f"Implement code example discussed for {target_career}",
                    f"Advance your active milestone: '{next_task['task_title'] if next_task else 'Next Roadmap Step'}'",
                    "Take a diagnostic quiz to verify mastery"
                ],
                "recommended_skills": [target_career.split()[0], "Clean Code", "System Design"],
                "suggested_questions": [
                    f"Can you give me a code example for {target_career}?",
                    "What are the most common interview questions for this skill?",
                    "How should I structure my portfolio project?"
                ]
            }

        # 3. Store conversation
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO mentor_conversations (user_id, sender, message, metadata)
                VALUES (?, 'user', ?, ?)
            """, (user_id, message, json.dumps({"topic": context_topic})))
            
            cursor.execute("""
                INSERT INTO mentor_conversations (user_id, sender, message, metadata)
                VALUES (?, 'mentor', ?, ?)
            """, (user_id, reply_data["reply"], json.dumps({
                "action_items": reply_data.get("action_items"),
                "recommended_skills": reply_data.get("recommended_skills")
            })))

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="1-on-1 AI Mentorship Session",
            input_summary=f"User Query: '{message[:60]}...'",
            output_summary=f"Mentor guidance dispatched ({len(reply_data['reply'])} chars)",
            details=reply_data,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return reply_data

    def _generate_contextual_reply(
        self,
        message: str,
        student_name: str,
        target_career: str,
        next_task: Any,
        recent_assessments: List[Any],
        skills: List[str]
    ) -> Dict[str, Any]:
        msg_low = message.lower()
        first_name = student_name.split()[0] if student_name else "there"

        # Topic 1: Greetings or general check-in
        if any(w in msg_low for w in ["hello", "hi", "hey", "help", "start", "guide"]):
            task_mention = f"Your current priority milestone is **{next_task['task_title']}** in *{next_task['stage_title']}*." if next_task else "You have an active roadmap configured!"
            reply = (
                f"Hello {first_name}! Great to see you in the workspace. "
                f"As your dedicated AI Mentor for **{target_career}**, I'm tracking your roadmap progress and assessment results in real time.\n\n"
                f"{task_mention}\n\n"
                f"Here is how we can accelerate your progress today:\n"
                f"1. **Concept Explanations**: Ask me about difficult architectural or algorithmic patterns.\n"
                f"2. **Code Reviews**: Share your snippets for performance and edge-case inspection.\n"
                f"3. **Interview Preparation**: Practice realistic technical interview questions tailored for {target_career}."
            )
            actions = ["Review your active roadmap milestone", "Complete diagnostic quiz in Assessment Center"]
            rec_skills = [target_career.split()[0], "Architecture", "Git"]
            suggested = [
                "What should I study right now?",
                f"How do I prepare for a {target_career} technical interview?",
                "Can you explain async/await vs Promises in JavaScript?"
            ]

        # Topic 2: What to study next / Roadmap guidance
        elif any(w in msg_low for w in ["what to study", "next", "roadmap", "progress", "where to start"]):
            if next_task:
                reply = (
                    f"Based on your skill gap analysis for **{target_career}**, your exact next priority is:\n\n"
                    f"### 🎯 Active Milestone: {next_task['task_title']}\n"
                    f"*{next_task['stage_title']}*\n\n"
                    f"{next_task['description']}\n\n"
                    f"**Key objectives to satisfy before advancing:**\n"
                    + "\n".join([f"- {obj}" for obj in json.loads(next_task.get("learning_objectives") or "[]")])
                    + "\n\nOnce you complete the practical exercises, mark it as completed on your dashboard to unlock the next stage!"
                )
            else:
                reply = (
                    f"You have great momentum! For **{target_career}**, your current focus should be taking an assessment "
                    f"to verify your skill proficiencies or selecting a capstone project from the Learning Library."
                )
            actions = ["Complete the practical exercise for this stage", "Submit verification quiz"]
            rec_skills = ["Full Stack", "System Design", "Testing"]
            suggested = [
                "Show me recommended courses for this stage",
                "Give me a practical exercise to practice right now",
                "Explain the assessment criteria for this milestone"
            ]

        # Topic 3: Weakness / Poor quiz performance advice
        elif any(w in msg_low for w in ["failed", "weak", "quiz", "assessment", "score", "struggling", "hard"]):
            reply = (
                f"Don't worry about challenging assessments—identifying gaps early is the fastest route to true mastery. "
                f"Our Progress Tracking Agent automatically calibrated your roadmap with targeted remediation drills.\n\n"
                f"### 💡 Recovery Strategy:\n"
                f"1. **Isolate the Core Concept**: Build a minimal 10-line script testing solely the concept you missed.\n"
                f"2. **Debug Edge Cases**: Pay close attention to boundary conditions, null/undefined states, and async timing.\n"
                f"3. **Retake Verification**: Once confident, retake the assessment to earn your verified proficiency badge."
            )
            actions = ["Review incorrect questions in Assessment Results", "Read official documentation on missed topic"]
            rec_skills = ["Debugging", "Unit Testing", "Error Handling"]
            suggested = [
                "Explain the most common traps in this assessment",
                "Can you give me 3 practice questions with explanations?",
                "How can I improve my problem solving speed?"
            ]

        # Topic 4: Technical explanation (JavaScript, React, Python, APIs, SQL, etc.)
        elif any(w in msg_low for w in ["javascript", "react", "python", "api", "sql", "explain", "code", "database"]):
            reply = (
                f"Here is a professional breakdown for that topic in the context of modern **{target_career}** engineering:\n\n"
                f"```python\n"
                f"# Production-grade Pattern Example\n"
                f"async def process_pipeline(record: dict) -> dict:\n"
                f"    # 1. Validate payload structure\n"
                f"    if not record.get('id'):\n"
                f"        raise ValueError('Missing primary identifier')\n"
                f"    \n"
                f"    # 2. Execute non-blocking transform\n"
                f"    result = await transform_data(record)\n"
                f"    return {{'status': 'processed', 'data': result}}\n"
                f"```\n\n"
                f"**Key architectural rules to remember:**\n"
                f"- **Separation of Concerns**: Keep business logic independent of transport protocols (HTTP/REST).\n"
                f"- **Defensive Programming**: Always sanitize and validate input boundaries with schemas.\n"
                f"- **Idempotency**: Ensure operations can be repeated safely without side-effects."
            )
            actions = ["Run this snippet locally in your scratchpad", "Write a test case asserting valid vs invalid input"]
            rec_skills = ["Clean Architecture", "API Design", "Error Handling"]
            suggested = [
                "How do I add unit tests to this pattern?",
                "What is the equivalent implementation in TypeScript/Node?",
                "How should this be structured in a production repository?"
            ]

        # Generic response
        else:
            reply = (
                f"I've analyzed your question through the lens of your **{target_career}** career goals. "
                f"To build high hireability, every technical decision should demonstrate strong engineering fundamentals:\n\n"
                f"- Focus on readable, testable, and maintainable implementations.\n"
                f"- Connect each concept back to your active portfolio project.\n"
                f"- Consistently measure your understanding through hands-on coding and milestone assessments.\n\n"
                f"What specific part of this pattern would you like to drill into together?"
            )
            actions = ["Explore recommended documentation in the library", "Take diagnostic assessment"]
            rec_skills = ["Problem Solving", "System Architecture"]
            suggested = [
                f"What are key hiring expectations for a Junior {target_career}?",
                "How do I optimize database queries for speed?",
                "Give me a step-by-step roadmap summary"
            ]

        return {
            "reply": reply,
            "action_items": actions,
            "recommended_skills": rec_skills,
            "suggested_questions": suggested
        }
