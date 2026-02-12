@echo off
echo ========================================
echo   CodeSahayak - Starting Application
echo ========================================
echo.

echo Starting backend server...
start "CodeSahayak Backend" cmd /k "node backend/server.js"

timeout /t 3 /nobreak > nul

echo.
echo Opening application in browser...
start "" "http://localhost:8080/web-ide/main.html"

echo.
echo Starting frontend server...
cd web-ide
start "CodeSahayak Frontend" cmd /k "python -m http.server 8080"

echo.
echo ========================================
echo   CodeSahayak is now running!
echo ========================================
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:8080
echo ========================================
echo.
echo Press any key to stop all servers...
pause > nul

taskkill /FI "WindowTitle eq CodeSahayak*" /T /F
