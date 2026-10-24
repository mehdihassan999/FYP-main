@echo off
cd /d "%~dp0\backend"
echo Activating virtual environment...
call .\.venv\Scripts\activate.bat
echo Starting CyberX Backend on http://localhost:5000...
python app.py
pause
