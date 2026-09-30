@echo off
echo ============================================================
echo         SNAPMIND AI — ENVIRONMENT & DEPENDENCY SETUP         
echo ============================================================

echo [1/3] Setting up Python Virtual Environment...
if not exist "backend\venv" (
    python -m venv backend\venv
)

echo [2/3] Installing Python Backend Dependencies...
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt

echo [3/3] Installing Frontend NPM Packages...
cd frontend
call npm install
cd ..

echo ============================================================
echo Setup complete! Run start.bat to launch SnapMind AI.
echo ============================================================
