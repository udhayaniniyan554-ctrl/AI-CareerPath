import re
import json
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])

class DocumentTextInput(BaseModel):
    doc_type: str  # 'resume' | 'syllabus' | 'certificate'
    file_name: str
    file_content_text: str
    metadata: Optional[dict] = None

# Known industry technical keywords for parsing resumes
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "SQL", "PostgreSQL", "MongoDB", "HTML", "CSS", "Tailwind CSS",
    "Docker", "Kubernetes", "AWS", "Git", "GitHub", "Linux", "REST APIs",
    "GraphQL", "Java", "C++", "C#", "Go", "Rust", "FastAPI", "Django",
    "Flask", "Next.js", "Vue.js", "Redis", "Machine Learning", "Deep Learning",
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Data Structures", "Algorithms",
    "System Design", "CI/CD", "Cybersecurity", "Networking", "Agile"
]

def extract_skills_from_text(text: str) -> List[str]:
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def extract_education_from_text(text: str) -> Optional[str]:
    text_lower = text.lower()
    if "b.tech" in text_lower or "bachelor of technology" in text_lower:
        return "Bachelor of Technology (B.Tech)"
    if "b.e" in text_lower or "bachelor of engineering" in text_lower:
        return "Bachelor of Engineering (B.E)"
    if "bca" in text_lower or "bachelor of computer applications" in text_lower:
        return "Bachelor of Computer Applications (BCA)"
    if "m.tech" in text_lower or "master of technology" in text_lower:
        return "Master of Technology (M.Tech)"
    if "mca" in text_lower or "master of computer applications" in text_lower:
        return "Master of Computer Applications (MCA)"
    if "b.sc" in text_lower or "bachelor of science" in text_lower:
        return "Bachelor of Science (B.Sc)"
    return None

@router.get("")
def get_user_documents(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, doc_type, file_name, file_size, extracted_skills, metadata_json, created_at
            FROM uploaded_documents
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        docs = cursor.fetchall()
        for doc in docs:
            if doc.get("extracted_skills"):
                try:
                    doc["extracted_skills"] = json.loads(doc["extracted_skills"])
                except Exception:
                    doc["extracted_skills"] = []
    return docs

@router.post("/parse-text")
def parse_document_text(input_data: DocumentTextInput, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    text = input_data.file_content_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Document content cannot be empty.")

    extracted_skills = extract_skills_from_text(text)
    extracted_edu = extract_education_from_text(text)

    # Save to uploaded_documents
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO uploaded_documents (user_id, doc_type, file_name, file_size, extracted_text, extracted_skills, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            input_data.doc_type,
            input_data.file_name,
            len(text.encode('utf-8')),
            text[:5000],  # store text snapshot
            json.dumps(extracted_skills),
            json.dumps({"education_detected": extracted_edu, **(input_data.metadata or {})})
        ))
        doc_id = cursor.lastrowid

        # If it's a resume and skills were found, automatically insert new skills for the user
        if input_data.doc_type == "resume" and extracted_skills:
            for sk in extracted_skills:
                cursor.execute("""
                    INSERT OR IGNORE INTO student_skills (user_id, skill_name, proficiency, verified, source)
                    VALUES (?, ?, 'Intermediate', 1, 'resume_parsing')
                """, (user_id, sk))

            # Also update student_profiles technical_skills
            cursor.execute("SELECT technical_skills FROM student_profiles WHERE user_id = ?", (user_id,))
            prof = cursor.fetchone()
            if prof:
                try:
                    existing = json.loads(prof["technical_skills"] or "[]")
                except Exception:
                    existing = []
                merged = list(dict.fromkeys(existing + extracted_skills))
                cursor.execute("""
                    UPDATE student_profiles
                    SET technical_skills = ?
                    WHERE user_id = ?
                """, (json.dumps(merged), user_id))

    return {
        "document_id": doc_id,
        "file_name": input_data.file_name,
        "doc_type": input_data.doc_type,
        "extracted_skills": extracted_skills,
        "detected_education": extracted_edu,
        "message": f"Successfully parsed {len(extracted_skills)} technical skills from {input_data.file_name}."
    }

@router.delete("/{doc_id}")
def delete_document(doc_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM uploaded_documents WHERE id = ? AND user_id = ?", (doc_id, user_id))
    return {"message": "Document deleted successfully."}
