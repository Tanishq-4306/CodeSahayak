# CodeSahayak Ultra-Comprehensive System Design

## System Overview

CodeSahayak is a culturally-integrated, offline-first educational coding platform designed specifically for Indian students. The system provides AI-powered tutoring in 8 Indian languages with deep cultural context, comprehensive progress tracking, and a complete learning ecosystem.

## Architecture Principles

### 1. Offline-First Design
- Core functionality works without internet connectivity
- Intelligent synchronization when connection is restored
- Progressive Web App (PWA) capabilities for native-like experience
- IndexedDB for local data persistence

### 2. Cultural Integration
- 8 Indian languages with proper font rendering (Noto Sans family)
- Cultural metaphors in explanations (chai-wallah, banyan tree concepts)
- Indian flag colors in UI elements and animations
- Bharat map as offline indicator

### 3. Pedagogical Soundness
- 3-tier progressive hint system that never gives full solutions
- Mastery-based progress tracking with spaced repetition
- Gamification through streaks and achievements
- Error messages in student's mother tongue

## System Components

### Frontend Architecture

#### Core Layout Components
```
Header Component
├── Logo (🤖 CodeSahayak)
├── Navigation (Dashboard, IDE, Library, Progress, Achievements)
├── Language Selector (8 Indian languages + English)
├── User Menu (Profile, Settings, Logout)
└── Offline Indicator (Bharat map when offline)

Footer Component
├── Links (About, Contact, Privacy, Terms, Blog)
├── Social Media Links
└── Copyright Information

Toast Notification System
├── Success Notifications (Green with ✅)
├── Error Notifications (Red with ❌)
├── Warning Notifications (Yellow with ⚠️)
└── Info Notifications (Blue with ℹ️)
```

#### Authentication Components
```
LoginForm
├── Email Input (with validation)
├── Password Input (with show/hide toggle)
├── Remember Me Checkbox
├── Forgot Password Link
└── OAuth Buttons (Google, Facebook - future)

SignupForm
├── Name Input
├── Email Input (with validation)
├── Password Input (with strength indicator)
├── Confirm Password Input
├── Language Selector (defaults to browser language)
├── Terms Acceptance Checkbox
└── OAuth Buttons (Google, Facebook - future)

ForgotPasswordForm
├── Email Input
└── Send Reset Link Button

ResetPasswordForm
├── New Password Input
├── Confirm Password Input
└── Reset Button
```

#### IDE Components
```
CodeEditor
├── Line Numbers (auto-updating)
├── Syntax Highlighting (language-specific)
├── Auto-indentation
├── Bracket Matching
├── Code Folding
└── Keyboard Shortcuts (Ctrl+Enter=Run, Ctrl+S=Save)

OutputConsole
├── Color-coded Output (Success=Green, Error=Red, Info=Blue)
├── Execution Statistics (Time, Memory, Status)
├── Clear Button
└── Copy Output Button

SahayakTutorPanel
├── Avatar (Animated 🤖)
├── Language Badge (Current explanation language)
├── Explanation Display (Multilingual with proper fonts)
├── Cultural Metaphor Section
├── Hint System (3 progressive levels)
├── Common Mistakes Warnings
└── Action Buttons (Get Hint, Ask Question, More Details)

ActionBar
├── Run Button (▶️ with loading state)
├── Explain Button (🧠 with thinking animation)
├── Save Button (💾 with success feedback)
├── Hint Button (💡 with level indicator)
├── Debug Button (🐛 future feature)
└── Language Selector (Python, JavaScript, Java, C++, C)
```

#### Dashboard Components
```
StatsCards
├── Problems Solved (📊 with count animation)
├── Learning Hours (⏱️ with time formatting)
├── Streak Days (🔥 with flame animation)
└── Concepts Mastered (🎯 with progress fraction)

ConceptMasteryBars
├── Progress Bar (animated fill with gradient)
├── Percentage Display (real-time updates)
├── Concept Name (with emoji icons)
├── Recommendation Tags ("Practice More", "Excellent")
└── Click-to-Practice Action

RecentActivityList
├── Activity Items (with date, action, result)
├── Status Icons (✅ Success, ❌ Failed, 🔄 In Progress)
├── Click-to-Reopen Functionality
└── Time Ago Formatting

StreakCalendar
├── Date Grid (21-day view)
├── Active Days (green highlighting)
├── Today Indicator (orange border)
├── Future Days (grayed out)
├── Hover Tooltips (date, activity)
└── Motivational Message

AchievementsGrid
├── Achievement Badges (with unlock animations)
├── Progress Indicators (for locked achievements)
├── Celebration Effects (confetti on unlock)
├── Achievement Details (on hover/click)
└── Social Sharing (future feature)
```

#### Library Components
```
SnippetGrid
├── Search Bar (with filters and sorting)
├── Snippet Cards (preview, metadata, actions)
├── Pagination (for large collections)
├── Empty State (when no snippets)
└── Bulk Actions (select multiple, delete, export)

SnippetCard
├── Title and Description
├── Code Preview (syntax highlighted)
├── Language Badge
├── Tags (clickable for filtering)
├── Creation Date
├── Action Menu (Edit, Delete, Export, Share)
└── Quick Actions (Copy, Run in IDE)

SnippetDetailModal
├── Full Code Display (with copy button)
├── Metadata (title, description, tags, date)
├── Edit Mode (inline editing)
├── Version History (future feature)
├── Comments Section (future feature)
└── Export Options (various formats)
```

#### Settings Components
```
ProfileForm
├── Name Input
├── Email Input (with verification status)
├── College/Institution Input
├── Year of Study Selector
├── Profile Picture Upload (future)
└── Save Changes Button

PasswordForm
├── Current Password Input
├── New Password Input (with strength meter)
├── Confirm New Password Input
├── Password Requirements Display
└── Change Password Button

LanguageRegionForm
├── Interface Language Selector (UI language)
├── Content Language Selector (explanation language)
├── Region Selector (for cultural context)
├── Font Preference (for supported scripts)
└── Apply Changes Button

IDEPreferencesForm
├── Theme Selector (Dark, Light, High Contrast)
├── Font Family Selector (for code editor)
├── Font Size Slider
├── Tab Size Selector
├── Auto-save Toggle
├── Keyboard Shortcuts Customization
└── Reset to Defaults Button

NotificationForm
├── Email Notifications Toggle
├── Browser Notifications Toggle
├── Achievement Notifications Toggle
├── Progress Reminders Toggle
├── Weekly Summary Toggle
└── Save Preferences Button

PrivacyForm
├── Data Collection Preferences
├── Analytics Opt-out Toggle
├── Download My Data Button
├── Delete Account Button (with confirmation)
└── Privacy Policy Link
```

### Backend Architecture

#### API Layer Structure
```
Authentication Service
├── POST /api/auth/signup
├── POST /api/auth/login
├── GET /api/auth/me
├── PUT /api/auth/profile
├── PUT /api/auth/password
├── PUT /api/auth/language
├── POST /api/auth/forgot-password
└── POST /api/auth/reset-password

Code Management Service
├── POST /api/code/save
├── GET /api/code/mine
├── GET /api/code/:id
├── PUT /api/code/:id
├── DELETE /api/code/:id
├── GET /api/code/search
├── GET /api/code/language/:lang
└── GET /api/code/export/:id

AI Tutor Service
├── POST /api/ai/explain
├── POST /api/ai/hint
├── POST /api/ai/error-explain
├── POST /api/ai/concept-explain
└── POST /api/ai/quiz (future)

Progress Tracking Service
├── POST /api/progress/update
├── GET /api/progress/stats
├── GET /api/progress/detailed
├── GET /api/progress/recommendations
└── GET /api/progress/export
```

#### Database Schema Design

```sql
-- Users table with comprehensive profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    college VARCHAR(255),
    year_of_study INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_picture_url VARCHAR(500)
);

-- Code snippets with rich metadata
CREATE TABLE code_snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    tags TEXT[], -- PostgreSQL array for tags
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMP
);

-- Progress tracking with detailed metrics
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept VARCHAR(100) NOT NULL,
    attempts INTEGER DEFAULT 0,
    solved BOOLEAN DEFAULT FALSE,
    hints_used INTEGER DEFAULT 0,
    mastery_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, concept)
);

-- Concepts master table for curriculum
CREATE TABLE concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name JSONB NOT NULL, -- Multilingual display names
    description JSONB NOT NULL, -- Multilingual descriptions
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    prerequisites TEXT[], -- Array of prerequisite concept names
    examples JSONB, -- Code examples in different languages
    cultural_metaphors JSONB, -- Cultural explanations by language
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for analytics
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    pages_visited TEXT[],
    actions_performed JSONB,
    device_info JSONB
);

-- Achievements system
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name JSONB NOT NULL,
    description JSONB NOT NULL,
    icon VARCHAR(10) NOT NULL,
    criteria JSONB NOT NULL, -- Conditions for unlocking
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);
```

### AI Tutor System Design

#### Explanation Generation Pipeline
```
Code Analysis
├── Language Detection (Python, JavaScript, Java, C++, C)
├── Concept Identification (loops, functions, variables, etc.)
├── Complexity Assessment (beginner, intermediate, advanced)
├── Error Detection (syntax, logic, runtime)
└── Context Extraction (surrounding code, variable names)

Cultural Context Integration
├── Language Selection (based on user preference)
├── Metaphor Selection (from cultural_metaphors table)
├── Regional Adaptation (North Indian vs South Indian contexts)
├── Script Rendering (Devanagari, Tamil, Bengali, etc.)
└── Cultural Validation (appropriate and respectful)

Response Generation
├── Base Explanation (technical accuracy)
├── Cultural Metaphor Integration
├── Difficulty Appropriate Language
├── Interactive Elements (questions, examples)
└── Follow-up Suggestions
```

#### Progressive Hint System
```
Level 1: Conceptual Hints
├── High-level approach explanation
├── Problem-solving strategy
├── Relevant concept identification
└── Cultural analogy introduction

Level 2: Structural Hints
├── Code structure guidance
├── Algorithm steps outline
├── Function/method suggestions
└── Best practices reminders

Level 3: Implementation Hints
├── Specific syntax help
├── Variable naming suggestions
├── Logic flow guidance
└── Debugging tips

Never Level 4: Full Solution
├── Complete code is never provided
├── Students must implement themselves
├── Learning integrity maintained
└── Problem-solving skills developed
```

### Offline-First Architecture

#### Service Worker Strategy
```javascript
// Cache Strategy Implementation
const CACHE_STRATEGIES = {
  'static-assets': 'cache-first',     // CSS, JS, fonts
  'api-data': 'network-first',        // User data, progress
  'explanations': 'stale-while-revalidate', // AI explanations
  'user-content': 'network-only'     // Code saves, updates
};

// Offline Queue Management
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }
  
  queueAction(action) {
    if (!this.isOnline) {
      this.queue.push({
        ...action,
        timestamp: Date.now(),
        retryCount: 0
      });
      this.saveToIndexedDB();
    }
  }
  
  async syncWhenOnline() {
    if (this.isOnline && this.queue.length > 0) {
      for (const action of this.queue) {
        try {
          await this.executeAction(action);
          this.removeFromQueue(action);
        } catch (error) {
          action.retryCount++;
          if (action.retryCount > 3) {
            this.removeFromQueue(action);
          }
        }
      }
    }
  }
}
```

#### Local Data Management
```javascript
// IndexedDB Schema for Offline Storage
const DB_SCHEMA = {
  name: 'CodeSahayakDB',
  version: 1,
  stores: {
    'user-profile': { keyPath: 'id' },
    'code-snippets': { keyPath: 'id' },
    'progress-data': { keyPath: 'concept' },
    'explanations-cache': { keyPath: 'codeHash' },
    'offline-queue': { keyPath: 'id', autoIncrement: true },
    'achievements': { keyPath: 'id' },
    'settings': { keyPath: 'key' }
  }
};

// Offline Data Synchronization
class DataSync {
  async syncUserData() {
    const localData = await this.getLocalData();
    const serverData = await this.getServerData();
    
    // Conflict resolution strategy
    const mergedData = this.mergeWithConflictResolution(
      localData, 
      serverData
    );
    
    await this.updateLocal(mergedData);
    await this.updateServer(mergedData);
  }
  
  mergeWithConflictResolution(local, server) {
    // Last-write-wins for most data
    // Additive for progress (max values)
    // User preference for settings conflicts
    return {
      ...server,
      ...local,
      progress: this.mergeProgress(local.progress, server.progress),
      settings: this.mergeSettings(local.settings, server.settings)
    };
  }
}
```

### Multilingual System Design

#### Language Support Matrix
```
Supported Languages:
├── Hindi (hi) - Devanagari script
├── Tamil (ta) - Tamil script
├── Bengali (bn) - Bengali script
├── Marathi (mr) - Devanagari script
├── Telugu (te) - Telugu script
├── Gujarati (gu) - Gujarati script
├── Kannada (kn) - Kannada script
├── Punjabi (pa) - Gurmukhi script
└── English (en) - Latin script

Font Loading Strategy:
├── Noto Sans family for all Indian scripts
├── Subset fonts for performance
├── Fallback fonts for unsupported characters
└── Dynamic loading based on selected language
```

#### Translation System
```javascript
// Translation Management
class TranslationManager {
  constructor() {
    this.translations = new Map();
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
  }
  
  async loadLanguage(languageCode) {
    if (!this.translations.has(languageCode)) {
      const translations = await this.fetchTranslations(languageCode);
      this.translations.set(languageCode, translations);
    }
    
    this.currentLanguage = languageCode;
    this.updateUI();
  }
  
  translate(key, params = {}) {
    const translations = this.translations.get(this.currentLanguage) ||
                        this.translations.get(this.fallbackLanguage);
    
    let text = translations[key] || key;
    
    // Parameter substitution
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    
    return text;
  }
  
  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.translate(key);
    });
  }
}
```

### Security & Privacy Design

#### Authentication & Authorization
```javascript
// JWT Token Management
class AuthManager {
  constructor() {
    this.token = localStorage.getItem('codesahayak_token');
    this.refreshToken = localStorage.getItem('codesahayak_refresh');
    this.tokenExpiry = localStorage.getItem('codesahayak_token_expiry');
  }
  
  async authenticateRequest(request) {
    if (this.isTokenExpired()) {
      await this.refreshAuthToken();
    }
    
    request.headers.Authorization = `Bearer ${this.token}`;
    return request;
  }
  
  async refreshAuthToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      const { token, refreshToken, expiresIn } = await response.json();
      
      this.updateTokens(token, refreshToken, expiresIn);
    } catch (error) {
      this.logout();
      throw new Error('Authentication failed');
    }
  }
}

// Data Privacy Controls
class PrivacyManager {
  async exportUserData(userId) {
    const userData = {
      profile: await this.getUserProfile(userId),
      codeSnippets: await this.getUserSnippets(userId),
      progress: await this.getUserProgress(userId),
      achievements: await this.getUserAchievements(userId)
    };
    
    return this.generateExportFile(userData);
  }
  
  async deleteUserData(userId) {
    // Soft delete with anonymization after 30 days
    await this.softDeleteUser(userId);
    
    // Schedule anonymization job
    await this.scheduleAnonymization(userId, 30);
  }
}
```

### Performance Optimization

#### Frontend Performance
```javascript
// Code Splitting Strategy
const routes = {
  '/': () => import('./pages/Landing.js'),
  '/dashboard': () => import('./pages/Dashboard.js'),
  '/ide': () => import('./pages/IDE.js'),
  '/library': () => import('./pages/Library.js'),
  '/progress': () => import('./pages/Progress.js'),
  '/settings': () => import('./pages/Settings.js')
};

// Lazy Loading Components
class ComponentLoader {
  static async loadComponent(componentName) {
    const component = await import(`./components/${componentName}.js`);
    return component.default;
  }
  
  static preloadCriticalComponents() {
    // Preload components likely to be used soon
    this.loadComponent('SahayakTutorPanel');
    this.loadComponent('CodeEditor');
    this.loadComponent('OutputConsole');
  }
}

// Image Optimization
class ImageOptimizer {
  static generateResponsiveImage(src, alt, sizes) {
    return `
      <picture>
        <source media="(max-width: 768px)" srcset="${src}?w=400&f=webp">
        <source media="(max-width: 1200px)" srcset="${src}?w=800&f=webp">
        <img src="${src}?w=1200&f=webp" alt="${alt}" loading="lazy">
      </picture>
    `;
  }
}
```

#### Backend Performance
```javascript
// Database Query Optimization
class QueryOptimizer {
  static async getUserDashboardData(userId) {
    // Single query to get all dashboard data
    const query = `
      SELECT 
        u.name, u.language,
        COUNT(DISTINCT cs.id) as snippet_count,
        COUNT(DISTINCT p.concept) as concepts_learned,
        AVG(p.mastery_score) as avg_mastery,
        MAX(p.last_attempt) as last_activity
      FROM users u
      LEFT JOIN code_snippets cs ON u.id = cs.user_id
      LEFT JOIN progress p ON u.id = p.user_id
      WHERE u.id = $1 AND u.deleted_at IS NULL
      GROUP BY u.id, u.name, u.language
    `;
    
    return await db.query(query, [userId]);
  }
}

// Caching Strategy
class CacheManager {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.defaultTTL = 3600; // 1 hour
  }
  
  async cacheExplanation(codeHash, explanation) {
    await this.redis.setex(
      `explanation:${codeHash}`, 
      this.defaultTTL * 24, // 24 hours for explanations
      JSON.stringify(explanation)
    );
  }
  
  async getCachedExplanation(codeHash) {
    const cached = await this.redis.get(`explanation:${codeHash}`);
    return cached ? JSON.parse(cached) : null;
  }
}
```

## Correctness Properties

### Property 1: Authentication Integrity
**Validates: Requirements US-1.2.1, US-1.2.2**
```javascript
// Property: All authenticated requests must have valid JWT tokens
function testAuthenticationIntegrity(request) {
  if (isProtectedRoute(request.url)) {
    const token = extractToken(request.headers.authorization);
    assert(isValidJWT(token), "Protected routes require valid JWT");
    assert(!isTokenExpired(token), "Token must not be expired");
    assert(userExists(token.userId), "Token user must exist in database");
  }
}
```

### Property 2: Data Consistency
**Validates: Requirements US-3.1.1, US-3.1.2**
```javascript
// Property: Progress data must be consistent across all views
function testProgressConsistency(userId) {
  const dashboardStats = getDashboardStats(userId);
  const detailedProgress = getDetailedProgress(userId);
  
  const calculatedTotal = detailedProgress.reduce((sum, concept) => 
    sum + (concept.solved ? 1 : 0), 0);
  
  assert(dashboardStats.solved_concepts === calculatedTotal,
    "Dashboard stats must match detailed progress");
}
```

### Property 3: Multilingual Correctness
**Validates: Requirements US-2.1.1, US-2.1.2**
```javascript
// Property: All UI text must be properly translated
function testMultilingualCorrectness(language) {
  const translations = loadTranslations(language);
  const uiElements = document.querySelectorAll('[data-i18n]');
  
  uiElements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    assert(translations[key] !== undefined, 
      `Translation missing for key: ${key} in language: ${language}`);
    assert(translations[key].length > 0,
      `Translation empty for key: ${key} in language: ${language}`);
  });
}
```

### Property 4: Offline Synchronization
**Validates: Requirements US-4.1.1, US-4.1.2**
```javascript
// Property: Offline actions must sync correctly when online
function testOfflineSynchronization(offlineActions) {
  const initialState = getCurrentState();
  
  // Simulate offline actions
  offlineActions.forEach(action => queueOfflineAction(action));
  
  // Simulate going online and syncing
  simulateOnlineSync();
  
  const finalState = getCurrentState();
  const expectedState = applyActions(initialState, offlineActions);
  
  assert(deepEqual(finalState, expectedState),
    "Final state must match expected state after sync");
}
```

### Property 5: Hint System Integrity
**Validates: Requirements US-2.2.1, US-2.2.2, US-2.2.3**
```javascript
// Property: Hint system must never provide complete solutions
function testHintSystemIntegrity(code, hints) {
  hints.forEach((hint, level) => {
    assert(hint.length < code.length * 0.5,
      `Hint level ${level + 1} must be shorter than half the original code`);
    
    assert(!isCompleteSolution(hint, code),
      `Hint level ${level + 1} must not be a complete solution`);
    
    assert(isHelpful(hint, code),
      `Hint level ${level + 1} must provide meaningful guidance`);
  });
}
```

## Testing Framework

### Property-Based Testing Setup
```javascript
// Using fast-check for property-based testing
import fc from 'fast-check';

// Test data generators
const userGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  language: fc.constantFrom('hi', 'ta', 'bn', 'en', 'mr', 'te', 'gu', 'kn'),
  password: fc.string({ minLength: 6, maxLength: 50 })
});

const codeGenerator = fc.record({
  code: fc.string({ minLength: 10, maxLength: 1000 }),
  language: fc.constantFrom('python', 'javascript', 'java', 'cpp', 'c'),
  title: fc.string({ minLength: 1, maxLength: 100 })
});

// Property tests
describe('CodeSahayak Properties', () => {
  it('should maintain authentication integrity', () => {
    fc.assert(fc.property(userGenerator, testAuthenticationIntegrity));
  });
  
  it('should maintain data consistency', () => {
    fc.assert(fc.property(fc.uuid(), testProgressConsistency));
  });
  
  it('should handle multilingual content correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('hi', 'ta', 'bn', 'en'),
      testMultilingualCorrectness
    ));
  });
});
```

This comprehensive design document provides the foundation for implementing the ultra-comprehensive CodeSahayak system with all 15 pages, complete API ecosystem, offline-first architecture, and deep cultural integration as specified in your blueprint.