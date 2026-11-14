import sqlite3
import json
from contextlib import contextmanager
from app.config import DB_PATH

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
            avatar_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. student_profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            education TEXT,
            college TEXT,
            department TEXT,
            current_year TEXT,
            technical_skills TEXT, -- JSON string array
            soft_skills TEXT,      -- JSON string array
            certifications TEXT,   -- JSON string array
            projects TEXT,         -- JSON string array
            career_interests TEXT, -- JSON string array
            target_career TEXT,
            experience_level TEXT DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
            bio TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 3. skills
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL, -- 'Frontend', 'Backend', 'Data', 'AI/ML', 'DevOps', 'Security', 'Soft Skills'
            description TEXT
        );
        """)

        # 4. student_skills
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            skill_name TEXT NOT NULL,
            proficiency TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
            score INTEGER DEFAULT 0,
            verified INTEGER DEFAULT 0, -- 1 if verified via assessment
            source TEXT DEFAULT 'self_reported', -- 'self_reported' or 'assessment'
            skill_id INTEGER,
            proficiency_percentage INTEGER DEFAULT 50,
            category TEXT DEFAULT 'Technical',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, skill_name)
        );
        """)

        # 5. career_roles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS career_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            salary_range TEXT,
            demand_level TEXT DEFAULT 'High', -- 'Very High', 'High', 'Moderate'
            required_technical_skills TEXT NOT NULL, -- JSON string array
            required_soft_skills TEXT NOT NULL,      -- JSON string array
            min_experience_months INTEGER DEFAULT 0,
            roadmap_overview TEXT
        );
        """)

        # 6. assessments
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            skill_target TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
            duration_minutes INTEGER DEFAULT 15,
            pass_score INTEGER DEFAULT 70,
            description TEXT
        );
        """)

        # 7. assessment_questions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assessment_id INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            options TEXT NOT NULL, -- JSON string array of 4 options
            correct_option_index INTEGER NOT NULL,
            explanation TEXT,
            skill_tested TEXT,
            FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
        );
        """)

        # 8. assessment_results
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            assessment_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            passed INTEGER NOT NULL, -- 0 or 1
            answers_detail TEXT, -- JSON string
            strengths TEXT,      -- JSON array
            weaknesses TEXT,     -- JSON array
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
        );
        """)

        # 9. learning_resources
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            skill_name TEXT NOT NULL,
            resource_type TEXT NOT NULL, -- 'Course', 'Documentation', 'Tutorial', 'Project', 'Book'
            provider TEXT NOT NULL,      -- 'MDN', 'freeCodeCamp', 'Coursera', 'FastAPI Docs', etc.
            url TEXT NOT NULL,
            duration TEXT,
            rating REAL DEFAULT 4.8,
            is_free INTEGER DEFAULT 1,
            difficulty TEXT DEFAULT 'Beginner',
            description TEXT
        );
        """)

        # 10. saved_resources
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            resource_id INTEGER NOT NULL,
            saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(resource_id) REFERENCES learning_resources(id) ON DELETE CASCADE,
            UNIQUE(user_id, resource_id)
        );
        """)

        # 11. learning_roadmaps
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_roadmaps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            career_goal TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            total_stages INTEGER DEFAULT 0,
            completion_percentage REAL DEFAULT 0.0,
            status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 12. roadmap_tasks
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS roadmap_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            roadmap_id INTEGER NOT NULL,
            stage_order INTEGER NOT NULL,
            stage_title TEXT NOT NULL,
            task_title TEXT NOT NULL,
            description TEXT,
            learning_objectives TEXT, -- JSON array
            required_skills TEXT,     -- JSON array
            practical_exercises TEXT, -- JSON array
            recommended_resources TEXT, -- JSON array of resource ids or objects
            is_completed INTEGER DEFAULT 0,
            completed_at TIMESTAMP,
            assessment_milestone TEXT,
            FOREIGN KEY(roadmap_id) REFERENCES learning_roadmaps(id) ON DELETE CASCADE
        );
        """)

        # 13. mentor_conversations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS mentor_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            sender TEXT NOT NULL, -- 'user' or 'mentor'
            message TEXT NOT NULL,
            metadata TEXT, -- JSON string for suggestions, code snippets, etc.
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 14. agent_activity_logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS agent_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            agent_name TEXT NOT NULL,
            task_name TEXT NOT NULL,
            input_summary TEXT,
            output_summary TEXT,
            details_json TEXT,
            latency_ms INTEGER DEFAULT 0,
            status TEXT DEFAULT 'SUCCESS', -- 'SUCCESS', 'INFO', 'REVISED', 'ERROR'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
        );
        """)

        # 15. student_progress
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            metric_key TEXT NOT NULL, -- 'overall_readiness', 'skill_gap_percentage', 'tasks_completed', etc.
            metric_value REAL NOT NULL,
            notes TEXT,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 16. college_subjects (College Course Mapping Engine)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS college_subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject_name TEXT NOT NULL,
            semester TEXT,
            department TEXT,
            topics TEXT,
            matched_skills TEXT, -- JSON array of mapped industry skill strings
            coverage_level TEXT DEFAULT 'Full', -- 'Full' or 'Partial'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # 17. uploaded_documents (Resume & Syllabus document store)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            doc_type TEXT NOT NULL, -- 'resume', 'syllabus', 'certificate'
            file_name TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            extracted_text TEXT,
            extracted_skills TEXT, -- JSON array
            metadata_json TEXT,    -- JSON object
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        # Add optional columns to student_profiles if missing
        try:
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN semester TEXT DEFAULT 'Semester 5';")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE student_profiles ADD COLUMN syllabus_text TEXT DEFAULT '';")
        except Exception:
            pass

        # Migrations for student_skills table: user-specific proficiency percentage, category & created_at
        try:
            cursor.execute("ALTER TABLE student_skills ADD COLUMN skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL;")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE student_skills ADD COLUMN proficiency_percentage INTEGER DEFAULT 50;")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE student_skills ADD COLUMN category TEXT DEFAULT 'Technical';")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE student_skills ADD COLUMN created_at TIMESTAMP;")
            cursor.execute("UPDATE student_skills SET created_at = COALESCE(updated_at, datetime('now')) WHERE created_at IS NULL;")
        except Exception:
            pass

        # Backfill proficiency_percentage if 0 or null
        cursor.execute("""
            UPDATE student_skills 
            SET proficiency_percentage = CASE 
                WHEN score > 0 THEN score 
                WHEN proficiency = 'Advanced' THEN 85
                WHEN proficiency = 'Intermediate' THEN 65
                ELSE 45
            END
            WHERE proficiency_percentage IS NULL OR proficiency_percentage = 0;
        """)

        # Performance & isolation indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_student_skills_user ON student_skills(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_student_skills_name ON student_skills(user_id, skill_name);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);")

        print("Database initialized successfully with all tables and indexes.")
