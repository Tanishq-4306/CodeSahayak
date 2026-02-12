@echo off
echo 🚀 Starting CodeSahayak Integration Test
echo.

echo 📁 Current directory: %CD%
echo.

echo 🔧 Step 1: Starting Backend Server...
start "CodeSahayak Backend" cmd /k "cd backend && npm start"
timeout /t 3

echo 🌐 Step 2: Starting Frontend Server...
start "CodeSahayak Frontend" cmd /k "cd web-ide && npx http-server . -p 5179 -o"
timeout /t 3

echo 🧪 Step 3: Opening Integration Test Page...
timeout /t 5
start http://localhost:5179/test-integration.html

echo.
echo ✅ Integration test environment started!
echo.
echo 📋 What's running:
echo   - Backend API: http://localhost:3000
echo   - Frontend: http://localhost:5179
echo   - Test Page: http://localhost:5179/test-integration.html
echo.
echo 🔍 To test manually:
echo   1. Go to http://localhost:5179/signup.html
echo   2. Create account: test@example.com / test123
echo   3. Go to dashboard and try the IDE
echo.
echo Press any key to exit...
pause >nul