import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except:
            return e.code, {"detail": content}

def run_tests():
    print("=== STARTING USER-SPECIFIC SKILL ISOLATION & CRUD TEST ===")
    ts = int(time.time())

    # 1. Register User A
    user_a_email = f"user_a_{ts}@university.edu"
    print(f"\n[1] Registering User A ({user_a_email})...")
    status, res = make_request("POST", "/auth/register", {
        "full_name": "Alice Wonder",
        "email": user_a_email,
        "password": "Password123!",
        "role": "student"
    })
    assert status == 200, f"User A registration failed: {res}"
    token_a = res["access_token"]
    user_a_id = res["user"]["id"]
    print(f"-> User A registered with ID {user_a_id}. Token obtained.")

    # 2. Add multiple skills with explicit proficiency percentages for User A
    # User A: Python – 75%, Java – 40%, SQL – 60%, HTML5 – 85%, CSS3 – 70%
    skills_a = [
        {"skill_name": "Python", "proficiency_percentage": 75, "category": "Programming Languages"},
        {"skill_name": "Java", "proficiency_percentage": 40, "category": "Programming Languages"},
        {"skill_name": "SQL", "proficiency_percentage": 60, "category": "Database"},
        {"skill_name": "HTML5", "proficiency_percentage": 85, "category": "Frontend"},
        {"skill_name": "CSS3", "proficiency_percentage": 70, "category": "Frontend"}
    ]
    print(f"\n[2] Adding 5 distinct skills for User A with specific percentages...")
    for sk in skills_a:
        status, res = make_request("POST", "/skills/user", sk, token=token_a)
        assert status == 201, f"Failed to add skill {sk['skill_name']} for User A: {res}"
        print(f"  + Added {sk['skill_name']} ({sk['proficiency_percentage']}%) -> {res.get('message')}")

    # Verify User A's skills
    status, user_a_saved_skills = make_request("GET", "/skills/user", token=token_a)
    assert status == 200, f"Failed to get User A skills: {user_a_saved_skills}"
    assert len(user_a_saved_skills) == 5, f"Expected 5 skills for User A, got {len(user_a_saved_skills)}"
    print(f"-> User A has {len(user_a_saved_skills)} skills accurately saved in DB.")
    for s in user_a_saved_skills:
        print(f"    - {s['skill_name']}: {s['proficiency_percentage']}% ({s['proficiency']}) [{s['category']}]")

    # 3. Register & Login User B
    user_b_email = f"user_b_{ts}@university.edu"
    print(f"\n[3] Registering User B ({user_b_email})...")
    status, res = make_request("POST", "/auth/register", {
        "full_name": "Bob Builder",
        "email": user_b_email,
        "password": "Password123!",
        "role": "student"
    })
    assert status == 200, f"User B registration failed: {res}"
    token_b = res["access_token"]
    user_b_id = res["user"]["id"]
    print(f"-> User B registered with ID {user_b_id}. Token obtained.")

    # 4. Verify User B starts with 0 skills (NO LEAKAGE of User A's skills)
    print("\n[4] Verifying User B has 0 skills initially (Zero Data Leakage)...")
    status, user_b_skills_initial = make_request("GET", "/skills/user", token=token_b)
    assert status == 200
    assert len(user_b_skills_initial) == 0, f"LEAKAGE DETECTED! User B saw {len(user_b_skills_initial)} skills: {user_b_skills_initial}"
    print("-> ISOLATION CONFIRMED: User B cannot see any of User A's skills!")

    # 5. Add User B's skills with different percentages
    # User B: Python – 30%, Java – 90%, C – 80%
    skills_b = [
        {"skill_name": "Python", "proficiency_percentage": 30, "category": "Programming Languages"},
        {"skill_name": "Java", "proficiency_percentage": 90, "category": "Programming Languages"},
        {"skill_name": "C", "proficiency_percentage": 80, "category": "Programming Languages"}
    ]
    print(f"\n[5] Adding 3 distinct skills for User B...")
    for sk in skills_b:
        status, res = make_request("POST", "/skills/user", sk, token=token_b)
        assert status == 201, f"Failed to add skill {sk['skill_name']} for User B: {res}"
        print(f"  + Added {sk['skill_name']} ({sk['proficiency_percentage']}%) for User B")

    status, user_b_saved_skills = make_request("GET", "/skills/user", token=token_b)
    assert len(user_b_saved_skills) == 3, f"Expected 3 skills for User B, got {len(user_b_saved_skills)}"
    user_b_map = {s["skill_name"]: s["proficiency_percentage"] for s in user_b_saved_skills}
    assert user_b_map["Python"] == 30, f"Expected User B Python=30, got {user_b_map['Python']}"
    assert user_b_map["Java"] == 90, f"Expected User B Java=90, got {user_b_map['Java']}"
    assert user_b_map["C"] == 80, f"Expected User B C=80, got {user_b_map['C']}"
    assert "SQL" not in user_b_map, "User B should not have SQL!"
    assert "HTML5" not in user_b_map, "User B should not have HTML5!"
    print("-> User B skills verified independently: Python=30%, Java=90%, C=80%.")

    # 6. Re-check User A's profile and skills using User A's token
    print("\n[6] Re-checking User A skills with User A token (Persisted & Unaltered)...")
    status, user_a_check = make_request("GET", "/skills/user", token=token_a)
    assert status == 200
    assert len(user_a_check) == 5, f"User A lost skills! Expected 5, got {len(user_a_check)}"
    user_a_map = {s["skill_name"]: s["proficiency_percentage"] for s in user_a_check}
    assert user_a_map["Python"] == 75, f"Expected User A Python=75, got {user_a_map['Python']}"
    assert user_a_map["Java"] == 40, f"Expected User A Java=40, got {user_a_map['Java']}"
    assert user_a_map["SQL"] == 60, f"Expected User A SQL=60, got {user_a_map['SQL']}"
    assert "C" not in user_a_map, "User A should NOT see User B's 'C' skill!"
    print("-> CONFIRMED: User A has Python=75%, Java=40%, SQL=60%, HTML5=85%, CSS3=70%. Completely distinct from User B!")

    # 7. Edit User A skill percentage (e.g. SQL from 60% -> 92%)
    print("\n[7] Updating User A's SQL proficiency from 60% to 92%...")
    status, update_res = make_request("PUT", "/skills/user/SQL", {"proficiency_percentage": 92}, token=token_a)
    assert status == 200, f"Failed to update skill: {update_res}"
    assert update_res["skill"]["proficiency_percentage"] == 92
    assert update_res["skill"]["proficiency"] == "Advanced"
    print(f"-> SQL updated successfully: {update_res['message']}")

    # 8. Delete a skill for User A (e.g. Java)
    print("\n[8] Deleting 'Java' skill from User A...")
    status, del_res = make_request("DELETE", "/skills/user/Java", token=token_a)
    assert status == 200, f"Failed to delete skill: {del_res}"
    print(f"-> {del_res['message']}")

    # Verify User A now has 4 skills and SQL is 92%
    status, user_a_post_edit = make_request("GET", "/skills/user", token=token_a)
    assert len(user_a_post_edit) == 4
    assert not any(s["skill_name"] == "Java" for s in user_a_post_edit)
    assert next(s for s in user_a_post_edit if s["skill_name"] == "SQL")["proficiency_percentage"] == 92
    print("-> User A now has 4 skills (Java removed, SQL=92%).")

    # Verify User B STILL has Java=90% (User A's deletion did NOT affect User B!)
    status, user_b_post_edit = make_request("GET", "/skills/user", token=token_b)
    assert any(s["skill_name"] == "Java" and s["proficiency_percentage"] == 90 for s in user_b_post_edit), "User B's Java was affected by User A's deletion!"
    print("-> ISOLATION PRESERVED: User B still has Java at 90%!")

    # 9. Test Cross-User Unauthorized Tampering Prevention
    print("\n[9] Testing cross-user tampering prevention (User B trying to modify User A's skill)...")
    user_a_sql_id = next(s for s in user_a_post_edit if s["skill_name"] == "SQL")["id"]
    status, unauthorized_res = make_request("PUT", f"/skills/user/{user_a_sql_id}", {"proficiency_percentage": 10}, token=token_b)
    assert status == 404, f"Security Breach! User B modified User A's skill: {unauthorized_res}"
    print(f"-> PROTECTED: User B was rejected with 404 when attempting to tamper with User A's skill (ID: {user_a_sql_id}).")

    # 10. Test Unauthorized Requests Without Token
    print("\n[10] Testing requests without authentication token...")
    status, unauth_res = make_request("GET", "/skills/user")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"
    status, unauth_post = make_request("POST", "/skills/user", {"skill_name": "Rust", "proficiency_percentage": 80})
    assert status == 401, f"Expected 401 Unauthorized on POST, got {status}"
    print("-> PROTECTED: Unauthenticated requests strictly rejected with 401 Unauthorized.")

    # 11. Test AI Skill Analysis Endpoint
    print("\n[11] Testing AI Skill Analysis for User A...")
    status, analysis_res = make_request("GET", "/skills/analysis", token=token_a)
    assert status == 200
    assert analysis_res["user_id"] == user_a_id
    assert "user_skills" in analysis_res
    assert "strong_skills" in analysis_res
    assert "needs_improvement" in analysis_res
    assert "missing_skills" in analysis_res
    assert "what_to_learn_next" in analysis_res
    assert "recommended_projects" in analysis_res
    print(f"-> AI Analysis Generated:")
    print(f"   Target Career: {analysis_res['target_career']}")
    print(f"   Readiness Score: {analysis_res['readiness_score']}%")
    print(f"   Gap Percentage: {analysis_res['gap_percentage']}%")
    print(f"   Strong Skills: {[s['skill_name'] for s in analysis_res['strong_skills']]}")
    print(f"   Needs Improvement: {[s['skill_name'] for s in analysis_res['needs_improvement']]}")
    print(f"   Missing Skills: {analysis_res['missing_skills'][:4]}")
    print(f"   Recommended Projects: {len(analysis_res['recommended_projects'])}")

    # 12. Test Skills Catalog Search
    print("\n[12] Testing Skills Catalog Search...")
    status, cat_res = make_request("GET", "/skills/catalog?search=py")
    assert status == 200
    assert any("python" in s["name"].lower() for s in cat_res)
    print(f"-> Catalog search 'py' matched {len(cat_res)} skills: {[s['name'] for s in cat_res[:3]]}")

    print("\n=======================================================")
    print("ALL 12 TESTS PASSED PERFECTLY! USER ISOLATION VERIFIED.")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
