from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Auth
class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: str
    password: str

class OnboardingRegister(BaseModel):
    full_name: str
    email: str
    password: str = Field(min_length=6)
    education: str
    college: str
    department: str
    current_year: str
    semester: Optional[str] = "Semester 5"
    technical_skills: List[str] = []
    areas_of_interest: List[str] = []
    target_career: str
    experience_level: Optional[str] = "Beginner"
    college_subjects: Optional[List[str]] = []
    syllabus_text: Optional[str] = ""

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Student Profile
class StudentProfileUpdate(BaseModel):
    education: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    current_year: Optional[str] = None
    technical_skills: Optional[List[str]] = []
    soft_skills: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    projects: Optional[List[str]] = []
    career_interests: Optional[List[str]] = []
    target_career: Optional[str] = None
    experience_level: Optional[str] = "Beginner"
    bio: Optional[str] = None

class StudentProfileResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    education: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    current_year: Optional[str] = None
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    certifications: List[str] = []
    projects: List[str] = []
    career_interests: List[str] = []
    target_career: Optional[str] = None
    experience_level: Optional[str] = "Beginner"
    bio: Optional[str] = None
    updated_at: Optional[str] = None

# Skills
class StudentSkillCreate(BaseModel):
    skill_name: str
    proficiency: str = "Beginner" # 'Beginner', 'Intermediate', 'Advanced'

class StudentSkillResponse(BaseModel):
    id: int
    user_id: int
    skill_name: str
    proficiency: str
    score: int
    verified: int
    source: str
    updated_at: Optional[str] = None

# Assessment
class AssessmentQuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    skill_tested: Optional[str] = None

class AssessmentDetailResponse(BaseModel):
    id: int
    title: str
    category: str
    skill_target: str
    difficulty: str
    duration_minutes: int
    pass_score: int
    description: Optional[str] = None
    questions: List[AssessmentQuestionResponse]

class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_index: int

class AssessmentSubmission(BaseModel):
    assessment_id: int
    answers: List[AnswerSubmission]

# Roadmap & Tasks
class RoadmapGenerateRequest(BaseModel):
    target_career: Optional[str] = None
    force_regenerate: bool = False

class TaskCompleteRequest(BaseModel):
    is_completed: bool = True

# Mentor
class MentorMessageRequest(BaseModel):
    message: str
    context_topic: Optional[str] = None

class MentorMessageResponse(BaseModel):
    reply: str
    action_items: Optional[List[str]] = []
    recommended_skills: Optional[List[str]] = []
    suggested_questions: Optional[List[str]] = []

# Resource
class LearningResourceResponse(BaseModel):
    id: int
    title: str
    skill_name: str
    resource_type: str
    provider: str
    url: str
    duration: Optional[str] = None
    rating: float = 4.8
    is_free: bool = True
    difficulty: str = "Beginner"
    description: Optional[str] = None
    is_saved: Optional[bool] = False

# Agent Activity
class AgentActivityResponse(BaseModel):
    id: int
    agent_name: str
    task_name: str
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    details_json: Optional[Dict[str, Any]] = None
    latency_ms: int = 0
    status: str = "SUCCESS"
    created_at: Optional[str] = None
