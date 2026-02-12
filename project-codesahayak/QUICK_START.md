# CodeSahayak - Quick Start Guide

## 🚀 Start the Application

### Option 1: Automated Start (Windows)
```bash
# Double-click or run:
START_APP.bat
```

### Option 2: Manual Start

**Step 1: Start Backend**
```bash
# Open terminal in project-codesahayak directory
node backend/server.js
```

**Step 2: Start Frontend Server**
```bash
# Open another terminal
cd web-ide
python -m http.server 8080

# Or use Node.js
npx http-server -p 8080
```

**Step 3: Open Application**
```
Open browser and go to:
http://localhost:8080/main.html
```

### Option 3: Direct File Access (Limited)
```bash
# Open directly in browser (some features may not work)
web-ide/main.html
```

## 📝 First Time Setup

1. **Create Account**
   - Click "Get Started" or "Sign Up"
   - Enter your details
   - Select preferred language (Hindi, Tamil, etc.)
   - Click "Sign Up"

2. **Explore Dashboard**
   - View your stats
   - Check streak calendar
   - See concept mastery

3. **Start Coding**
   - Click "Start Coding" or navigate to IDE
   - Write your first program
   - Click "Run" or press Ctrl+Enter
   - Ask AI for help with "Explain" button

4. **Test Offline Mode**
   - Disconnect internet
   - Continue coding
   - Reconnect to auto-sync

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <PID> /F
```

### Frontend server issues
```bash
# Try different port
python -m http.server 8081

# Or use Node.js
npx http-server -p 8081
```

### Database errors
```bash
# Delete and recreate database
del database\codesahayak.db
# Restart backend server
```

## 📱 Features to Test

- [x] Sign up / Login
- [x] Dashboard with stats
- [x] Code editor
- [x] AI explanations
- [x] Progressive hints
- [x] Save code
- [x] View library
- [x] Track progress
- [x] Change settings
- [x] Offline mode
- [x] Language switching

## 🎯 Default Credentials

No default credentials - create your own account!

## 📞 Need Help?

Check the complete guide: `COMPLETE_IMPLEMENTATION_GUIDE.md`
