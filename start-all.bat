@echo off
echo ========================================
echo Starting Code Sahayak Application
echo ========================================
echo.

echo [1/4] Starting Gurujii AI API Server...
start "Gurujii API" cmd /k "cd gurujii-api && venv\Scripts\activate && python app.py"
timeout /t 5 /nobreak >nul

echo [2/4] Starting Backend Server...
start "Backend Server" cmd /k "cd app\backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/4] Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd app && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All servers started successfully!
echo ========================================
echo.
echo Gurujii API:  http://localhost:5000
echo Backend API:  http://localhost:3001
echo Frontend:     http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
