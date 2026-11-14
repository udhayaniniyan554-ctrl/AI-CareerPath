import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.auth import get_current_user
from app.schemas import AssessmentSubmission
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/assessments", tags=["Assessment Module"])

@router.get("", response_model=List[Dict[str, Any]])
def list_assessments(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments ORDER BY id ASC")
        assessments = cursor.fetchall()
        
        # Check user's best score for each
        cursor.execute("SELECT assessment_id, MAX(score) as best_score, MAX(passed) as has_passed FROM assessment_results WHERE user_id = ? GROUP BY assessment_id", (current_user["id"],))
        user_scores = {row["assessment_id"]: row for row in cursor.fetchall()}

    results = []
    for a in assessments:
        user_record = user_scores.get(a["id"], {})
        results.append({
            "id": a["id"],
            "title": a["title"],
            "category": a["category"],
            "skill_target": a["skill_target"],
            "difficulty": a["difficulty"],
            "duration_minutes": a["duration_minutes"],
            "pass_score": a["pass_score"],
            "description": a["description"],
            "user_best_score": user_record.get("best_score"),
            "user_has_passed": bool(user_record.get("has_passed", 0))
        })
    return results

@router.get("/{assessment_id}", response_model=Dict[str, Any])
def get_assessment(assessment_id: int, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
        asm = cursor.fetchone()
        if not asm:
            raise HTTPException(status_code=404, detail="Assessment not found.")

        cursor.execute("""
            SELECT id, question_text, options, skill_tested 
            FROM assessment_questions 
            WHERE assessment_id = ? 
            ORDER BY id ASC
        """, (assessment_id,))
        raw_questions = cursor.fetchall()

    questions = []
    for q in raw_questions:
        questions.append({
            "id": q["id"],
            "question_text": q["question_text"],
            "options": json.loads(q["options"]),
            "skill_tested": q["skill_tested"]
        })

    return {
        "id": asm["id"],
        "title": asm["title"],
        "category": asm["category"],
        "skill_target": asm["skill_target"],
        "difficulty": asm["difficulty"],
        "duration_minutes": asm["duration_minutes"],
        "pass_score": asm["pass_score"],
        "description": asm["description"],
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/{assessment_id}/submit", response_model=Dict[str, Any])
def submit_assessment(assessment_id: int, submission: AssessmentSubmission, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,))
        asm = cursor.fetchone()
        if not asm:
            raise HTTPException(status_code=404, detail="Assessment not found.")

        cursor.execute("SELECT * FROM assessment_questions WHERE assessment_id = ?", (assessment_id,))
        questions = {q["id"]: q for q in cursor.fetchall()}

    if not questions:
        raise HTTPException(status_code=400, detail="This assessment has no questions configured.")

    correct_count = 0
    total_questions = len(questions)
    answers_evaluation = []
    strengths = []
    weaknesses = []

    for ans in submission.answers:
        q_id = ans.question_id
        selected_idx = ans.selected_option_index
        q = questions.get(q_id)
        if not q:
            continue

        options = json.loads(q["options"])
        correct_idx = q["correct_option_index"]
        is_correct = (selected_idx == correct_idx)

        if is_correct:
            correct_count += 1
            if q.get("skill_tested"):
                strengths.append(q["skill_tested"])
        else:
            if q.get("skill_tested"):
                weaknesses.append(q["skill_tested"])

        answers_evaluation.append({
            "question_id": q_id,
            "question_text": q["question_text"],
            "selected_option_index": selected_idx,
            "correct_option_index": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation"),
            "skill_tested": q.get("skill_tested")
        })

    score_pct = int(round((correct_count / max(1, total_questions)) * 100))
    passed = (score_pct >= asm["pass_score"])

    # 1. Trigger Progress Tracking Agent for adaptive interventions
    progress_result = orchestrator.progress_agent.process_assessment_result(
        user_id=user_id,
        assessment_id=assessment_id,
        score=score_pct,
        total_questions=total_questions,
        correct_count=correct_count,
        passed=passed,
        strengths=list(set(strengths)),
        weaknesses=list(set(weaknesses))
    )

    # 2. Record assessment result in DB
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assessment_results 
            (user_id, assessment_id, score, total_questions, correct_count, passed, answers_detail, strengths, weaknesses)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            assessment_id,
            score_pct,
            total_questions,
            correct_count,
            1 if passed else 0,
            json.dumps(answers_evaluation),
            json.dumps(list(set(strengths))),
            json.dumps(list(set(weaknesses)))
        ))
        result_id = cursor.lastrowid

    return {
        "result_id": result_id,
        "assessment_id": assessment_id,
        "title": asm["title"],
        "score": score_pct,
        "pass_score": asm["pass_score"],
        "passed": passed,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "strengths": list(set(strengths)),
        "weaknesses": list(set(weaknesses)),
        "answers_evaluation": answers_evaluation,
        "adaptive_actions": progress_result.get("adaptive_actions", []),
        "roadmap_updated": progress_result.get("roadmap_updated", False),
        "overall_readiness_score": progress_result.get("overall_readiness_score")
    }

@router.get("/history/all", response_model=List[Dict[str, Any]])
def get_assessment_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ar.*, a.title, a.category, a.skill_target, a.pass_score
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.user_id = ?
            ORDER BY ar.created_at DESC
        """, (user_id,))
        records = cursor.fetchall()

    formatted = []
    for r in records:
        rd = dict(r)
        rd["strengths"] = json.loads(r.get("strengths") or "[]")
        rd["weaknesses"] = json.loads(r.get("weaknesses") or "[]")
        formatted.append(rd)
    return formatted
