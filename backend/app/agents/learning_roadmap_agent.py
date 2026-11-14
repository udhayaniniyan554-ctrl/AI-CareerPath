import time
import json
from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.database import get_db

class LearningRoadmapAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Learning Roadmap Agent", role="Synthesizes gap analyses into structured milestones and tasks")

    def generate_roadmap(
        self,
        user_id: int,
        target_career: str,
        skill_analysis: Dict[str, Any],
        career_match: Dict[str, Any]
    ) -> Dict[str, Any]:
        start_time = time.time()

        missing_skills = skill_analysis.get("missing_skills", [])
        intermediate_skills = [s["name"] for s in skill_analysis.get("intermediate_skills", [])]
        beginner_skills = [s["name"] for s in skill_analysis.get("beginner_skills", [])]
        strong_skills = [s["name"] for s in skill_analysis.get("strong_skills", [])]

        # Template library for major career tracks
        stages_data = self._build_adaptive_stages(
            target_career=target_career,
            missing_skills=missing_skills,
            beginner_skills=beginner_skills,
            intermediate_skills=intermediate_skills,
            strong_skills=strong_skills
        )

        with get_db() as conn:
            cursor = conn.cursor()
            
            # Archive previous active roadmaps for this user
            cursor.execute("UPDATE learning_roadmaps SET status = 'archived' WHERE user_id = ? AND status = 'active'", (user_id,))

            # Insert new roadmap
            title = f"Adaptive Mastery Roadmap: {target_career}"
            summary = (
                f"Personalized roadmap curated for {target_career}. "
                f"Configured {len(stages_data)} milestone stages targeted at resolving {len(missing_skills)} missing skills."
            )
            cursor.execute("""
                INSERT INTO learning_roadmaps (user_id, career_goal, title, summary, total_stages, completion_percentage, status)
                VALUES (?, ?, ?, ?, ?, 0.0, 'active')
            """, (user_id, target_career, title, summary, len(stages_data)))
            
            roadmap_id = cursor.lastrowid

            # Insert tasks
            tasks_result = []
            for idx, stage in enumerate(stages_data, start=1):
                cursor.execute("""
                    INSERT INTO roadmap_tasks 
                    (roadmap_id, stage_order, stage_title, task_title, description, learning_objectives, required_skills, practical_exercises, recommended_resources, is_completed, assessment_milestone)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                """, (
                    roadmap_id,
                    idx,
                    stage["stage_title"],
                    stage["task_title"],
                    stage["description"],
                    json.dumps(stage["learning_objectives"]),
                    json.dumps(stage["required_skills"]),
                    json.dumps(stage["practical_exercises"]),
                    json.dumps(stage.get("resources", [])),
                    stage["assessment_milestone"]
                ))
                task_id = cursor.lastrowid
                stage["id"] = task_id
                stage["is_completed"] = 0
                tasks_result.append(stage)

        result = {
            "roadmap_id": roadmap_id,
            "title": title,
            "target_career": target_career,
            "summary": summary,
            "total_stages": len(stages_data),
            "stages": tasks_result
        }

        latency_ms = int((time.time() - start_time) * 1000)
        self.log_activity(
            user_id=user_id,
            task_name="Adaptive Roadmap Synthesis",
            input_summary=f"Resolved {len(missing_skills)} missing skills for {target_career}",
            output_summary=f"Generated {len(stages_data)} structured milestone stages",
            details=result,
            latency_ms=latency_ms,
            status="SUCCESS"
        )

        return result

    def _build_adaptive_stages(
        self,
        target_career: str,
        missing_skills: List[str],
        beginner_skills: List[str],
        intermediate_skills: List[str],
        strong_skills: List[str]
    ) -> List[Dict[str, Any]]:
        # Focus on priority skills needed
        focus_skills = missing_skills + beginner_skills
        if not focus_skills:
            focus_skills = ["Advanced Architecture", "System Design", "Cloud Optimization"]

        t_lower = target_career.lower()

        if "full stack" in t_lower:
            return [
                {
                    "stage_title": "Stage 1: Modern Frontend Foundations",
                    "task_title": "Master ES6+ JavaScript, DOM Manipulation & Modern Tooling",
                    "description": "Establish absolute fluency in modern JavaScript syntax, asynchronous programming (Promises/async-await), and responsive CSS.",
                    "learning_objectives": [
                        "Understand closures, event loop, and prototypical inheritance",
                        "Build responsive modular layouts with Flexbox/Grid",
                        "Fetch asynchronous JSON APIs cleanly with error handling"
                    ],
                    "required_skills": ["JavaScript", "HTML5", "CSS3"],
                    "practical_exercises": [
                        "Build an Interactive Task Matrix application with local storage persistence",
                        "Implement an asynchronous currency converter using free public exchange APIs"
                    ],
                    "assessment_milestone": "Frontend Core Assessment (Score >= 75%)"
                },
                {
                    "stage_title": "Stage 2: Component Architecture with React",
                    "task_title": "Deep Dive into React Hooks, State Management & Routing",
                    "description": "Develop scalable Single Page Applications utilizing functional components, custom hooks, and context APIs.",
                    "learning_objectives": [
                        "Master useState, useEffect, useMemo, and useCallback",
                        "Implement client-side routing with React Router",
                        "Handle complex form validations and loading states"
                    ],
                    "required_skills": ["React", "State Management", "Tailwind CSS"],
                    "practical_exercises": [
                        "Construct a real-time Product Analytics dashboard with filterable widgets",
                        "Implement an authenticated user profile management view"
                    ],
                    "assessment_milestone": "React Architecture Review & Component Quiz"
                },
                {
                    "stage_title": "Stage 3: Scalable Backend Services with Node & Python",
                    "task_title": "RESTful API Engineering, Middleware & Authentication",
                    "description": "Design resilient backend web services implementing JWT authentication, input validation, and route security.",
                    "learning_objectives": [
                        "Design RESTful URL conventions following industry standards",
                        "Implement secure password hashing (bcrypt) and JWT session handling",
                        "Apply centralized error-handling middlewares and CORS"
                    ],
                    "required_skills": ["Node.js / Express or FastAPI", "REST APIs", "JWT Security"],
                    "practical_exercises": [
                        "Create a micro-service with token verification and rate limiting",
                        "Implement CRUD endpoints for an e-commerce inventory system"
                    ],
                    "assessment_milestone": "Backend REST Architecture Certification"
                },
                {
                    "stage_title": "Stage 4: Relational & Non-Relational Data Engineering",
                    "task_title": "Database Schema Design, Indexing & Query Optimization",
                    "description": "Master structured relational database modeling in PostgreSQL/SQLite and NoSQL caching with Redis.",
                    "learning_objectives": [
                        "Design 3rd Normal Form relational schemas with foreign key constraints",
                        "Optimize slow queries with composite indexing and EXPLAIN query analysis",
                        "Execute atomic transactions to prevent race conditions"
                    ],
                    "required_skills": ["SQL", "PostgreSQL / SQLite", "Database Modeling"],
                    "practical_exercises": [
                        "Write migration scripts for a multi-tenant university portal",
                        "Optimize a dataset query with 50,000 rows to under 10ms execution time"
                    ],
                    "assessment_milestone": "Database Query & Optimization Assessment"
                },
                {
                    "stage_title": "Stage 5: DevOps, Containerization & CI/CD Pipelines",
                    "task_title": "Dockerize Applications & Automate Deployment Workflows",
                    "description": "Package full-stack services using Docker, configure automated tests with GitHub Actions, and deploy to cloud platforms.",
                    "learning_objectives": [
                        "Write multi-stage Dockerfiles for optimized container builds",
                        "Configure GitHub Actions pipeline for linting, testing, and automated builds",
                        "Deploy containerized microservices to cloud hosting"
                    ],
                    "required_skills": ["Docker", "Git", "CI/CD", "Cloud Platforms"],
                    "practical_exercises": [
                        "Containerize React frontend and FastAPI backend using docker-compose",
                        "Set up an automated testing pipeline that executes on pull requests"
                    ],
                    "assessment_milestone": "DevOps Pipeline Deployment Checkpoint"
                },
                {
                    "stage_title": "Stage 6: Enterprise Full-Stack Capstone Project",
                    "task_title": "Architect & Ship a Production-Grade AI-Enhanced Platform",
                    "description": "Design, implement, test, and present a complete enterprise application with full authentication, data persistence, and AI features.",
                    "learning_objectives": [
                        "Synthesize frontend, backend, database, and cloud infrastructure",
                        "Conduct peer code review and security vulnerability audit",
                        "Document complete architecture with OpenAPI specs and system diagrams"
                    ],
                    "required_skills": ["System Design", "Full Stack Integration", "Security Auditing"],
                    "practical_exercises": [
                        "Complete end-to-end integration and run automated regression tests",
                        "Produce comprehensive production documentation and deployment runbook"
                    ],
                    "assessment_milestone": "Final Full-Stack Capstone Defense"
                }
            ]

        elif "ai" in t_lower or "ml" in t_lower or "data" in t_lower:
            return [
                {
                    "stage_title": "Stage 1: Scientific Python & Data Wrangling",
                    "task_title": "NumPy, Pandas & Exploratory Data Analysis (EDA)",
                    "description": "Harness the scientific Python ecosystem to clean messy real-world datasets, engineer features, and visualize patterns.",
                    "learning_objectives": [
                        "Vectorized array computations with NumPy",
                        "Data manipulation and aggregation with Pandas",
                        "Statistical plotting and anomaly detection"
                    ],
                    "required_skills": ["Python", "NumPy", "Pandas"],
                    "practical_exercises": [
                        "Clean a 100k-row raw customer dataset and handle missing values",
                        "Perform correlation analysis and generate feature distribution charts"
                    ],
                    "assessment_milestone": "Data Wrangling & Statistical Analysis Quiz"
                },
                {
                    "stage_title": "Stage 2: Core Machine Learning Algorithms",
                    "task_title": "Supervised & Unsupervised Learning with Scikit-Learn",
                    "description": "Implement classification, regression, clustering, and dimension reduction models with cross-validation.",
                    "learning_objectives": [
                        "Train Random Forests, Gradient Boosted Trees, and SVMs",
                        "Evaluate models using ROC-AUC, Precision, Recall, and F1-score",
                        "Prevent overfitting using k-fold cross-validation and regularizers"
                    ],
                    "required_skills": ["Machine Learning", "Scikit-Learn", "Model Evaluation"],
                    "practical_exercises": [
                        "Build a customer churn predictor achieving >85% precision",
                        "Cluster student performance cohorts using K-Means and PCA"
                    ],
                    "assessment_milestone": "Machine Learning Foundations Assessment"
                },
                {
                    "stage_title": "Stage 3: Deep Learning Architectures & Neural Networks",
                    "task_title": "PyTorch Fundamentals, Backpropagation & CNNs/Transformers",
                    "description": "Construct neural network architectures using PyTorch, understand backpropagation and loss functions.",
                    "learning_objectives": [
                        "Implement custom PyTorch Modules, Loss Functions, and Optimizers",
                        "Train convolutional neural networks for vision tasks",
                        "Understand self-attention mechanisms and transformer blocks"
                    ],
                    "required_skills": ["PyTorch / TensorFlow", "Deep Learning", "Neural Networks"],
                    "practical_exercises": [
                        "Train an image classifier on custom dataset with transfer learning",
                        "Implement a multi-head self-attention layer from scratch"
                    ],
                    "assessment_milestone": "Deep Learning Architecture Benchmark"
                },
                {
                    "stage_title": "Stage 4: LLMs, Prompt Engineering & Multi-Agent Systems",
                    "task_title": "Generative AI, Embeddings, RAG & Autonomous Agent Pipelines",
                    "description": "Engineer sophisticated AI applications using Large Language Models, vector databases, and multi-agent coordination.",
                    "learning_objectives": [
                        "Build Retrieval-Augmented Generation (RAG) pipelines with vector search",
                        "Implement function calling and structured schema generation",
                        "Orchestrate multi-agent collaborative workflows"
                    ],
                    "required_skills": ["LLM APIs", "RAG", "Agent Orchestration", "Vector Databases"],
                    "practical_exercises": [
                        "Build an intelligent documentation Q&A bot using embeddings and RAG",
                        "Create a multi-agent research assistant that gathers and summarizes reports"
                    ],
                    "assessment_milestone": "Generative AI & Agent Systems Assessment"
                },
                {
                    "stage_title": "Stage 5: MLOps, Model Serving & Scalable Inference",
                    "task_title": "FastAPI Model Endpoints, Triton/ONNX & Monitoring",
                    "description": "Expose trained AI models through ultra-low latency REST/gRPC endpoints with containerization and drift detection.",
                    "learning_objectives": [
                        "Deploy ONNX runtime inference endpoints with FastAPI",
                        "Containerize model pipelines with GPU acceleration support",
                        "Track concept drift and input data distribution shifts"
                    ],
                    "required_skills": ["MLOps", "Model Deployment", "Docker", "FastAPI"],
                    "practical_exercises": [
                        "Benchmark model throughput across batch sizes using ONNX Runtime",
                        "Deploy a containerized real-time inference microservice"
                    ],
                    "assessment_milestone": "MLOps & Production Deployment Checkpoint"
                }
            ]

        # Generic default customizable adaptive track
        return [
            {
                "stage_title": f"Stage 1: Core Fundamentals of {target_career}",
                "task_title": f"Master Foundational Syntax and Essential Tooling",
                "description": f"Build solid proficiency in the core programming concepts and environment setup required for {target_career}.",
                "learning_objectives": ["Understand syntax and idiomatic patterns", "Set up professional developer workflow", "Version control best practices with Git"],
                "required_skills": focus_skills[:2] if focus_skills else ["Core Programming", "Git"],
                "practical_exercises": ["Complete 5 algorithmic challenges", "Publish code repository to version control"],
                "assessment_milestone": f"{target_career} Level 1 Diagnostic Quiz"
            },
            {
                "stage_title": f"Stage 2: Key Frameworks & Advanced Patterns",
                "task_title": "Develop Mastery in Domain-Specific Frameworks",
                "description": "Tackle intermediate challenges, framework conventions, and architectural best practices.",
                "learning_objectives": ["Understand clean architecture", "Implement error handling and tests", "Work with asynchronous data"],
                "required_skills": focus_skills[2:4] if len(focus_skills) > 2 else ["Architecture", "Testing"],
                "practical_exercises": ["Build a modular feature component with unit test coverage", "Refactor legacy code into clean modules"],
                "assessment_milestone": "Framework Mastery Evaluation"
            },
            {
                "stage_title": f"Stage 3: Integration, Databases & System Design",
                "task_title": "Build End-to-End Integrated Services",
                "description": "Connect frontend interfaces, persistent databases, and external third-party APIs.",
                "learning_objectives": ["Database schema design", "API design and consumption", "Security best practices"],
                "required_skills": ["Database Systems", "API Integration", "Security"],
                "practical_exercises": ["Design a relational schema with constraints", "Implement secure authentication tokens"],
                "assessment_milestone": "System Architecture Review"
            },
            {
                "stage_title": f"Stage 4: Industry Capstone Project for {target_career}",
                "task_title": "Deliver a Production-Ready Portfolio Milestone",
                "description": f"Synthesize all skills learned into a showcase project that proves hiring readiness for {target_career}.",
                "learning_objectives": ["Build production-quality application", "Implement automated testing and CI/CD", "Deploy live to cloud hosting"],
                "required_skills": ["System Integration", "Cloud Deployment", "Documentation"],
                "practical_exercises": ["Deploy full application with custom domain", "Write comprehensive README and API docs"],
                "assessment_milestone": "Final Capstone Evaluation & Certification"
            }
        ]
