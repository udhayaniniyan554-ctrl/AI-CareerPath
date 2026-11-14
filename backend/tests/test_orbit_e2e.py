import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_orbit_ai_platform():
    print("=== Testing ORBIT AI Platform End-to-End ===")

    # 1. Health check
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        health = json.loads(response.read().decode())
        print(f"[PASS] Health: {health['service']} (Version {health['version']})")
        assert "ORBIT" in health['service']

    # 2. Check HTML output
    req = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        html = response.read().decode()
        assert "ORBIT AI" in html
        print("[PASS] Root HTML served with ORBIT AI branding")

    # 3. Real User Onboarding (Zero Demo Content)
    email = f"student_orbit_{int(time.time())}@university.edu"
    onboard_payload = {
        "full_name": "Arjun Mehta",
        "email": email,
        "password": "SecurePassword123!",
        "education": "Bachelor of Technology (B.Tech)",
        "college": "Indian Institute of Information Technology",
        "department": "Computer Science & Engineering",
        "current_year": "3rd Year",
        "semester": "Semester 5",
        "technical_skills": ["Python", "SQL", "Git", "HTML/CSS"],
        "areas_of_interest": ["Full Stack Development", "Cloud Architecture", "Distributed Systems"],
        "target_career": "Full Stack Developer",
        "experience_level": "Beginner",
        "college_subjects": ["Data Structures & Algorithms", "Database Management Systems", "Computer Networks", "Operating Systems"]
    }

    req = urllib.request.Request(
        f"{BASE_URL}/api/auth/onboard",
        data=json.dumps(onboard_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        onboard_res = json.loads(response.read().decode())
        token = onboard_res["access_token"]
        user_info = onboard_res["user"]
        print(f"[PASS] Real user onboarded: {user_info['full_name']} ({user_info['email']})")
        assert user_info["full_name"] == "Arjun Mehta"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 4. Document / Resume Text Parsing Engine
    resume_sample = "Experienced in Python, PostgreSQL, Docker, and React. Built full stack REST APIs and managed Linux servers."
    doc_payload = {
        "doc_type": "resume",
        "file_name": "arjun_resume.txt",
        "file_content_text": resume_sample
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/documents/parse-text",
        data=json.dumps(doc_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        doc_res = json.loads(response.read().decode())
        print(f"[PASS] Document Parser: Extracted {len(doc_res['extracted_skills'])} skills: {doc_res['extracted_skills']}")
        assert "Docker" in doc_res["extracted_skills"] or "React" in doc_res["extracted_skills"]

    # 5. College-to-Industry Course Mapping Engine
    req = urllib.request.Request(f"{BASE_URL}/api/curriculum/mapping", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        mapping = json.loads(response.read().decode())
        print(f"[PASS] College Course Mapping: Target='{mapping['target_career']}', Alignment={mapping['coverage_percentage']}%")
        cats = mapping["categories"]
        print(f"       - Covered by College: {cats['covered_by_college']}")
        print(f"       - Industry Gap: {cats['industry_gap_not_covered']}")

    # 6. Student Dashboard & Orbital Universe Data
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        dash = json.loads(response.read().decode())
        print(f"[PASS] Dashboard: Readiness={dash['career_readiness_percentage']}%, Verified Skills={len(dash['skills_overview'])}")
        assert dash["user"]["full_name"] == "Arjun Mehta"

    # 7. Adaptive Learning Roadmap
    req = urllib.request.Request(f"{BASE_URL}/api/roadmap", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        roadmap = json.loads(response.read().decode())
        print(f"[PASS] Adaptive Roadmap: {len(roadmap)} sequenced stages generated")
        assert len(roadmap) > 0

    # 8. Multi-Agent Pipeline Execution
    req = urllib.request.Request(
        f"{BASE_URL}/api/agents/pipeline/run",
        data=json.dumps({"target_career": "Full Stack Developer", "force_regenerate": True}).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        pipeline_res = json.loads(response.read().decode())
        print(f"[PASS] Multi-Agent Pipeline: Synchronized in {pipeline_res['total_latency_ms']}ms across {len(pipeline_res['pipeline_steps'])} agent handoffs")

    # 9. AI Mentor Studio
    mentor_query = {"message": "What skills do I have and what are my missing industry gaps?"}
    req = urllib.request.Request(
        f"{BASE_URL}/api/mentor/chat",
        data=json.dumps(mentor_query).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        mentor_res = json.loads(response.read().decode())
        print(f"[PASS] AI Mentor reply: {mentor_res['reply'][:120]}...")

    print("\n>>> ALL ORBIT AI TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_orbit_ai_platform()
