import json
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/resources", tags=["Learning Resources"])

@router.get("", response_model=List[Dict[str, Any]])
def list_resources(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT resource_id FROM saved_resources WHERE user_id = ?", (user_id,))
        saved_set = {r["resource_id"] for r in cursor.fetchall()}

        cursor.execute("SELECT * FROM learning_resources ORDER BY rating DESC, id ASC")
        resources = cursor.fetchall()

    result = []
    for r in resources:
        item = dict(r)
        item["is_saved"] = r["id"] in saved_set
        item["is_free"] = bool(r["is_free"])
        result.append(item)
    return result

@router.post("/{resource_id}/save")
def toggle_save_resource(resource_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM saved_resources WHERE user_id = ? AND resource_id = ?", (user_id, resource_id))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("DELETE FROM saved_resources WHERE id = ?", (existing["id"],))
            saved = False
            message = "Resource removed from saved bookmarks."
        else:
            cursor.execute("INSERT INTO saved_resources (user_id, resource_id) VALUES (?, ?)", (user_id, resource_id))
            saved = True
            message = "Resource saved to your bookmarks."

    return {"resource_id": resource_id, "is_saved": saved, "message": message}

@router.get("/saved", response_model=List[Dict[str, Any]])
def get_saved_resources(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT lr.*, sr.saved_at
            FROM saved_resources sr
            JOIN learning_resources lr ON sr.resource_id = lr.id
            WHERE sr.user_id = ?
            ORDER BY sr.saved_at DESC
        """, (user_id,))
        rows = cursor.fetchall()

    result = []
    for r in rows:
        item = dict(r)
        item["is_saved"] = True
        item["is_free"] = bool(r["is_free"])
        result.append(item)
    return result
