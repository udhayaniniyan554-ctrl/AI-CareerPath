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
    skill_name: str = Field(..., min_length=1, max_length=100, description="Name of the technical or custom skill")
    proficiency_percentage: int = Field(default=50, ge=0, le=100, description="Proficiency percentage from 0 to 100")
    category: Optional[str] = Field(default="Technical", description="Skill category")

class UpdateUserSkillRequest(BaseModel):
    skill_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated name of the skill")
    proficiency_percentage: Optional[int] = Field(None, ge=0, le=100, description="Updated proficiency percentage from 0 to 100")
    category: Optional[str] = Field(None, description="Updated category")

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
    Get all custom and catalog technical skills for the currently authenticated user.
    Strictly isolated: returns ONLY records belonging to current_user['id'].
    Never trusts user_id from frontend query/body.
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
                ss.created_at,
                ss.updated_at
            FROM student_skills ss
            LEFT JOIN skills s ON ss.skill_id = s.id OR LOWER(ss.skill_name) = LOWER(s.name)
            WHERE ss.user_id = ?
            ORDER BY ss.id DESC
        """, (user_id,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@router.post("/user", status_code=status.HTTP_201_CREATED, response_model=Dict[str, Any])
def add_user_skill(payload: AddUserSkillRequest, current_user: dict = Depends(get_current_user)):
    """
    Add a manual custom skill or catalog skill for the authenticated user.
    Enforces user isolation, prevents duplicates for the same user, and records created_at timestamp.
    Accepts ANY valid skill name even if absent from predefined catalog.
    """
    user_id = current_user["id"]
    clean_name = payload.skill_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Skill name cannot be empty.")

    pct = max(0, min(100, payload.proficiency_percentage))
    prof_level = derive_proficiency_level(pct)
    category = (payload.category or "Technical").strip()

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Prevent duplicate skills for the same authenticated user
        cursor.execute(
            "SELECT id, skill_name, proficiency_percentage FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)",
            (user_id, clean_name)
        )
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Skill '{existing['skill_name']}' is already in your skills profile (currently at {existing['proficiency_percentage']}%). You can edit its name or percentage instead of adding a duplicate."
            )

        # 2. Check if skill exists in catalog to link skill_id and category
        cursor.execute("SELECT id, name, category FROM skills WHERE LOWER(name) = LOWER(?)", (clean_name,))
        catalog_item = cursor.fetchone()
        
        if catalog_item:
            skill_id = catalog_item["id"]
            if not payload.category or payload.category == "Technical":
                category = catalog_item["category"] or category
        else:
            # Custom skill: insert into skills catalog so it is recognized across the system
            try:
                cursor.execute(
                    "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
                    (clean_name, category, f"Custom skill: {clean_name}")
                )
                skill_id = cursor.lastrowid
            except Exception:
                cursor.execute("SELECT id FROM skills WHERE LOWER(name) = LOWER(?)", (clean_name,))
                ex = cursor.fetchone()
                skill_id = ex["id"] if ex else None

        # 3. Insert into student_skills for THIS authenticated user
        cursor.execute("""
            INSERT INTO student_skills (
                user_id, skill_id, skill_name, proficiency_percentage, score, proficiency, category, verified, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'self_reported', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """, (user_id, skill_id, clean_name, pct, pct, prof_level, category))
        new_record_id = cursor.lastrowid

        # 4. Synchronize with student_profiles technical_skills JSON list
        cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
        p_row = cursor.fetchone()
        tech_skills = json.loads(p_row["technical_skills"] or "[]") if p_row else []
        if not any(s.lower() == clean_name.lower() for s in tech_skills):
            tech_skills.append(clean_name)
            cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

        # Retrieve freshly saved record
        cursor.execute("""
            SELECT id, user_id, skill_id, skill_name, proficiency_percentage, proficiency, score, category, verified, source, created_at, updated_at
            FROM student_skills
            WHERE id = ? AND user_id = ?
        """, (new_record_id, user_id))
        saved = cursor.fetchone()

    return {
        "message": f"Skill '{clean_name}' saved successfully with {pct}% proficiency.",
        "skill": dict(saved) if saved else None
    }

@router.put("/user/{skill_identifier}", response_model=Dict[str, Any])
def update_user_skill(
    skill_identifier: str,
    payload: UpdateUserSkillRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a skill's name and/or proficiency percentage (0-100%).
    Identified by unique skill ID or skill name.
    Strictly verifies user ownership: users can only modify their own skills.
    Prevents duplicate skill names on rename.
    """
    user_id = current_user["id"]

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

        skill_rec_id = existing["id"]
        old_name = existing["skill_name"]
        current_pct = existing["proficiency_percentage"] or existing["score"] or 50

        # Handle skill name change & duplicate prevention
        new_name = old_name
        if payload.skill_name and payload.skill_name.strip():
            candidate_name = payload.skill_name.strip()
            if candidate_name.lower() != old_name.lower():
                cursor.execute(
                    "SELECT id FROM student_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?) AND id != ?",
                    (user_id, candidate_name, skill_rec_id)
                )
                dup = cursor.fetchone()
                if dup:
                    raise HTTPException(
                        status_code=400,
                        detail=f"A skill named '{candidate_name}' already exists in your profile. Duplicate skills are not allowed."
                    )
                new_name = candidate_name

        # Handle percentage change
        new_pct = current_pct
        if payload.proficiency_percentage is not None:
            new_pct = max(0, min(100, payload.proficiency_percentage))

        prof_level = derive_proficiency_level(new_pct)
        new_category = payload.category.strip() if payload.category and payload.category.strip() else existing["category"]

        cursor.execute("""
            UPDATE student_skills SET
                skill_name = ?,
                proficiency_percentage = ?,
                score = ?,
                proficiency = ?,
                category = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND id = ?
        """, (new_name, new_pct, new_pct, prof_level, new_category, user_id, skill_rec_id))

        # Synchronize student_profiles technical_skills JSON if name was modified
        if new_name.lower() != old_name.lower():
            cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
            p_row = cursor.fetchone()
            if p_row:
                tech_skills = json.loads(p_row["technical_skills"] or "[]")
                tech_skills = [new_name if s.lower() == old_name.lower() else s for s in tech_skills]
                if not any(s.lower() == new_name.lower() for s in tech_skills):
                    tech_skills.append(new_name)
                cursor.execute("UPDATE student_profiles SET technical_skills = ? WHERE user_id = ?", (json.dumps(tech_skills), user_id))

        cursor.execute("""
            SELECT id, user_id, skill_id, skill_name, proficiency_percentage, proficiency, score, category, verified, source, created_at, updated_at
            FROM student_skills
            WHERE id = ? AND user_id = ?
        """, (skill_rec_id, user_id))
        updated = cursor.fetchone()

    return {
        "message": f"Skill '{new_name}' updated successfully ({new_pct}% proficiency).",
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
    Synchronizes profile JSON list.
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
        "message": f"Skill '{del_name}' was removed from your profile successfully.",
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
                    user_id, skill_id, skill_name, proficiency_percentage, score, proficiency, category, verified, source, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'self_reported', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    Compute real-time career readiness, verified proficiencies, and missing skills
    strictly from the authenticated user's student_skills and target career.
    """
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # Get target career from profile
        cursor.execute("SELECT target_career FROM student_profiles WHERE user_id = ?", (user_id,))
        prof = cursor.fetchone()
        target_career = prof["target_career"] if prof and prof["target_career"] else "Full Stack Developer"

        # Get required skills for this career
        cursor.execute("SELECT required_technical_skills FROM career_roles WHERE title = ?", (target_career,))
        career_role = cursor.fetchone()
        required_skills = []
        if career_role and career_role["required_technical_skills"]:
            required_skills = json.loads(career_role["required_technical_skills"])
        if not required_skills:
            required_skills = ["Python", "SQL", "Git", "React", "Node.js", "Docker"]

        # Fetch authenticated user's actual skills with percentages
        cursor.execute("""
            SELECT 
                skill_name, 
                COALESCE(proficiency_percentage, score, 50) as score,
                proficiency,
                category,
                verified
            FROM student_skills
            WHERE user_id = ?
        """, (user_id,))
        user_skills = cursor.fetchall()

    user_skills_map = {s["skill_name"].lower(): s for s in user_skills}

    matched_skills = []
    missing_skills = []
    total_score = 0

    for req in required_skills:
        req_clean = req.strip()
        matched = None
        for u_name, u_data in user_skills_map.items():
            if u_name == req_clean.lower() or u_name in req_clean.lower() or req_clean.lower() in u_name:
                matched = u_data
                break

        if matched:
            score = matched["score"]
            matched_skills.append({
                "skill_name": req_clean,
                "score": score,
                "proficiency": matched["proficiency"],
                "verified": matched["verified"] == 1
            })
            total_score += score
        else:
            missing_skills.append(req_clean)

    # Readiness score calculation
    req_count = len(required_skills)
    matched_count = len(matched_skills)
    readiness_percentage = round((total_score / (req_count * 100)) * 100, 1) if req_count > 0 else 50.0
    skill_gap_percentage = round(100.0 - readiness_percentage, 1)

    return {
        "user_id": user_id,
        "target_career": target_career,
        "total_skills_logged": len(user_skills),
        "required_skills_count": req_count,
        "matched_skills_count": matched_count,
        "missing_skills_count": len(missing_skills),
        "career_readiness_percentage": min(100.0, max(0.0, readiness_percentage)),
        "skill_gap_percentage": min(100.0, max(0.0, skill_gap_percentage)),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "all_user_skills": [dict(s) for s in user_skills]
    }
