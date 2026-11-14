import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.auth import get_current_user
from app.schemas import StudentProfileUpdate, StudentProfileResponse, StudentSkillCreate
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/profile", tags=["Student Profile"])

@router.get("", response_model=Dict[str, Any])
def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone()

        if not profile:
            # Create if missing
            cursor.execute("""
                INSERT INTO student_profiles (user_id, target_career, experience_level, technical_skills, soft_skills, certifications, projects, career_interests, bio)
                VALUES (?, 'Full Stack Developer', 'Beginner', '[]', '[]', '[]', '[]', '[]', '')
            """, (user_id,))
            cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()

        cursor.execute("SELECT * FROM student_skills WHERE user_id = ? ORDER BY verified DESC, score DESC", (user_id,))
        skills = cursor.fetchall()

    return {
        "user": current_user,
        "profile": {
            "id": profile["id"],
            "user_id": profile["user_id"],
            "education": profile.get("education"),
            "college": profile.get("college"),
            "department": profile.get("department"),
            "current_year": profile.get("current_year"),
            "technical_skills": json.loads(profile.get("technical_skills") or "[]"),
            "soft_skills": json.loads(profile.get("soft_skills") or "[]"),
            "certifications": json.loads(profile.get("certifications") or "[]"),
            "projects": json.loads(profile.get("projects") or "[]"),
            "career_interests": json.loads(profile.get("career_interests") or "[]"),
            "target_career": profile.get("target_career") or "Full Stack Developer",
            "experience_level": profile.get("experience_level") or "Beginner",
            "bio": profile.get("bio") or "",
            "updated_at": str(profile.get("updated_at"))
        },
        "skills": skills
    }

@router.put("", response_model=Dict[str, Any])
def update_profile(data: StudentProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT target_career FROM student_profiles WHERE user_id = ?", (user_id,))
        existing_profile = cursor.fetchone()
        previous_target_career = existing_profile.get("target_career") if existing_profile else None

        cursor.execute("""
            UPDATE student_profiles SET
                education = COALESCE(?, education),
                college = COALESCE(?, college),
                department = COALESCE(?, department),
                current_year = COALESCE(?, current_year),
                technical_skills = ?,
                soft_skills = ?,
                certifications = ?,
                projects = ?,
                career_interests = ?,
                target_career = COALESCE(?, target_career),
                experience_level = COALESCE(?, experience_level),
                bio = COALESCE(?, bio),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        """, (
            data.education,
            data.college,
            data.department,
            data.current_year,
            json.dumps(data.technical_skills or []),
            json.dumps(data.soft_skills or []),
            json.dumps(data.certifications or []),
            json.dumps(data.projects or []),
            json.dumps(data.career_interests or []),
            data.target_career,
            data.experience_level,
            data.bio,
            user_id
        ))

        # Also sync technical_skills to student_skills table
        if data.technical_skills:
            for sk_name in data.technical_skills:
                cursor.execute("""
                    INSERT INTO student_skills (user_id, skill_name, proficiency, score, verified, source)
                    VALUES (?, ?, ?, 50, 0, 'self_reported')
                    ON CONFLICT(user_id, skill_name) DO NOTHING
                """, (user_id, sk_name.strip(), data.experience_level or 'Beginner'))

    # If career goal changed or requested, recalculate multi-agent pipeline
    if data.target_career and data.target_career != previous_target_career:
        try:
            orchestrator.run_full_pipeline(user_id=user_id, target_career_override=data.target_career)
        except Exception as e:
            print(f"Agent pipeline recalculation warning: {e}")

    return {"message": "Profile updated successfully", "target_career_recalculated": data.target_career != previous_target_career}

@router.post("/skills")
def add_skill(skill: StudentSkillCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    name = skill.skill_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Skill name is required.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO student_skills (user_id, skill_name, proficiency, score, verified, source)
            VALUES (?, ?, ?, 50, 0, 'self_reported')
            ON CONFLICT(user_id, skill_name) DO UPDATE SET
                proficiency = excluded.proficiency,
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, name, skill.proficiency))

        # Sync to profile technical_skills
        cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        tech_skills = json.loads(row["technical_skills"] or "[]") if row else []
        if name not in tech_skills:
            tech_skills.append(name)
            cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

    return {"message": f"Skill '{name}' added successfully"}

@router.delete("/skills/{skill_name}")
def delete_skill(skill_name: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM student_skills WHERE user_id = ? AND skill_name = ?", (user_id, skill_name))
        
        cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        tech_skills = json.loads(row["technical_skills"] or "[]") if row else []
        tech_skills = [s for s in tech_skills if s.lower() != skill_name.lower()]
        cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

    return {"message": f"Skill '{skill_name}' removed"}
