@echo off
echo ========================================
echo   CodeSahayak Frontend Server
echo ========================================
echo.

cd web-ide

echo Starting HTTP server on port 8080...
echo.
echo Open your browser and go to:
echo http://localhost:8080/main.html
echo.
echo Or use the test dashboard:
echo http://localhost:8080/../test-complete-system.html
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP server...
    python -m http.server 8080
) else (
    REM Try Node.js http-server
    npx http-server --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js HTTP server...
        npx http-server -p 8080
    ) else (
        echo ERROR: Neither Python nor Node.js http-server found!
        echo.
        echo Please install one of the following:
        echo 1. Python: https://www.python.org/downloads/
        echo 2. Node.js: https://nodejs.org/
        echo.
        pause
    )
)
