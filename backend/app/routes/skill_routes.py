import json
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/skills", tags=["User Skills & Competency"])

# --- Request / Response Schemas ---

class SkillCatalogItem(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None

class AddUserSkillRequest(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100, description="Name of the technical skill")
    proficiency_percentage: int = Field(default=50, ge=0, le=100, description="Proficiency percentage from 0 to 100")
    category: Optional[str] = Field(default="Technical", description="Skill category")

class UpdateUserSkillRequest(BaseModel):
    proficiency_percentage: int = Field(..., ge=0, le=100, description="Updated proficiency percentage from 0 to 100")

class BatchUserSkillsRequest(BaseModel):
    skills: List[AddUserSkillRequest]

def derive_proficiency_level(pct: int) -> str:
    if pct >= 80:
        return "Advanced"
    elif pct >= 45:
        return "Intermediate"
    return "Beginner"

# --- Endpoints ---

@router.get("/catalog", response_model=List[Dict[str, Any]])
def get_skills_catalog(
    search: Optional[str] = Query(None, description="Search keyword for skill name"),
    category: Optional[str] = Query(None, description="Filter by skill category"),
    limit: int = Query(60, ge=1, le=150)
):
    """
    Search and retrieve available skills from the industry catalog.
    Publicly accessible to allow autocomplete on registration and skill selection.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT id, name, category, description FROM skills WHERE 1=1"
        params = []

        if search and search.strip():
            query += " AND name LIKE ?"
            params.append(f"%{search.strip()}%")

        if category and category.strip():
            query += " AND category = ?"
            params.append(category.strip())

        query += " ORDER BY category ASC, name ASC LIMIT ?"
        params.append(limit)

        cursor.execute(query, tuple(params))
        items = cursor.fetchall()
        return [dict(i) for i in items]

@router.get("/categories", response_model=List[str])
def get_skill_categories():
    """Get all unique categories in the catalog."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category ASC")
        rows = cursor.fetchall()
        return [r["category"] for r in rows if r["category"]]

@router.get("/user", response_model=List[Dict[str, Any]])
def get_user_skills(current_user: dict = Depends(get_current_user)):
    """
    Get all technical skills for the currently authenticated user.
    Strictly isolated: returns ONLY records belonging to current_user['id'].
    """
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                ss.id,
                ss.user_id,
                ss.skill_id,
                ss.skill_name,
                COALESCE(ss.proficiency_percentage, ss.score, 50) as proficiency_percentage,
                ss.proficiency,
                COALESCE(ss.score, ss.proficiency_percentage, 50) as score,
                COALESCE(ss.category, s.category, 'Technical') as category,
                ss.verified,
                ss.source,
                ss.updated_at
            FROM student_skills ss
            LEFT JOIN skills s ON ss.skill_id = s.id OR LOWER(ss.skill_name) = LOWER(s.name)
            WHERE ss.user_id = ?
            ORDER BY COALESCE(ss.proficiency_percentage, ss.score, 50) DESC, ss.skill_name ASC
        """, (user_id,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("/user", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
def add_user_skill(payload: AddUserSkillRequest, current_user: dict = Depends(get_current_user)):
    """
    Add or update a skill for the authenticated user with an explicit 0-100% proficiency.
    Enforces user isolation, catalog lookup, and profile sync.
    """
    user_id = current_user["id"]
    raw_name = payload.skill_name.strip()
    if not raw_name:
        raise HTTPException(status_code=400, detail="Skill name cannot be empty.")

    pct = max(0, min(100, payload.proficiency_percentage))
    prof_level = derive_proficiency_level(pct)

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Check if skill exists in catalog to link skill_id and category
        cursor.execute("SELECT id, name, category FROM skills WHERE LOWER(name) = LOWER(?)", (raw_name,))
        catalog_item = cursor.fetchone()
        
        if catalog_item:
            skill_id = catalog_item["id"]
            clean_name = catalog_item["name"]
            category = catalog_item["category"] or payload.category or "Technical"
        else:
            # Insert into catalog so it is discoverable
            clean_name = raw_name
            category = payload.category or "Technical"
            try:
                cursor.execute(
                    "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
                    (clean_name, category, f"Technical competency in {clean_name}")
                )
                skill_id = cursor.lastrowid
            except Exception:
                cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (clean_name,))
                ex = cursor.fetchone()
                skill_id = ex["id"] if ex else None

        # 2. Insert or update into student_skills for THIS user
        cursor.execute("""
            INSERT INTO student_skills (
                user_id, skill_id, skill_name, proficiency_percentage, score, proficiency, category, verified, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'self_reported')
            ON CONFLICT(user_id, skill_name) DO UPDATE SET
                skill_id = COALESCE(excluded.skill_id, student_skills.skill_id),
                proficiency_percentage = excluded.proficiency_percentage,
                score = excluded.proficiency_percentage,
                proficiency = excluded.proficiency,
                category = COALESCE(excluded.category, student_skills.category),
                updated_at = CURRENT_TIMESTAMP
        """, (user_id, skill_id, clean_name, pct, pct, prof_level, category))

        # 3. Synchronize with student_profiles technical_skills JSON
        cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
        p_row = cursor.fetchone()
        tech_skills = json.loads(p_row["technical_skills"] or "[]") if p_row else []
        if not any(s.lower() == clean_name.lower() for s in tech_skills):
            tech_skills.append(clean_name)
            cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

        # Retrieve freshly saved record
        cursor.execute("""
            SELECT id, user_id, skill_id, skill_name, proficiency_percentage, proficiency, score, category, verified, source, updated_at
            FROM student_skills
            WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)
        """, (user_id, clean_name))
        saved = cursor.fetchone()

    return {
        "message": f"Skill '{clean_name}' saved successfully with {pct}% proficiency.",
        "skill": dict(saved) if saved else None
    }

@router.put("/user/{skill_identifier}", response_model=Dict[str, Any])
def update_user_skill_proficiency(
    skill_identifier: str,
    payload: UpdateUserSkillRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the proficiency percentage (0-100%) of a user's skill.
    Identified by skill ID or skill name.
    Strictly verifies ownership: users can only modify their own skills.
    """
    user_id = current_user["id"]
    pct = max(0, min(100, payload.proficiency_percentage))
    prof_level = derive_proficiency_level(pct)

    with get_db() as conn:
        cursor = conn.cursor()

        # Check if skill exists and belongs to this user
        if skill_identifier.isdigit():
            cursor.execute("SELECT * FROM student_skills WHERE user_id = ? AND id = ?", (user_id, int(skill_identifier)))
        else:
            cursor.execute("SELECT * FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)", (user_id, skill_identifier.strip()))

        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_identifier}' was not found in your profile or does not belong to you."
            )

        skill_id_rec = existing["id"]
        skill_name_rec = existing["skill_name"]

        cursor.execute("""
            UPDATE student_skills SET
                proficiency_percentage = ?,
                score = ?,
                proficiency = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND id = ?
        """, (pct, pct, prof_level, user_id, skill_id_rec))

        cursor.execute("SELECT * FROM student_skills WHERE id = ?", (skill_id_rec,))
        updated = cursor.fetchone()

    return {
        "message": f"Proficiency for '{skill_name_rec}' updated to {pct}%.",
        "skill": dict(updated)
    }

@router.delete("/user/{skill_identifier}", response_model=Dict[str, Any])
def delete_user_skill(
    skill_identifier: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a skill from the authenticated user's profile.
    Strictly verifies ownership: users can only delete their own skills.
    """
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # Find skill for this user
        if skill_identifier.isdigit():
            cursor.execute("SELECT id, skill_name FROM student_skills WHERE user_id = ? AND id = ?", (user_id, int(skill_identifier)))
        else:
            cursor.execute("SELECT id, skill_name FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)", (user_id, skill_identifier.strip()))

        record = cursor.fetchone()
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_identifier}' does not exist in your skill profile."
            )

        del_id = record["id"]
        del_name = record["skill_name"]

        cursor.execute("DELETE FROM student_skills WHERE user_id = ? AND id = ?", (user_id, del_id))

        # Sync profile technical_skills
        cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
        p_row = cursor.fetchone()
        if p_row:
            tech_skills = json.loads(p_row["technical_skills"] or "[]")
            tech_skills = [s for s in tech_skills if s.lower() != del_name.lower()]
            cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

    return {
        "message": f"Skill '{del_name}' removed from your profile successfully.",
        "deleted_skill_name": del_name,
        "deleted_id": del_id
    }

@router.post("/user/batch", response_model=Dict[str, Any])
def add_user_skills_batch(
    payload: BatchUserSkillsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add multiple skills with percentages at once."""
    user_id = current_user["id"]
    added_count = 0

    with get_db() as conn:
        cursor = conn.cursor()
        for item in payload.skills:
            clean_name = item.skill_name.strip()
            if not clean_name:
                continue
            pct = max(0, min(100, item.proficiency_percentage))
            prof = derive_proficiency_level(pct)

            cursor.execute("SELECT id, category FROM skills WHERE LOWER(name) = LOWER(?)", (clean_name,))
            cat_row = cursor.fetchone()
            sk_id = cat_row["id"] if cat_row else None
            cat = cat_row["category"] if cat_row else (item.category or "Technical")

            cursor.execute("""
                INSERT INTO student_skills (
                    user_id, skill_id, skill_name, proficiency_percentage, score, proficiency, category, verified, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'self_reported')
                ON CONFLICT(user_id, skill_name) DO UPDATE SET
                    proficiency_percentage = excluded.proficiency_percentage,
                    score = excluded.proficiency_percentage,
                    proficiency = excluded.proficiency,
                    category = COALESCE(excluded.category, student_skills.category),
                    updated_at = CURRENT_TIMESTAMP
            """, (user_id, sk_id, clean_name, pct, pct, prof, cat))
            added_count += 1

        # Resync profile technical_skills list
        cursor.execute("SELECT skill_name FROM student_skills WHERE user_id = ?", (user_id,))
        all_user_skills = [r["skill_name"] for r in cursor.fetchall()]
        cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(all_user_skills), user_id))

    return {"message": f"Successfully updated {added_count} skills for your profile."}

@router.get("/analysis", response_model=Dict[str, Any])
def get_user_skill_analysis(current_user: dict = Depends(get_current_user)):
    """
    Generate authentic, user-specific AI skill gap analysis based on:
    1. What skills the user already has (with exact percentages).
    2. What skills are missing for their selected career goal.
    3. What the user should learn next.
    4. Which skills need improvement (proficiency < 60%).
    5. Recommended projects to build those skills.
    """
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Fetch user's profile and target career
        cursor.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone() or {}
        target_career = profile.get("target_career") or "Full Stack Developer"
        education = profile.get("education") or "Undergraduate"
        college = profile.get("college") or "University"

        # 2. Fetch user's actual saved skills
        cursor.execute("""
            SELECT 
                id, skill_name, proficiency_percentage, proficiency, score, category, verified, source
            FROM student_skills
            WHERE user_id = ?
            ORDER BY proficiency_percentage DESC
        """, (user_id,))
        raw_user_skills = cursor.fetchall()

        user_skills = [
            {
                "id": s["id"],
                "skill_name": s["skill_name"],
                "proficiency_percentage": s["proficiency_percentage"] or s["score"] or 50,
                "proficiency": s["proficiency"],
                "category": s["category"] or "Technical",
                "verified": bool(s["verified"])
            }
            for s in raw_user_skills
        ]

        user_skill_map = {s["skill_name"].lower(): s for s in user_skills}

        # 3. Fetch target career required skills
        cursor.execute("SELECT * FROM career_roles WHERE title = ?", (target_career,))
        career_role = cursor.fetchone()

        if career_role:
            req_tech = json.loads(career_role["required_technical_skills"] or "[]")
            req_soft = json.loads(career_role["required_soft_skills"] or "[]")
            required_skills = req_tech + req_soft
            career_desc = career_role["description"]
        else:
            required_skills = ["Python", "JavaScript", "SQL", "Git", "React", "Docker", "Problem Solving"]
            career_desc = f"Professional role in {target_career}"

        # 4. Categorize skills: strong, needs improvement, missing
        strong_skills = []       # >= 70%
        needs_improvement = []   # < 60% that user already has
        competent_skills = []    # 60-69%
        missing_skills = []      # Required for career but not in user's skills

        for req in required_skills:
            req_lower = req.lower()
            if req_lower in user_skill_map:
                sk = user_skill_map[req_lower]
                pct = sk["proficiency_percentage"]
                if pct >= 70:
                    strong_skills.append(sk)
                elif pct >= 60:
                    competent_skills.append(sk)
                else:
                    needs_improvement.append(sk)
            else:
                missing_skills.append(req)

        # Check any other user skills outside required list that need improvement
        req_lowers = [r.lower() for r in required_skills]
        for sk in user_skills:
            if sk["skill_name"].lower() not in req_lowers and sk["proficiency_percentage"] < 60:
                if not any(n["skill_name"].lower() == sk["skill_name"].lower() for n in needs_improvement):
                    needs_improvement.append(sk)

        # 5. Determine what user should learn next (top missing + lowest improvement skills)
        what_to_learn_next = []
        for m in missing_skills[:4]:
            what_to_learn_next.append({
                "skill_name": m,
                "priority": "High (Core Career Requirement)",
                "reason": f"Essential competency for {target_career} not yet in your inventory."
            })
        for imp in needs_improvement[:2]:
            what_to_learn_next.append({
                "skill_name": imp["skill_name"],
                "priority": "Medium (Proficiency Boost)",
                "reason": f"Currently at {imp['proficiency_percentage']}%. Elevate to 70%+ to meet industry benchmark."
            })

        # 6. Recommended hands-on projects tailored to gap skills
        target_focus_skills = [m for m in missing_skills[:3]] + [i["skill_name"] for i in needs_improvement[:2]]
        if not target_focus_skills:
            target_focus_skills = ["Full Stack Integration", "Cloud Deployment", "API Optimization"]

        project_suggestions = [
            {
                "title": f"Production-Grade {target_career} Portfolio Project",
                "description": f"Build an end-to-end application integrating {', '.join(target_focus_skills[:3])} with automated testing and container deployment.",
                "target_skills": target_focus_skills[:3],
                "complexity": "Intermediate / Advanced",
                "estimated_hours": 20
            },
            {
                "title": f"Hands-on Microservice Lab: {target_focus_skills[0] if target_focus_skills else 'API Engineering'}",
                "description": f"Implement a resilient service focusing specifically on {target_focus_skills[0] if target_focus_skills else 'data processing'} with structured error handling and database persistence.",
                "target_skills": target_focus_skills[:2],
                "complexity": "Intermediate",
                "estimated_hours": 12
            }
        ]

        # 7. Metric Calculations
        total_req = len(required_skills)
        matched_count = len(strong_skills) + len(competent_skills) + len(needs_improvement)
        gap_percentage = round((len(missing_skills) / max(1, total_req)) * 100, 1)
        readiness_score = round(max(0.0, 100.0 - gap_percentage), 1)

    return {
        "user_id": user_id,
        "target_career": target_career,
        "education": education,
        "college": college,
        "career_description": career_desc,
        "readiness_score": readiness_score,
        "gap_percentage": gap_percentage,
        "total_required_skills": total_req,
        "matched_skills_count": matched_count,
        "user_skills": user_skills,
        "strong_skills": strong_skills,
        "competent_skills": competent_skills,
        "needs_improvement": needs_improvement,
        "missing_skills": missing_skills,
        "what_to_learn_next": what_to_learn_next,
        "recommended_projects": project_suggestions
    }
