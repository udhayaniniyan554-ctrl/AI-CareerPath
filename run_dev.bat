@echo off
title AI CareerPath - Vite Dev Server
echo =====================================================================
echo  AI CareerPath: Vite React Hot-Module-Replacement Dev Server
echo =====================================================================
echo.
cd /d "%~dp0frontend"
set PATH=C:\Users\user\.local\node-v20.18.0-win-x64;%PATH%
npm run dev
pause
