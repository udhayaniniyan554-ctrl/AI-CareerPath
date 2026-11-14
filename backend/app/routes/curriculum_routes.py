import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/curriculum", tags=["College Course Mapping Engine"])

SUBJECT_SKILL_MAP = {
    "data structures": ["Data Structures", "Algorithms", "Problem Solving", "Complexity Analysis"],
    "design and analysis of algorithms": ["Algorithms", "Problem Solving", "Dynamic Programming"],
    "algorithms": ["Algorithms", "Problem Solving", "Complexity Analysis"],
    "database management systems": ["SQL", "Database Design", "Relational Modeling", "Query Optimization"],
    "dbms": ["SQL", "Database Design", "Relational Modeling", "Query Optimization"],
    "computer networks": ["Networking Fundamentals", "Network Protocols", "TCP/IP", "REST APIs"],
    "networking": ["Networking Fundamentals", "Network Protocols", "TCP/IP"],
    "web technology": ["HTML5", "CSS3", "JavaScript", "Frontend Development", "Web Architecture"],
    "web development": ["HTML5", "CSS3", "JavaScript", "React", "Frontend Development"],
    "operating systems": ["Linux", "Concurrency", "Process Scheduling", "Memory Management"],
    "software engineering": ["SDLC", "Agile", "Git", "Software Testing", "Clean Code"],
    "object oriented programming": ["OOP", "Java", "C++", "Design Patterns"],
    "java programming": ["Java", "OOP", "Design Patterns", "Multi-threading"],
    "python programming": ["Python", "Algorithms", "Scripting", "Data Structures"],
    "machine learning": ["Python", "Machine Learning", "Scikit-Learn", "Statistics", "Pandas"],
    "artificial intelligence": ["Artificial Intelligence", "Python", "Search Algorithms"],
    "cloud computing": ["Cloud Architecture", "Docker", "DevOps", "Virtualization"],
    "cyber security": ["Network Security", "Cryptography", "Vulnerability Assessment", "OWASP"],
    "compiler design": ["Lexical Analysis", "Parsing", "Automata Theory"],
    "distributed systems": ["Microservices", "Concurrency", "Fault Tolerance", "APIs"]
}

def map_subject_to_skills(subject_name: str) -> List[str]:
    sub_low = subject_name.strip().lower()
    for key, skills in SUBJECT_SKILL_MAP.items():
        if key in sub_low or sub_low in key:
            return skills
    return ["Problem Solving", "Technical Theory", "Documentation"]

class SubjectInput(BaseModel):
    subject_name: str
    semester: Optional[str] = "Current Semester"
    department: Optional[str] = ""
    topics: Optional[str] = ""

class SyllabusParseInput(BaseModel):
    syllabus_text: str
    semester: Optional[str] = "Semester 5"

@router.get("/mapping", response_model=Dict[str, Any])
def get_curriculum_mapping(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch profile
        cursor.execute("SELECT target_career, department, current_year, semester, college FROM student_profiles WHERE user_id = ?", (user_id,))
        profile = cursor.fetchone() or {}
        target_career = profile.get("target_career") or "Full Stack Developer"

        # Fetch college subjects
        cursor.execute("SELECT * FROM college_subjects WHERE user_id = ? ORDER BY id ASC", (user_id,))
        raw_subjects = cursor.fetchall()

        # Fetch career required skills
        cursor.execute("SELECT required_technical_skills, required_soft_skills FROM career_roles WHERE title = ?", (target_career,))
        role = cursor.fetchone()

    req_tech = json.loads(role["required_technical_skills"]) if role and role["required_technical_skills"] else ["JavaScript", "React", "Python", "SQL", "Docker", "Git"]
    req_soft = json.loads(role["required_soft_skills"]) if role and role["required_soft_skills"] else ["Problem Solving", "Communication", "System Architecture"]
    all_target_skills = req_tech + req_soft

    # Parse college subjects
    formatted_subjects = []
    college_covered_skills = set()

    for s in raw_subjects:
        matched = json.loads(s.get("matched_skills") or "[]")
        for m in matched:
            college_covered_skills.add(m.lower())
        formatted_subjects.append({
            "id": s["id"],
            "subject_name": s["subject_name"],
            "semester": s.get("semester"),
            "matched_skills": matched,
            "coverage_level": s.get("coverage_level", "Full")
        })

    # If user has no subjects yet, generate reasonable academic defaults for their department
    if not formatted_subjects:
        dept = (profile.get("department") or "Computer Science").lower()
        default_subs = [
            ("Data Structures & Algorithms", "Semester 3"),
            ("Database Management Systems", "Semester 4"),
            ("Computer Networks", "Semester 5"),
            ("Web Technology", "Semester 5"),
            ("Operating Systems", "Semester 4"),
            ("Software Engineering", "Semester 6")
        ]
        with get_db() as conn:
            cursor = conn.cursor()
            for sub_name, sem in default_subs:
                skills_mapped = map_subject_to_skills(sub_name)
                for sm in skills_mapped:
                    college_covered_skills.add(sm.lower())
                cursor.execute("""
                    INSERT INTO college_subjects (user_id, subject_name, semester, department, matched_skills, coverage_level)
                    VALUES (?, ?, ?, ?, ?, 'Full')
                """, (user_id, sub_name, sem, profile.get("department"), json.dumps(skills_mapped)))
                formatted_subjects.append({
                    "id": cursor.lastrowid,
                    "subject_name": sub_name,
                    "semester": sem,
                    "matched_skills": skills_mapped,
                    "coverage_level": "Full"
                })

    # Categorize into 3 distinct groups:
    # 1. Skills Covered by College Curriculum
    # 2. Skills Partially Covered
    # 3. Additional Industry Skills Not Covered (The Missing Gap!)
    covered_skills = []
    partially_covered_skills = []
    industry_gap_skills = []

    for req in all_target_skills:
        req_low = req.lower()
        if req_low in college_covered_skills:
            covered_skills.append(req)
        elif any(c in req_low or req_low in c for c in college_covered_skills):
            partially_covered_skills.append(req)
        else:
            industry_gap_skills.append(req)

    total = max(1, len(all_target_skills))
    coverage_percentage = round((len(covered_skills) * 1.0 + len(partially_covered_skills) * 0.5) / total * 100, 1)

    return {
        "target_career": target_career,
        "college": profile.get("college"),
        "department": profile.get("department"),
        "current_year": profile.get("current_year"),
        "semester": profile.get("semester"),
        "coverage_percentage": coverage_percentage,
        "subjects": formatted_subjects,
        "categories": {
            "covered_by_college": covered_skills,
            "partially_covered": partially_covered_skills,
            "industry_gap_not_covered": industry_gap_skills
        },
        "summary": (
            f"College curriculum covers {len(covered_skills)} of {len(all_target_skills)} requirements for {target_career}. "
            f"{len(industry_gap_skills)} critical industry competencies are NOT taught in standard university syllabus and must be acquired through NEXUS AI roadmap."
        )
    }

@router.post("/subjects")
def add_subject(sub: SubjectInput, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    name = sub.subject_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Subject name is required.")

    mapped_skills = map_subject_to_skills(name)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO college_subjects (user_id, subject_name, semester, department, topics, matched_skills, coverage_level)
            VALUES (?, ?, ?, ?, ?, ?, 'Full')
        """, (user_id, name, sub.semester, sub.department, sub.topics, json.dumps(mapped_skills)))
        sub_id = cursor.lastrowid

    return {
        "id": sub_id,
        "subject_name": name,
        "matched_skills": mapped_skills,
        "message": f"Subject '{name}' mapped to {len(mapped_skills)} industry skills."
    }

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM college_subjects WHERE id = ? AND user_id = ?", (subject_id, user_id))
    return {"message": "Subject removed."}

@router.post("/parse-syllabus")
def parse_syllabus(input_data: SyllabusParseInput, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    text = input_data.syllabus_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Syllabus text is required.")

    # Extract lines or topics
    lines = [line.strip("-•1234567890. ") for line in text.split("\n") if len(line.strip()) > 3]
    added_subjects = []

    with get_db() as conn:
        cursor = conn.cursor()
        for line in lines[:10]:
            mapped = map_subject_to_skills(line)
            cursor.execute("""
                INSERT INTO college_subjects (user_id, subject_name, semester, topics, matched_skills, coverage_level)
                VALUES (?, ?, ?, ?, ?, 'Full')
            """, (user_id, line[:80], input_data.semester, line, json.dumps(mapped)))
            added_subjects.append({"name": line[:80], "skills": mapped})

    return {
        "message": f"Successfully parsed and extracted {len(added_subjects)} academic topics.",
        "extracted_subjects": added_subjects
    }
