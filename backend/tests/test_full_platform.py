import unittest
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.seed_data import seed_database
from app.agents.orchestrator import orchestrator

class TestAICareerPathPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("Multi-Agent", data["agents"])

    def test_02_login_demo_student(self):
        response = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "alex.morgan@university.edu")
        self.assertEqual(data["user"]["role"], "student")

    def test_03_login_demo_admin(self):
        response = self.client.post("/api/auth/login", json={
            "email": "admin@aicareerpath.io",
            "password": "admin12345"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["role"], "admin")

    def test_04_registration_and_profile_flow(self):
        new_email = f"test.learner.{os.getpid()}@example.com"
        response = self.client.post("/api/auth/register", json={
            "full_name": "Jordan Lee",
            "email": new_email,
            "password": "password123",
            "role": "student"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Verify Profile
        p_res = self.client.get("/api/profile", headers=headers)
        self.assertEqual(p_res.status_code, 200)
        p_data = p_res.json()
        self.assertEqual(p_data["user"]["full_name"], "Jordan Lee")
        self.assertEqual(p_data["profile"]["target_career"], "Full Stack Developer")

        # Update Profile
        update_res = self.client.put("/api/profile", headers=headers, json={
            "college": "Stanford Institute",
            "department": "Informatics",
            "current_year": "4th Year",
            "target_career": "AI/ML Engineer",
            "technical_skills": ["Python", "SQL", "Pandas"]
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertTrue(update_res.json()["target_career_recalculated"])

    def test_05_student_dashboard(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        dash_res = self.client.get("/api/dashboard", headers=headers)
        self.assertEqual(dash_res.status_code, 200)
        dash = dash_res.json()

        self.assertIn("selected_career_goal", dash)
        self.assertIn("skill_gap_percentage", dash)
        self.assertIn("career_readiness_percentage", dash)
        self.assertIn("learning_progress", dash)
        self.assertGreater(dash["learning_progress"]["total_tasks"], 0)
        self.assertGreater(len(dash["recent_activities"]), 0)

    def test_06_assessment_flow_and_adaptive_remediation(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch available assessments
        list_res = self.client.get("/api/assessments", headers=headers)
        self.assertEqual(list_res.status_code, 200)
        assessments = list_res.json()
        self.assertGreaterEqual(len(assessments), 3)
        asm_id = assessments[0]["id"]

        # 2. Fetch specific assessment questions
        quiz_res = self.client.get(f"/api/assessments/{asm_id}", headers=headers)
        self.assertEqual(quiz_res.status_code, 200)
        quiz = quiz_res.json()
        self.assertGreater(len(quiz["questions"]), 0)

        # 3. Deliberately fail assessment (<70%) to verify ProgressTrackingAgent adaptive roadmap injection
        failed_answers = [{"question_id": q["id"], "selected_option_index": 3} for q in quiz["questions"]]
        submit_res = self.client.post(f"/api/assessments/{asm_id}/submit", headers=headers, json={
            "assessment_id": asm_id,
            "answers": failed_answers
        })
        self.assertEqual(submit_res.status_code, 200)
        res_data = submit_res.json()
        self.assertFalse(res_data["passed"])
        self.assertTrue(res_data["roadmap_updated"])
        self.assertGreater(len(res_data["adaptive_actions"]), 0)

    def test_07_roadmap_task_toggling(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        r_res = self.client.get("/api/roadmap", headers=headers)
        self.assertEqual(r_res.status_code, 200)
        tasks = r_res.json()["tasks"]
        self.assertGreater(len(tasks), 0)
        first_task = tasks[0]

        toggle_res = self.client.post(f"/api/roadmap/tasks/{first_task['id']}/toggle", headers=headers, json={
            "is_completed": True
        })
        self.assertEqual(toggle_res.status_code, 200)
        t_data = toggle_res.json()
        self.assertTrue(t_data["is_completed"])
        self.assertGreaterEqual(t_data["completed_tasks"], 1)

    def test_08_ai_mentor_chat(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        chat_res = self.client.post("/api/mentor/chat", headers=headers, json={
            "message": "Can you explain how async/await works under the hood?",
            "context_topic": "JavaScript Event Loop"
        })
        self.assertEqual(chat_res.status_code, 200)
        c_data = chat_res.json()
        self.assertIn("reply", c_data)
        self.assertGreater(len(c_data["reply"]), 20)
        self.assertGreater(len(c_data["action_items"]), 0)
        self.assertGreater(len(c_data["suggested_questions"]), 0)

        hist_res = self.client.get("/api/mentor/history", headers=headers)
        self.assertEqual(hist_res.status_code, 200)
        history = hist_res.json()
        self.assertGreaterEqual(len(history), 2)

    def test_09_learning_resources_and_bookmarks(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res_list = self.client.get("/api/resources", headers=headers)
        self.assertEqual(res_list.status_code, 200)
        resources = res_list.json()
        self.assertGreaterEqual(len(resources), 5)
        target_res = resources[0]

        # Bookmark resource toggle test
        save_res = self.client.post(f"/api/resources/{target_res['id']}/save", headers=headers)
        self.assertEqual(save_res.status_code, 200)
        # If it was toggled to unsaved, toggle once more to ensure it is saved
        if not save_res.json()["is_saved"]:
            save_res = self.client.post(f"/api/resources/{target_res['id']}/save", headers=headers)
        self.assertTrue(save_res.json()["is_saved"])

        # Check saved list
        saved_list = self.client.get("/api/resources/saved", headers=headers)
        self.assertEqual(saved_list.status_code, 200)
        saved_ids = [r["id"] for r in saved_list.json()]
        self.assertIn(target_res["id"], saved_ids)

    def test_10_multi_agent_pipeline_execution(self):
        login_res = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        pipe_res = self.client.post("/api/agents/pipeline/run", headers=headers, json={
            "target_career": "Cloud Engineer",
            "force_regenerate": True
        })
        self.assertEqual(pipe_res.status_code, 200)
        p_data = pipe_res.json()
        self.assertEqual(p_data["target_career"], "Cloud Engineer")
        self.assertEqual(len(p_data["pipeline_steps"]), 5)
        self.assertGreater(p_data["total_latency_ms"], 0)
        self.assertIn("skill_analysis", p_data)
        self.assertIn("career_matching", p_data)
        self.assertIn("roadmap", p_data)

        act_res = self.client.get("/api/agents/activity", headers=headers)
        self.assertEqual(act_res.status_code, 200)
        activities = act_res.json()
        self.assertGreater(len(activities), 0)

    def test_11_admin_rbac_and_management(self):
        # Student should be denied access to admin endpoints
        student_login = self.client.post("/api/auth/login", json={
            "email": "alex.morgan@university.edu",
            "password": "student12345"
        })
        student_token = student_login.json()["access_token"]
        denied_res = self.client.get("/api/admin/stats", headers={"Authorization": f"Bearer {student_token}"})
        self.assertEqual(denied_res.status_code, 403)

        # Admin should have full access
        admin_login = self.client.post("/api/auth/login", json={
            "email": "admin@aicareerpath.io",
            "password": "admin12345"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        stats_res = self.client.get("/api/admin/stats", headers=admin_headers)
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.json()
        self.assertGreaterEqual(stats["overview"]["total_users"], 2)
        self.assertEqual(stats["overview"]["total_career_roles"], 9)

        users_res = self.client.get("/api/admin/users", headers=admin_headers)
        self.assertEqual(users_res.status_code, 200)
        self.assertGreaterEqual(len(users_res.json()), 2)

        roles_res = self.client.get("/api/admin/career-roles", headers=admin_headers)
        self.assertEqual(roles_res.status_code, 200)
        self.assertEqual(len(roles_res.json()), 9)

if __name__ == "__main__":
    unittest.main(verbosity=2)
