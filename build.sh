#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "=============================================="
echo "== ORBIT AI - AI CAREERPATH PRODUCTION BUILD =="
echo "=============================================="

# 1. Install Python Backend Dependencies
echo "[1/2] Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 2. Build Frontend React Bundle
echo "[2/2] Installing frontend dependencies & building production bundle..."
cd frontend
npm install
npm run build
cd ..

echo "Build finished successfully! Ready for Uvicorn server startup."
