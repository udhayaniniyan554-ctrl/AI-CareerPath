import json
from fastapi import APIRouter, HTTPException, Depends, status
from app.database import get_db
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.schemas import UserRegister, UserLogin, UserResponse, Token, OnboardingRegister
from app.agents.orchestrator import orchestrator
from app.routes.curriculum_routes import map_subject_to_skills

router = APIRouter(prefix="/api/auth", tags=["Authentication & Onboarding"])

@router.post("/register", response_model=Token)
def register(user_data: UserRegister):
    email = user_data.email.strip().lower()
    full_name = user_data.full_name.strip()

    if not email or not full_name:
        raise HTTPException(status_code=400, detail="Name and email are required.")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        pwd_hash = hash_password(user_data.password)
        role = "student" if user_data.role not in ["admin", "student"] else user_data.role

        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        """, (email, pwd_hash, full_name, role))
        user_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO student_profiles (
                user_id, target_career, experience_level, technical_skills, soft_skills, 
                certifications, projects, career_interests, bio
            ) VALUES (?, 'Full Stack Developer', 'Beginner', '[]', '[]', '[]', '[]', '[]', '')
        """, (user_id,))

        cursor.execute("SELECT id, email, full_name, role, avatar_url, created_at FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()

    try:
        orchestrator.run_full_pipeline(user_id=user_id, target_career_override="Full Stack Developer")
    except Exception as e:
        print(f"Initial agent pipeline trigger warning: {e}")

    token = create_access_token(data={"sub": user_id, "email": email, "role": role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/onboard", response_model=Token)
def register_and_onboard(data: OnboardingRegister):
    """
    Direct Real User Registration & Profile Onboarding from First Page.
    Collects actual user details and kicks off the multi-agent career journey.
    """
    email = data.email.strip().lower()
    full_name = data.full_name.strip()

    if not email or not full_name:
        raise HTTPException(status_code=400, detail="Full name and email are required.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if not data.college or not data.department:
        raise HTTPException(status_code=400, detail="College and department are required.")
    if not data.target_career:
        raise HTTPException(status_code=400, detail="Target career goal is required.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please sign in.")

        pwd_hash = hash_password(data.password)
        role = "student"

        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        """, (email, pwd_hash, full_name, role))
        user_id = cursor.lastrowid

        # Insert student profile with the real user's details
        cursor.execute("""
            INSERT INTO student_profiles (
                user_id, education, college, department, current_year, semester,
                technical_skills, career_interests, target_career, experience_level,
                syllabus_text, soft_skills, certifications, projects, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', '[]', '[]', '')
        """, (
            user_id,
            data.education or "Bachelor of Technology",
            data.college,
            data.department,
            data.current_year or "3rd Year",
            data.semester or "Semester 5",
            json.dumps(data.technical_skills or []),
            json.dumps(data.areas_of_interest or []),
            data.target_career,
            data.experience_level or "Beginner",
            data.syllabus_text or ""
        ))

        # Insert user's real technical skills into student_skills table
        for sk in (data.technical_skills or []):
            sk_clean = sk.strip()
            if sk_clean:
                cursor.execute("""
                    INSERT INTO student_skills (user_id, skill_name, proficiency, score, verified, source)
                    VALUES (?, ?, ?, 50, 0, 'self_reported')
                    ON CONFLICT(user_id, skill_name) DO NOTHING
                """, (user_id, sk_clean, data.experience_level or 'Beginner'))

        # Insert college subjects if provided
        for sub in (data.college_subjects or []):
            sub_clean = sub.strip()
            if sub_clean:
                mapped = map_subject_to_skills(sub_clean)
                cursor.execute("""
                    INSERT INTO college_subjects (user_id, subject_name, semester, department, matched_skills, coverage_level)
                    VALUES (?, ?, ?, ?, ?, 'Full')
                """, (user_id, sub_clean, data.semester or "Semester 5", data.department, json.dumps(mapped)))

        cursor.execute("SELECT id, email, full_name, role, avatar_url, created_at FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()

    # Trigger Multi-Agent Pipeline for this new student's real skills & career goal
    try:
        orchestrator.run_full_pipeline(user_id=user_id, target_career_override=data.target_career)
    except Exception as e:
        print(f"Multi-agent onboarding pipeline execution note: {e}")

    token = create_access_token(data={"sub": user_id, "email": email, "role": role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    email = credentials.email.strip().lower()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(data={"sub": user["id"], "email": user["email"], "role": user["role"]})
    
    user_resp = {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "avatar_url": user.get("avatar_url"),
        "created_at": str(user.get("created_at"))
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_resp
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
