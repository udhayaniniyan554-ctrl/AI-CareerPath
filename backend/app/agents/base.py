import time
import json
import os
from typing import Dict, Any, Optional
from app.database import get_db
from app.config import GEMINI_API_KEY

class BaseAgent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.api_key = GEMINI_API_KEY

    def log_activity(
        self,
        user_id: Optional[int],
        task_name: str,
        input_summary: str,
        output_summary: str,
        details: Dict[str, Any],
        latency_ms: int,
        status: str = "SUCCESS"
    ):
        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO agent_activity_logs 
                    (user_id, agent_name, task_name, input_summary, output_summary, details_json, latency_ms, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_id,
                    self.name,
                    task_name,
                    input_summary,
                    output_summary,
                    json.dumps(details, default=str),
                    latency_ms,
                    status
                ))
        except Exception as e:
            print(f"Error logging agent activity for {self.name}: {e}")

    def call_llm(self, prompt: str, system_instruction: str = "") -> Optional[str]:
        """
        Attempts to call Google Gemini API if key is available;
        returns None if key is missing or call fails, gracefully delegating to intelligent heuristic reasoning.
        """
        if not self.api_key:
            return None
        
        try:
            import urllib.request
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [{
                    "role": "user",
                    "parts": [{"text": f"System Context: {system_instruction}\n\nTask:\n{prompt}"}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                return res_data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to internal heuristic engine.")
            return None
