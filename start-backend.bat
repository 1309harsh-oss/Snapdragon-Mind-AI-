@echo off
echo Starting SnapMind AI Backend Engine...
set PYTHONPATH=backend
backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
