# 🔌 CodeSahayak Frontend-Backend Integration Test Guide

## 🚀 Quick Start (1-Click Test)

### Option 1: Automated Test Script
```bash
# Run the automated test script
./start-integration-test.bat
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
cd web-ide
npx http-server . -p 5179 -o
```

## 🧪 Testing the Integration

### 1. Automated Integration Test
- Open: `http://localhost:5179/test-integration.html`
- Click "Run Complete Test" to verify all components
- Check console for detailed logs

### 2. Manual User Flow Test

#### Step 1: Create Account
1. Go to `http://localhost:5179/signup.html`
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com" 
   - Password: "test123"
   - Language: "Hindi"
3. Click "Create Account"
4. ✅ Should redirect to dashboard with success message

#### Step 2: Test IDE Features
1. Go to IDE tab in dashboard
2. Write code:
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

print(factorial(5))
```
3. Click "Run" → Should show output: `120`
4. Change tutor language to "हिंदी"
5. Click "Explain" → Should show Hindi explanation
6. Click "Save" → Enter title "My Factorial" → Should save successfully

#### Step 3: Test Library
1. Go to Library tab
2. Should see saved "My Factorial" snippet
3. Click on it to load in IDE

#### Step 4: Test Progress
1. Go to Progress tab  
2. Should show updated stats from your coding activity

## 🔍 Verification Checklist

### Backend API Endpoints
- [ ] `POST /api/auth/signup` - Creates user account
- [ ] `POST /api/auth/login` - Authenticates user
- [ ] `GET /api/auth/me` - Gets user profile
- [ ] `POST /api/ai/explain` - AI code explanation
- [ ] `POST /api/ai/hint` - AI hints
- [ ] `POST /api/code/save` - Saves code snippets
- [ ] `GET /api/code/mine` - Gets user's snippets
- [ ] `POST /api/progress/update` - Updates learning progress
- [ ] `GET /api/progress/stats` - Gets progress statistics

### Frontend Features
- [ ] User registration and login
- [ ] JWT token storage and management
- [ ] Code editor with syntax highlighting
- [ ] Code execution (mock)
- [ ] AI explanations in multiple languages
- [ ] Code saving and loading
- [ ] Progress tracking
- [ ] Responsive design
- [ ] Error handling and user feedback

### Integration Points
- [ ] Authentication flow (signup → login → dashboard)
- [ ] API error handling (401, 403, 500)
- [ ] Token expiration and refresh
- [ ] Multi-language AI responses
- [ ] Real-time progress updates
- [ ] Code persistence across sessions

## 🐛 Troubleshooting

### Common Issues

#### "Backend not responding"
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not running:
cd backend
npm install
npm start
```

#### "CORS errors in browser"
- Check backend console for CORS configuration
- Ensure frontend URL is in ALLOWED_ORIGINS

#### "Database locked" error
```bash
# Delete and recreate database
rm database/codesahayak.db
# Restart backend - it will recreate tables
```

#### "Token expired" errors
- Clear browser localStorage
- Login again
- Check JWT_SECRET in backend .env

#### "Hindi/Tamil not displaying"
- Check browser font support
- Verify language files in `web-ide/locales/`

### Debug Commands

#### Check Backend Health
```bash
curl http://localhost:3000/health
```

#### Test API Endpoints
```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Test login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### Check Database
```bash
# Install sqlite3 if needed
npm install -g sqlite3

# Check database contents
sqlite3 database/codesahayak.db
.tables
SELECT * FROM users;
SELECT * FROM code_snippets;
.quit
```

## 📊 Expected Test Results

### Successful Integration
```
✅ Backend Health - PASSED
✅ Authentication - PASSED  
✅ AI Explain - PASSED
✅ Save Code - PASSED
✅ Update Progress - PASSED

🏁 Test Summary
Passed: 5 | Failed: 0
Integration Status: ✅ FULLY WORKING
```

### Partial Success (Common)
```
✅ Backend Health - PASSED
✅ Authentication - PASSED
❌ AI Explain - FAILED: AI service timeout
✅ Save Code - PASSED
✅ Update Progress - PASSED

🏁 Test Summary  
Passed: 4 | Failed: 1
Integration Status: ⚠️ NEEDS ATTENTION
```

## 🎯 Next Steps After Successful Integration

### 1. Customize AI Responses
Edit `backend/src/services/AIService.js` to add:
- More programming concepts
- Cultural metaphors for Indian context
- Advanced explanations

### 2. Add More Languages
- Add new locale files in `web-ide/locales/`
- Update language selector in UI
- Add translations for new concepts

### 3. Deploy to Production
- Use Railway, Render, or Heroku for backend
- Use Netlify or Vercel for frontend
- Update API_BASE URL in `web-ide/js/api.js`

### 4. Add Advanced Features
- Real code execution (Docker containers)
- Video tutorials integration
- Peer-to-peer code sharing
- Teacher dashboard enhancements

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend terminal for error logs
3. Run the automated test page
4. Verify all dependencies are installed
5. Ensure ports 3000 and 5179 are available

## 🌟 Success Indicators

Your integration is working perfectly when:

- ✅ Users can signup and login seamlessly
- ✅ Code editor works with syntax highlighting
- ✅ AI explanations appear in selected language
- ✅ Code saves and loads from database
- ✅ Progress tracking updates in real-time
- ✅ No console errors or API failures
- ✅ Responsive design works on mobile

**Congratulations! Your CodeSahayak system is fully integrated and ready for students! 🎉**