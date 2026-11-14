import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import HOST, PORT
from app.database import init_db
from app.seed_data import seed_database
from app.routes import (
    auth_routes,
    profile_routes,
    dashboard_routes,
    agent_routes,
    roadmap_routes,
    assessment_routes,
    mentor_routes,
    resources_routes,
    admin_routes,
    curriculum_routes,
    document_routes,
    skill_routes
)

app = FastAPI(
    title="ORBIT AI - AI CareerPath API",
    description="Futuristic AI-Powered Personalized Learning & Career Guidance Platform with Interactive Orbital Universe and 6 Collaborating AI Agents",
    version="3.0.0"
)

# Enable CORS for local dev servers (Vite on port 5173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(agent_routes.router)
app.include_router(roadmap_routes.router)
app.include_router(assessment_routes.router)
app.include_router(mentor_routes.router)
app.include_router(resources_routes.router)
app.include_router(admin_routes.router)
app.include_router(curriculum_routes.router)
app.include_router(document_routes.router)
app.include_router(skill_routes.router)

@app.on_event("startup")
def on_startup():
    print("ORBIT AI CareerPath backend booting up...")
    seed_database()
    print("ORBIT AI CareerPath backend is fully ready!")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ORBIT AI Core API",
        "concept": "ORBIT Interactive Career Universe",
        "agents": "ORBIT Multi-Agent Orchestrator Online (6 Agents Active)",
        "version": "3.0.0"
    }

# Check if built frontend dist exists to serve as static files
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
