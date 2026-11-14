import json
from app.database import get_db, init_db
from app.auth import hash_password

def seed_database():
    init_db()

    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Check if already seeded
        cursor.execute("SELECT COUNT(*) as count FROM career_roles")
        if cursor.fetchone()["count"] > 0:
            print("Database already contains seed data. Skipping re-seed.")
            return

        print("Seeding database with realistic production data...")

        # 2. Insert Career Roles
        career_roles = [
            (
                "Full Stack Developer",
                "Software Engineering",
                "Architects and implements end-to-end web applications across frontends, backend APIs, distributed databases, and cloud infrastructure.",
                "$95,000 - $145,000 / year",
                "Very High",
                json.dumps(["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Git", "Docker", "REST APIs", "Tailwind CSS"]),
                json.dumps(["Problem Solving", "System Architecture", "Code Review", "Agile Collaboration", "Technical Writing"]),
                0,
                "Covers frontend responsive design, component architecture, RESTful API design, database modeling, authentication, and containerized deployment."
            ),
            (
                "Frontend Developer",
                "Software Engineering",
                "Specializes in crafting modern, responsive, accessible, and high-performance user interfaces and Single Page Applications.",
                "$85,000 - $130,000 / year",
                "High",
                json.dumps(["JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS", "Redux/Zustand", "Webpack/Vite", "Git"]),
                json.dumps(["UI/UX Empathy", "Attention to Detail", "Design System Thinking", "Cross-browser Debugging"]),
                0,
                "Focuses on modern DOM APIs, component design patterns, client-side caching, bundle optimization, and animations."
            ),
            (
                "Backend Developer",
                "Software Engineering",
                "Designs scalable backend services, database architectures, microservices, secure authentication, and high-throughput APIs.",
                "$92,000 - $140,000 / year",
                "Very High",
                json.dumps(["Python", "FastAPI", "Node.js", "SQL", "PostgreSQL", "Redis", "Docker", "REST APIs", "Microservices", "Git"]),
                json.dumps(["System Architecture", "Security Mindset", "Concurrency Analysis", "Performance Profiling"]),
                0,
                "Focuses on data modeling, asynchronous IO, caching strategies, rate limiting, and database query optimization."
            ),
            (
                "Python Developer",
                "Software Engineering",
                "Builds enterprise web applications, automation pipelines, and backend microservices using the rich Python ecosystem.",
                "$90,000 - $135,000 / year",
                "High",
                json.dumps(["Python", "FastAPI", "Django/Flask", "SQL", "Git", "Pytest", "Docker", "Celery/Redis", "REST APIs"]),
                json.dumps(["Clean Code", "Analytical Thinking", "Algorithmic Efficiency", "Documentation"]),
                0,
                "Focuses on idiomatic Python, generator pipelines, type hinting, test-driven development, and async runtime."
            ),
            (
                "Java Developer",
                "Software Engineering",
                "Engineers high-reliability, multi-threaded enterprise services using Java and Spring Boot ecosystems.",
                "$95,000 - $142,000 / year",
                "High",
                json.dumps(["Java", "Spring Boot", "SQL", "Hibernate/JPA", "Docker", "Maven/Gradle", "REST APIs", "Microservices", "Git"]),
                json.dumps(["Enterprise Patterns", "Concurrency Design", "Root-cause Analysis", "Team Communication"]),
                0,
                "Focuses on JVM internals, Spring dependency injection, ORM performance, distributed transactions, and cloud-native Java."
            ),
            (
                "Data Analyst",
                "Data & Analytics",
                "Translates raw business data into actionable strategic insights through SQL querying, statistical analysis, and interactive dashboards.",
                "$75,000 - $115,000 / year",
                "High",
                json.dumps(["SQL", "Python", "Pandas", "Power BI / Tableau", "Excel", "Data Visualization", "Statistics"]),
                json.dumps(["Critical Thinking", "Business Storytelling", "Stakeholder Communication", "Data Integrity"]),
                0,
                "Focuses on exploratory data analysis, complex SQL joins/window functions, metric calculation, and stakeholder reporting."
            ),
            (
                "AI/ML Engineer",
                "Artificial Intelligence",
                "Researches, builds, and deploys machine learning models, neural networks, LLM agents, and retrieval-augmented generation systems.",
                "$115,000 - $175,000 / year",
                "Very High",
                json.dumps(["Python", "PyTorch", "Scikit-Learn", "NumPy", "Pandas", "LLM APIs", "Vector Databases", "MLOps", "Docker", "FastAPI"]),
                json.dumps(["Mathematical Intuition", "Experimental Rigor", "Hypothesis Testing", "Research Synthesis"]),
                0,
                "Focuses on deep learning architectures, transformer models, fine-tuning, RAG pipelines, low-latency model inference, and MLOps."
            ),
            (
                "Cloud Engineer",
                "Cloud & Infrastructure",
                "Designs, deploys, and maintains resilient cloud architectures, container orchestration clusters, and automated infrastructure as code.",
                "$100,000 - $155,000 / year",
                "Very High",
                json.dumps(["AWS/GCP/Azure", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD", "Python", "Networking", "Security"]),
                json.dumps(["Disaster Recovery", "Incident Response", "Cost Optimization", "Automation First Mindset"]),
                0,
                "Focuses on infrastructure automation, multi-cloud reliability, zero-trust security, container networking, and auto-scaling."
            ),
            (
                "Cybersecurity Analyst",
                "Security & Defense",
                "Safeguards organizational networks, applications, and cloud data against cyber threats, vulnerabilities, and intrusions.",
                "$90,000 - $140,000 / year",
                "Very High",
                json.dumps(["Network Security", "Linux", "Python", "Vulnerability Assessment", "SIEM Tools", "Cryptography", "OWASP Top 10"]),
                json.dumps(["Ethical Integrity", "Investigative Curiosity", "Crisis Management", "Compliance Governance"]),
                0,
                "Focuses on vulnerability scanning, intrusion detection, penetration testing fundamentals, and security log triage."
            )
        ]

        cursor.executemany("""
            INSERT INTO career_roles 
            (title, category, description, salary_range, demand_level, required_technical_skills, required_soft_skills, min_experience_months, roadmap_overview)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, career_roles)

        # 3. Insert Skills (Industry Comprehensive Catalog)
        skills = [
            # Programming Languages
            ("Python", "Programming Languages", "High-level programming language renowned for clean syntax, AI/ML, and backend systems"),
            ("Java", "Programming Languages", "Enterprise-grade object-oriented programming language running on the JVM"),
            ("JavaScript", "Programming Languages", "The foundational language of the modern web ecosystem and browser runtimes"),
            ("TypeScript", "Programming Languages", "Typed superset of JavaScript providing compile-time type safety and scalability"),
            ("C", "Programming Languages", "Low-level systems programming language with direct memory control and maximum performance"),
            ("C++", "Programming Languages", "High-performance object-oriented systems and competitive programming language"),
            ("C#", "Programming Languages", "Modern object-oriented language for enterprise applications and .NET ecosystem"),
            ("Go", "Programming Languages", "Concurrent, compiled language engineered by Google for cloud and microservices"),
            ("Rust", "Programming Languages", "Memory-safe systems language with zero-cost abstractions and fearless concurrency"),
            ("Kotlin", "Programming Languages", "Modern JVM language primarily used for Android application development"),
            ("Swift", "Programming Languages", "Modern language designed for iOS, macOS, and Apple ecosystem applications"),
            ("PHP", "Programming Languages", "Server-side scripting language powering web backends and CMS platforms"),

            # Frontend
            ("React", "Frontend", "Declarative component-driven user interface library"),
            ("Next.js", "Frontend", "Production-grade React framework with SSR, ISR, and API routing"),
            ("HTML5", "Frontend", "Standard markup language structuring content on the World Wide Web"),
            ("CSS3", "Frontend", "Style sheet language describing presentation and formatting of web documents"),
            ("Tailwind CSS", "Frontend", "Utility-first CSS framework for rapid modern UI development"),
            ("Vue.js", "Frontend", "Progressive, approachable framework for building interactive user interfaces"),
            ("Angular", "Frontend", "Comprehensive enterprise TypeScript web application platform"),
            ("Redux", "Frontend", "Predictable state container for JavaScript applications"),
            ("Sass", "Frontend", "CSS extension language with variables, nesting, and mixins"),

            # Backend & APIs
            ("Node.js", "Backend", "Asynchronous event-driven JavaScript server runtime"),
            ("FastAPI", "Backend", "High-performance Python web framework based on OpenAPI and type hints"),
            ("Django", "Backend", "Batteries-included high-level Python web framework for rapid development"),
            ("Flask", "Backend", "Lightweight and extensible WSGI Python micro-framework"),
            ("Express.js", "Backend", "Minimalist, fast web framework for Node.js"),
            ("Spring Boot", "Backend", "Production-ready framework for creating standalone Java microservices"),
            ("REST APIs", "Backend", "Architectural style for designing networked applications over HTTP"),
            ("GraphQL", "Backend", "Query language for APIs giving clients precision data fetching"),
            ("gRPC", "Backend", "High-performance RPC framework using HTTP/2 and Protocol Buffers"),
            ("Microservices", "Backend", "Architectural design decomposing applications into modular independent services"),

            # Databases & Storage
            ("SQL", "Database", "Standard declarative language for relational database queries"),
            ("PostgreSQL", "Database", "Advanced open-source object-relational database system"),
            ("MySQL", "Database", "Widely deployed open-source relational database management system"),
            ("MongoDB", "Database", "Leading document-oriented NoSQL database for flexible JSON data models"),
            ("Redis", "Database", "In-memory data structure store used as a database, cache, and message broker"),
            ("SQLite", "Database", "Lightweight, serverless embedded relational database engine"),
            ("Elasticsearch", "Database", "Distributed search and analytics engine for structured and unstructured data"),
            ("Database Design", "Database", "Relational modeling, normalization, indexing, and query optimization"),

            # Cloud & DevOps
            ("Docker", "DevOps", "Standard platform for containerizing applications and microservices"),
            ("Kubernetes", "DevOps", "Container orchestration system for automating deployment and scaling"),
            ("AWS", "Cloud", "Amazon Web Services cloud computing infrastructure and managed services"),
            ("Google Cloud", "Cloud", "Google Cloud Platform infrastructure, compute, and data analytics tools"),
            ("Microsoft Azure", "Cloud", "Microsoft cloud platform for enterprise hosting, identity, and AI"),
            ("Linux", "DevOps", "Open-source Unix-like operating system powering servers and cloud containers"),
            ("Git", "DevOps", "Distributed version control system essential for modern engineering workflows"),
            ("CI/CD", "DevOps", "Continuous Integration and Continuous Deployment automation pipelines"),
            ("Terraform", "DevOps", "Infrastructure as Code tool for declaratively managing multi-cloud resources"),
            ("Nginx", "DevOps", "High-performance HTTP server, reverse proxy, and load balancer"),

            # AI & Machine Learning & Data Science
            ("PyTorch", "AI/ML", "Flexible deep learning framework widely used in research and production"),
            ("TensorFlow", "AI/ML", "End-to-end open-source machine learning platform by Google"),
            ("Scikit-Learn", "AI/ML", "Core machine learning library for classification, regression, and clustering"),
            ("Pandas", "Data Science", "Python library for high-performance data manipulation and analysis"),
            ("NumPy", "Data Science", "Fundamental package for scientific computing with multi-dimensional arrays"),
            ("Machine Learning", "AI/ML", "Algorithms that learn patterns from data without explicit rules"),
            ("Deep Learning", "AI/ML", "Neural network architectures with multiple representation layers"),
            ("Natural Language Processing", "AI/ML", "Computational techniques for analyzing and generating human language"),
            ("Large Language Models", "AI/ML", "Transformer-based foundational models and generative AI systems"),
            ("Vector Databases", "AI/ML", "Specialized databases for semantic similarity search and embeddings"),

            # Cybersecurity
            ("Network Security", "Security", "Protocols and practices defending networks from unauthorized access"),
            ("OWASP Top 10", "Security", "Standard awareness document on critical web application vulnerabilities"),
            ("Cryptography", "Security", "Mathematical techniques securing data confidentiality and integrity"),
            ("Vulnerability Assessment", "Security", "Systematic evaluation of security weaknesses in computer systems"),

            # Core Engineering & Soft Skills
            ("Data Structures", "Engineering Foundations", "Organization, management, and storage formats for efficient data access"),
            ("Algorithms", "Engineering Foundations", "Step-by-step computational procedures for calculations and data processing"),
            ("Object-Oriented Programming", "Engineering Foundations", "Programming paradigm based on concepts of objects and classes"),
            ("System Architecture", "Engineering Foundations", "High-level software design, trade-off evaluation, and scalability"),
            ("Problem Solving", "Soft Skills", "Structured analytical thinking and debugging capability"),
            ("Communication", "Soft Skills", "Clarity in presenting technical ideas and collaborative review"),
            ("Agile Methodologies", "Soft Skills", "Iterative project management and software delivery framework")
        ]

        cursor.executemany("""
            INSERT OR IGNORE INTO skills (name, category, description) VALUES (?, ?, ?)
        """, skills)

        # 4. Insert Verified Learning Resources
        resources = [
            (
                "MDN Web Docs: Modern JavaScript Handbook",
                "JavaScript",
                "Documentation",
                "MDN Mozilla",
                "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "Self-paced",
                4.9,
                1,
                "Beginner",
                "The definitive industry standard guide to modern JavaScript syntax, async patterns, and DOM APIs."
            ),
            (
                "React Official Documentation & Interactive Tutorials",
                "React",
                "Documentation",
                "React Team",
                "https://react.dev",
                "Self-paced",
                4.9,
                1,
                "Beginner",
                "Comprehensive interactive guide to React components, hooks, state modeling, and best practices."
            ),
            (
                "FastAPI Official Tutorial - User Guide",
                "FastAPI",
                "Documentation",
                "FastAPI Authors",
                "https://fastapi.tiangolo.com/tutorial/",
                "Self-paced",
                4.9,
                1,
                "Intermediate",
                "Step-by-step documentation detailing dependency injection, OAuth2 JWT auth, and OpenAPI generation."
            ),
            (
                "freeCodeCamp: Scientific Computing with Python",
                "Python",
                "Course",
                "freeCodeCamp",
                "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
                "30 hours",
                4.8,
                1,
                "Beginner",
                "Hands-on foundational Python curriculum covering algorithms, data structures, and scientific computing."
            ),
            (
                "CS50: Introduction to Computer Science",
                "Problem Solving",
                "Course",
                "Harvard University / edX",
                "https://cs50.harvard.edu/x/",
                "10 weeks",
                5.0,
                1,
                "Beginner",
                "World-renowned introduction to algorithms, memory management, data structures, and software principles."
            ),
            (
                "SQLZoo: Interactive SQL Tutorials & Window Functions",
                "SQL",
                "Tutorial",
                "SQLZoo",
                "https://sqlzoo.net/",
                "10 hours",
                4.7,
                1,
                "Beginner",
                "Interactive live query sandbox for mastering SELECT queries, JOINs, subqueries, and window functions."
            ),
            (
                "Docker Getting Started Official Guide",
                "Docker",
                "Documentation",
                "Docker",
                "https://docs.docker.com/get-started/",
                "4 hours",
                4.8,
                1,
                "Intermediate",
                "Hands-on guide to containerization, Dockerfiles, multi-stage builds, and docker-compose configuration."
            ),
            (
                "DeepLearning.AI: Machine Learning Specialization",
                "Scikit-Learn",
                "Course",
                "Coursera / Andrew Ng",
                "https://www.coursera.org/specializations/machine-learning-introduction",
                "40 hours",
                4.9,
                1,
                "Intermediate",
                "Foundational ML series covering regression, classification, neural networks, and decision trees."
            ),
            (
                "PyTorch Official 60-Minute Blitz",
                "PyTorch",
                "Tutorial",
                "PyTorch Foundation",
                "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
                "2 hours",
                4.8,
                1,
                "Intermediate",
                "Fast-track tutorial to PyTorch tensors, autograd, and neural network construction."
            )
        ]

        cursor.executemany("""
            INSERT INTO learning_resources 
            (title, skill_name, resource_type, provider, url, duration, rating, is_free, difficulty, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, resources)

        # 5. Insert Interactive Assessments & Questions
        assessments_data = [
            (
                "Full Stack Developer Readiness Assessment",
                "Software Engineering",
                "Full Stack",
                "Intermediate",
                20,
                75,
                "Evaluates core proficiencies across JavaScript, React hooks, REST APIs, and database fundamentals.",
                [
                    (
                        "In modern JavaScript, what does the Promise.all() method do when one of the passed promises rejects?",
                        json.dumps([
                            "It waits for the remaining promises to resolve before returning.",
                            "It immediately rejects with the reason of the first promise that rejected.",
                            "It returns an array containing both resolved values and errors.",
                            "It ignores the rejected promise and resolves the remaining."
                        ]),
                        1,
                        "Promise.all fail-fast behavior: if any promise in the iterable rejects, the whole returned promise immediately rejects with that error.",
                        "JavaScript"
                    ),
                    (
                        "Why should you never mutate state directly in React (e.g. state.push(item))?",
                        json.dumps([
                            "Direct mutation breaks JavaScript memory allocation.",
                            "React relies on reference equality checks (Object.is) to trigger re-renders; mutating state does not update the object reference.",
                            "React components cannot render arrays.",
                            "Direct mutation causes automatic HTTP 500 exceptions in Vite."
                        ]),
                        1,
                        "React checks if previous state !== next state using shallow comparison. Mutating the existing object keeps the same reference so re-renders are missed.",
                        "React"
                    ),
                    (
                        "When designing a REST API, what is the most appropriate HTTP status code to return when a client attempts to access a protected resource without valid authentication credentials?",
                        json.dumps([
                            "400 Bad Request",
                            "401 Unauthorized",
                            "403 Forbidden",
                            "404 Not Found"
                        ]),
                        1,
                        "HTTP 401 Unauthorized is specifically reserved for missing or invalid authentication credentials. HTTP 403 Forbidden is used when identity is known but permission is denied.",
                        "REST APIs"
                    ),
                    (
                        "In relational database design, what is the primary benefit of creating an index on a frequently queried foreign key column?",
                        json.dumps([
                            "It decreases the storage space consumed by the table.",
                            "It converts non-clustered tables into Redis cache stores.",
                            "It dramatically accelerates JOIN and SELECT lookup performance by using B-tree indexing rather than full table scans.",
                            "It guarantees that duplicate records are rejected automatically."
                        ]),
                        2,
                        "Database indexes create lookup structures (typically B-trees) that reduce query complexity from O(N) full table scans to O(log N).",
                        "SQL"
                    ),
                    (
                        "What is the crucial security purpose of hashing passwords using bcrypt with a salt instead of MD5 or SHA-256?",
                        json.dumps([
                            "Bcrypt compresses passwords to fewer bytes than SHA-256.",
                            "Bcrypt incorporates an adaptive computational work factor and unique salt, thwarting precomputed rainbow tables and high-speed brute force attacks.",
                            "Bcrypt decrypts passwords back to plain text on the server.",
                            "Bcrypt requires a hardware security token."
                        ]),
                        1,
                        "Bcrypt is deliberately CPU/memory intensive and uses unique salts per password, neutralizing rainbow table dictionaries and GPU-accelerated hashing.",
                        "Security"
                    )
                ]
            ),
            (
                "Python & Backend Architecture Diagnostic",
                "Backend Engineering",
                "Python",
                "Intermediate",
                15,
                70,
                "Tests understanding of Python concurrency, decorators, generator pipelines, and FastAPI dependency injection.",
                [
                    (
                        "What is the core difference between a regular function and a Python generator function using the 'yield' keyword?",
                        json.dumps([
                            "Generators execute on a separate operating system thread.",
                            "Generators produce values lazily one-at-a-time maintaining internal state, saving memory compared to returning a full list in memory.",
                            "Generators only operate on string data.",
                            "Generators cannot accept arguments."
                        ]),
                        1,
                        "Generators implement the iterator protocol lazily; they suspend execution upon yield and resume on next(), eliminating the memory overhead of large in-memory lists.",
                        "Python"
                    ),
                    (
                        "In FastAPI, how does Dependency Injection (Depends) enhance production code maintainability?",
                        json.dumps([
                            "It automatically converts SQL queries into HTML.",
                            "It enables clean decoupling of concerns like database sessions, authentication checks, and external services from route handlers, facilitating easy unit testing.",
                            "It eliminates the need for type annotations.",
                            "It increases CPU clock speed."
                        ]),
                        1,
                        "FastAPI Depends allows declaring reusable, testable components (auth tokens, DB sessions) that can be easily mocked or overridden in unit test suites.",
                        "FastAPI"
                    ),
                    (
                        "What does Python's Global Interpreter Lock (GIL) fundamentally restrict?",
                        json.dumps([
                            "It prevents asynchronous IO from handling network sockets.",
                            "It prevents multiple native OS threads from executing Python bytecode simultaneously on multiple CPU cores.",
                            "It limits memory usage to 4GB.",
                            "It prevents modules from importing other scripts."
                        ]),
                        1,
                        "The GIL ensures only one native thread executes Python bytecode at any given moment, making CPU-bound multi-threading ineffective without multiprocessing.",
                        "Python"
                    ),
                    (
                        "Which SQL clause is used to partition data into subsets for running calculations like ROW_NUMBER() or RANK() without collapsing rows like GROUP BY?",
                        json.dumps([
                            "HAVING clause",
                            "OVER (PARTITION BY ...)",
                            "ORDER BY ASC",
                            "LIMIT OFFSET"
                        ]),
                        1,
                        "Window functions use the OVER (PARTITION BY ...) clause to compute aggregations over subsets of rows while preserving each individual row in the output.",
                        "SQL"
                    )
                ]
            ),
            (
                "AI/ML & Data Engineering Competency Exam",
                "Artificial Intelligence",
                "AI/ML",
                "Advanced",
                20,
                70,
                "Covers statistical learning, overfitting mitigation, gradient descent, transformers, and evaluation metrics.",
                [
                    (
                        "If a classification model demonstrates 98% accuracy on training data but drops to 64% accuracy on validation data, what is occurring?",
                        json.dumps([
                            "Underfitting due to excessive regularization.",
                            "Overfitting (high variance), where the model has memorized noise in the training set rather than learning generalizable patterns.",
                            "Data leakage from the test split.",
                            "Gradient vanishing."
                        ]),
                        1,
                        "A large divergence between high train performance and low validation performance is the textbook definition of overfitting / high variance.",
                        "Machine Learning"
                    ),
                    (
                        "In the Self-Attention mechanism of Transformer architectures, what is the role of the Softmax operation?",
                        json.dumps([
                            "It converts raw dot-product attention scores (Q * K^T / sqrt(d_k)) into normalized probability weights that sum to 1.",
                            "It performs matrix multiplication with value vectors.",
                            "It drops out 50% of the neurons to prevent overfitting.",
                            "It compresses tokens into 1D embeddings."
                        ]),
                        0,
                        "Softmax normalizes the scaled dot product between Query and Key vectors so that weights across all token positions sum to 1.",
                        "Deep Learning"
                    ),
                    (
                        "Why is the F1-Score typically a superior evaluation metric compared to standard Accuracy on imbalanced datasets (e.g. fraud detection with 99% non-fraud)?",
                        json.dumps([
                            "F1-score is easier to calculate manually.",
                            "F1-score is the harmonic mean of Precision and Recall, penalizing models that predict only the majority class.",
                            "F1-score ignores false positives.",
                            "F1-score only applies to unsupervised clustering."
                        ]),
                        1,
                        "A naive model predicting 'no fraud' gets 99% accuracy but 0 Recall and 0 F1-Score. The harmonic mean forces balance between precision and recall.",
                        "Model Evaluation"
                    )
                ]
            )
        ]

        for asm_data in assessments_data:
            title, category, skill_target, difficulty, duration_minutes, pass_score, desc, questions = asm_data
            cursor.execute("""
                INSERT INTO assessments (title, category, skill_target, difficulty, duration_minutes, pass_score, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (title, category, skill_target, difficulty, duration_minutes, pass_score, desc))
            asm_id = cursor.lastrowid

            for q in questions:
                q_text, opts, ans_idx, expl, sk_test = q
                cursor.execute("""
                    INSERT INTO assessment_questions (assessment_id, question_text, options, correct_option_index, explanation, skill_tested)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (asm_id, q_text, opts, ans_idx, expl, sk_test))

        # 6. Insert Default Users (Admin + Student)
        admin_pass = hash_password("admin12345")
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES ('admin@aicareerpath.io', ?, 'System Administrator', 'admin')
        """, (admin_pass,))

        student_pass = hash_password("student12345")
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES ('alex.morgan@university.edu', ?, 'Alex Morgan', 'student')
        """, (student_pass,))
        alex_id = cursor.lastrowid

        # Insert Alex's Profile
        cursor.execute("""
            INSERT INTO student_profiles (
                user_id, education, college, department, current_year, 
                technical_skills, soft_skills, certifications, projects, career_interests, target_career, experience_level, bio
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alex_id,
            "Bachelor of Technology in Computer Science",
            "Apex Institute of Technology",
            "Computer Science & Engineering",
            "3rd Year",
            json.dumps(["Python", "SQL", "HTML5", "CSS3", "Git", "Problem Solving"]),
            json.dumps(["Team Collaboration", "Critical Thinking", "Agile"]),
            json.dumps(["Google IT Automation with Python", "CS50 Computer Science Certificate"]),
            json.dumps([
                "E-Commerce Cart Microservice using Python & SQLite",
                "Personal Developer Portfolio & Blog built with HTML/CSS"
            ]),
            json.dumps(["Full Stack Development", "Cloud Architecture", "Applied AI"]),
            "Full Stack Developer",
            "Beginner",
            "Passionate 3rd-year CS student eager to master modern full-stack development, build impactful web applications, and bridge university theory with industry-ready engineering standards."
        ))

        # Insert Alex's initial skills
        alex_skills = [
            ("Python", "Intermediate", 65, 1, "assessment"),
            ("SQL", "Intermediate", 60, 1, "assessment"),
            ("HTML5", "Intermediate", 70, 0, "self_reported"),
            ("CSS3", "Beginner", 45, 0, "self_reported"),
            ("Git", "Intermediate", 60, 0, "self_reported"),
            ("Problem Solving", "Advanced", 85, 1, "assessment")
        ]
        for sk in alex_skills:
            cursor.execute("""
                INSERT INTO student_skills (user_id, skill_name, proficiency, score, verified, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (alex_id, sk[0], sk[1], sk[2], sk[3], sk[4]))

        print(f"Seed completed successfully! Admin: admin@aicareerpath.io | Student: alex.morgan@university.edu (User ID: {alex_id})")

if __name__ == "__main__":
    seed_database()
