@echo off
title AI CareerPath - Production Server
echo =====================================================================
echo  AI CareerPath: Premium AI-Powered Personalized Learning Platform
echo  PromptWars X RTC Hackathon 2026 Edition
echo =====================================================================
echo.
echo Starting unified full-stack server on http://127.0.0.1:8000 ...
echo Both API endpoints and React frontend SPA are served together!
echo.
set PYTHONPATH=%~dp0backend
"C:\Users\user\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
