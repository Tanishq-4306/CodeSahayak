@echo off
echo ========================================
echo   CodeSahayak Complete System Launcher
echo ========================================
echo.

REM Check if backend is already running
echo Checking backend status...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is already running
) else (
    echo [INFO] Starting backend server...
    start "CodeSahayak Backend" cmd /k "cd backend && node server.js"
    echo Waiting for backend to start...
    timeout /t 3 /nobreak >nul
)

echo.
echo [INFO] Opening test dashboard in browser...
timeout /t 2 /nobreak >nul

REM Open test dashboard
start "" "test-complete-system.html"

echo.
echo ========================================
echo   System Status
echo ========================================
echo Backend:  http://localhost:3000
echo Frontend: Open test-complete-system.html
echo.
echo The test dashboard will help you:
echo - Verify all systems are working
echo - Run comprehensive tests
echo - Launch the application
echo.
echo Press any key to exit...
pause >nul
