import urllib.request
import json
import sqlite3
import time
from app.config import DB_PATH

base = 'http://127.0.0.1:8000/api'
ts = int(time.time())

def request(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, method=method, headers=headers)
    if data is not None:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {'detail': body}

def run_tests():
    print('=== STARTING CRITICAL CUSTOM SKILL VERIFICATION TEST SUITE ===')

    # Step 1: Register and Login User A
    user_a_email = f'user_a_{ts}@career.io'
    status, reg_a = request(f'{base}/auth/register', method='POST', data={
        'email': user_a_email,
        'password': 'Password123!',
        'full_name': 'Alice User A'
    })
    assert status == 200, f'User A registration failed: {reg_a}'
    token_a = reg_a['access_token']
    user_a_id = reg_a['user']['id']
    print(f'[Step 1 PASS] User A registered & logged in (ID: {user_a_id}, Email: {user_a_email})')

    # Step 2 & 3: Manually type custom skills (including non-catalog ones!) with proficiency percentages
    custom_skills = [
        ('Python', 75, 'Programming Languages'),
        ('Communication', 85, 'Soft Skills'),
        ('Problem Solving', 90, 'Soft Skills'),
        ('React.js', 45, 'Frontend')
    ]

    saved_records_a = []
    for name, pct, cat in custom_skills:
        status, res = request(f'{base}/skills/user', method='POST', token=token_a, data={
            'skill_name': name,
            'proficiency_percentage': pct,
            'category': cat
        })
        assert status == 201, f'Failed to add skill {name}: {res}'
        saved_records_a.append(res['skill'])
        print(f'[Step 2-4 PASS] Added skill: "{name}" at {pct}% ({cat}) -> DB Record ID: {res["skill"]["id"]}')

    # Step 4b: Test duplicate skill prevention for User A
    status, dup_res = request(f'{base}/skills/user', method='POST', token=token_a, data={
        'skill_name': 'python', # lowercase duplicate check
        'proficiency_percentage': 80
    })
    assert status == 400, f'Expected 400 for duplicate skill, got {status}: {dup_res}'
    print(f'[Duplicate Prevention PASS] Blocked duplicate skill: {dup_res["detail"]}')

    # Step 5 & 6: Simulate page refresh by fetching skills fresh from backend
    status, fetched_a = request(f'{base}/skills/user', method='GET', token=token_a)
    assert status == 200, f'Failed to fetch skills: {fetched_a}'
    assert len(fetched_a) == 4, f'Expected 4 skills, found {len(fetched_a)}'
    print(f'[Step 5 & 6 PASS] Page refresh verified! Fetched 4 persisted skills for User A:')
    for s in fetched_a:
        print(f'   -> ID #{s["id"]}: {s["skill_name"]} ({s["proficiency_percentage"]}%) | Created: {s.get("created_at")} | Updated: {s.get("updated_at")}')

    # Step 7 & 8: Edit skill name and percentage (rename React.js to React 19 Enterprise and change pct to 88)
    react_rec = next(s for s in fetched_a if 'React' in s['skill_name'])
    status, edit_res = request(f'{base}/skills/user/{react_rec["id"]}', method='PUT', token=token_a, data={
        'skill_name': 'React 19 Enterprise',
        'proficiency_percentage': 88,
        'category': 'Frontend'
    })
    assert status == 200, f'Failed to update skill: {edit_res}'
    print(f'[Step 7 PASS] Updated skill: {edit_res["message"]}')

    # Step 8b: Direct Database Record Verification for User A
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute('SELECT * FROM student_skills WHERE id = ? AND user_id = ?', (react_rec['id'], user_a_id))
    row = cur.fetchone()
    assert row is not None, 'Database row not found!'
    assert row['skill_name'] == 'React 19 Enterprise', f'DB skill_name was {row["skill_name"]}'
    assert row['proficiency_percentage'] == 88, f'DB proficiency_percentage was {row["proficiency_percentage"]}'
    assert row['created_at'] is not None, 'created_at is None in DB!'
    assert row['updated_at'] is not None, 'updated_at is None in DB!'
    print(f'[Step 8 PASS] Direct SQLite Database Verification confirmed:')
    print(f'   Record ID: {row["id"]}, User ID: {row["user_id"]}, Skill: {row["skill_name"]}, Pct: {row["proficiency_percentage"]}%, Created: {row["created_at"]}, Updated: {row["updated_at"]}')

    # Step 9: Delete skill (delete Problem Solving)
    ps_rec = next(s for s in fetched_a if s['skill_name'] == 'Problem Solving')
    status, del_res = request(f'{base}/skills/user/{ps_rec["id"]}', method='DELETE', token=token_a)
    assert status == 200, f'Delete failed: {del_res}'
    cur.execute('SELECT * FROM student_skills WHERE id = ?', (ps_rec['id'],))
    assert cur.fetchone() is None, 'Skill still exists in database after delete!'
    print(f'[Step 9 PASS] Deleted skill "Problem Solving" (ID #{ps_rec["id"]}), verified deleted from SQLite DB.')

    # Step 10: Register and Login User B
    user_b_email = f'user_b_{ts}@career.io'
    status, reg_b = request(f'{base}/auth/register', method='POST', data={
        'email': user_b_email,
        'password': 'Password123!',
        'full_name': 'Bob User B'
    })
    assert status == 200, f'User B registration failed: {reg_b}'
    token_b = reg_b['access_token']
    user_b_id = reg_b['user']['id']
    print(f'[Step 10 PASS] User B registered & logged in (ID: {user_b_id}, Email: {user_b_email})')

    # Add unique skills for User B
    status, res_b1 = request(f'{base}/skills/user', method='POST', token=token_b, data={
        'skill_name': 'Go Programming',
        'proficiency_percentage': 92,
        'category': 'Backend'
    })
    assert status == 201

    # Step 11: CRITICAL DATA ISOLATION VERIFICATION
    status, fetched_b = request(f'{base}/skills/user', method='GET', token=token_b)
    assert len(fetched_b) == 1, f'User B has unexpected skills: {fetched_b}'
    assert fetched_b[0]['skill_name'] == 'Go Programming'

    # Verify User B CANNOT see User A's skills
    user_b_skill_names = [s['skill_name'] for s in fetched_b]
    for user_a_skill in ['Python', 'Communication', 'React 19 Enterprise']:
        assert user_a_skill not in user_b_skill_names, f'Isolation leak! User B sees User A skill: {user_a_skill}'

    # Verify User B CANNOT edit or delete User A's skill
    status, illegal_edit = request(f'{base}/skills/user/{react_rec["id"]}', method='PUT', token=token_b, data={
        'skill_name': 'Hacked by User B',
        'proficiency_percentage': 10
    })
    assert status == 404, f'Expected 404 security rejection, got {status}: {illegal_edit}'

    status, illegal_del = request(f'{base}/skills/user/{react_rec["id"]}', method='DELETE', token=token_b)
    assert status == 404, f'Expected 404 security rejection on delete, got {status}: {illegal_del}'

    status, final_skills_a = request(f'{base}/skills/user', method='GET', token=token_a)
    print(f'[Step 11 PASS] 100% USER DATA ISOLATION VERIFIED:')
    print(f'   - User A sees only User A skills: {[s["skill_name"] for s in final_skills_a]}')
    print(f'   - User B sees only User B skills: {user_b_skill_names}')
    print(f'   - User B blocked from accessing, editing, or deleting User A skill records.')

    conn.close()
    print('\n*** ALL 11 TEST CRITERIA PASSED WITH 100% SUCCESS! ***')

if __name__ == '__main__':
    run_tests()
