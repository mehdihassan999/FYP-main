@echo off
title CyberX Security Suite
echo ===================================================
echo Starting CyberX Advanced Security Suite...
echo ===================================================

echo [1/3] Starting Backend (Python Flask + Socket.IO)...
start "CyberX Backend" cmd /k "cd /d "%~dp0backend" && if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe app.py) else (python app.py)"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend (React + Vite)...
start "CyberX Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Opening CyberX Web Application in Browser...
start http://localhost:8081

echo ===================================================
echo CyberX is running!
echo - Frontend: http://localhost:8081
echo - Backend:  http://127.0.0.1:5000
echo ===================================================
