#scripts/activate_and_run.bat
@echo off
setlocal

echo ============================================
echo     HYBRID CASE STUDY EVALUATOR (Windows)
echo ============================================

cd /d "%~dp0"
cd ..

REM ---------- CHECK PYTHON ----------
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo Python is not installed or not in PATH.
    pause
    exit /b
)

REM ---------- CREATE VENV IF MISSING ----------
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM ---------- ACTIVATE VENV ----------
call venv\Scripts\activate

REM ---------- INSTALL DEPENDENCIES ON FIRST RUN ----------
if not exist "venv\installed.flag" (
    echo Installing required packages...
    pip install --upgrade pip
    pip install -r requirements.txt
    echo > venv\installed.flag
)

REM ---------- RUN THE EVALUATOR ----------
echo Running evaluator...
python -m src.main

echo.
echo Done.
pause
