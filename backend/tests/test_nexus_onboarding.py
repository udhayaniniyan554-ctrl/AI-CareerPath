import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_nexus_e2e():
    print("=== Testing NEXUS AI End-to-End Onboarding & College Mapping ===")

    # 1. Health check
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        health_data = json.loads(response.read().decode())
        print(f"[PASS] Health: {health_data}")

    # 2. Check Landing Page HTML
    req = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        html = response.read().decode()
        assert "NEXUS AI" in html or "AI CareerPath" in html
        print("[PASS] Root HTML served properly")

    # 3. Test Onboarding a Real User (No Demo Person)
    user_email = f"student_{int(time.time())}@university.edu"
    onboard_payload = {
        "full_name": "Rohan Sharma",
        "email": user_email,
        "password": "Password123!",
        "education": "Bachelor of Technology (B.Tech)",
        "college": "National Institute of Technology",
        "department": "Computer Science & Engineering",
        "current_year": "3rd Year",
        "semester": "Semester 5",
        "technical_skills": ["Python", "SQL", "HTML/CSS", "Git"],
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
        print(f"[PASS] Real user onboarded: ID={user_info['id']}, Name={user_info['full_name']}, Email={user_info['email']}")
        assert user_info["full_name"] == "Rohan Sharma"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 4. Check College Course Mapping Engine
    req = urllib.request.Request(f"{BASE_URL}/api/curriculum/mapping", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        mapping = json.loads(response.read().decode())
        print(f"[PASS] College Course Mapping: Target Career='{mapping['target_career']}', Coverage={mapping['coverage_percentage']}%")
        cats = mapping["categories"]
        print(f"       - Covered by College: {len(cats['covered_by_college'])} skills: {cats['covered_by_college']}")
        print(f"       - Partially Covered: {len(cats['partially_covered'])} skills: {cats['partially_covered']}")
        print(f"       - Industry Skills Not Covered: {len(cats['industry_gap_not_covered'])} skills: {cats['industry_gap_not_covered']}")
        assert len(cats["covered_by_college"]) > 0 or len(cats["partially_covered"]) > 0 or len(cats["industry_gap_not_covered"]) > 0

    # 5. Add a new college subject
    new_sub = {"subject_name": "Web Technologies & Cloud Computing", "semester": "Semester 5"}
    req = urllib.request.Request(f"{BASE_URL}/api/curriculum/subjects", data=json.dumps(new_sub).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        sub_res = json.loads(response.read().decode())
        print(f"[PASS] Added College Subject: {sub_res['subject_name']}")

    # 6. Parse syllabus text
    syllabus_sample = "Unit 1: React.js components and state management. Unit 2: Node.js and Express REST APIs. Unit 3: Docker containerization."
    parse_payload = {"syllabus_text": syllabus_sample, "semester": "Semester 5"}
    req = urllib.request.Request(f"{BASE_URL}/api/curriculum/parse-syllabus", data=json.dumps(parse_payload).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        parse_res = json.loads(response.read().decode())
        print(f"[PASS] Syllabus Parser: Extracted {len(parse_res['extracted_subjects'])} subjects: {parse_res['extracted_subjects']}")

    # 7. Check Dashboard for the onboarded real user
    req = urllib.request.Request(f"{BASE_URL}/api/dashboard", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        dash = json.loads(response.read().decode())
        print(f"[PASS] Real User Dashboard: Readiness={dash['career_readiness_percentage']}%, Missing Skills={len(dash['missing_skills'])}")
        assert dash["user"]["full_name"] == "Rohan Sharma"
        # Confirm NO Alex Morgan / demo person data
        assert "Alex Morgan" not in dash["user"]["full_name"]

    # 8. Check Roadmap
    req = urllib.request.Request(f"{BASE_URL}/api/roadmap", headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        roadmap = json.loads(response.read().decode())
        print(f"[PASS] Roadmap: {len(roadmap)} stages generated for {user_info['full_name']}")

    # 9. Check AI Mentor with Real Context
    mentor_query = {"message": "How does my college Operating Systems course help me become a Full Stack Developer?"}
    req = urllib.request.Request(f"{BASE_URL}/api/mentor/chat", data=json.dumps(mentor_query).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        mentor_res = json.loads(response.read().decode())
        print(f"[PASS] AI Mentor reply preview: {mentor_res['reply'][:100]}...")

    print("\n>>> ALL NEXUS AI REAL USER & COLLEGE MAPPING TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_nexus_e2e()
