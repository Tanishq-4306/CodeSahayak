# CodeSahayak - Design Document

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Browser    │  │   Mobile     │  │   Tablet     │ │
│  │   (React)    │  │   (PWA)      │  │   (PWA)      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  API Gateway Layer                      │
│              (Express.js REST API)                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │   User   │  │  Progress │            │
│  │ Service  │  │ Service  │  │  Service  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Code   │  │    AI    │  │ Analytics │            │
│  │ Service  │  │  Service │  │  Service  │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   SQLite     │  │  Local       │  │   Cache      │ │
│  │   Database   │  │  Storage     │  │   (Redis)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── ide/                   # IDE-specific components
│   │   ├── CodeEditor.tsx
│   │   ├── Terminal.tsx
│   │   ├── FileExplorer.tsx
│   │   ├── AIAssistant.tsx
│   │   └── Toolbar.tsx
│   ├── Navbar.tsx
│   ├── MobileMenu.tsx
│   ├── OnboardingModal.tsx
│   └── TeacherModal.tsx
├── pages/
│   ├── AuthPage.tsx           # Login/Signup
│   ├── DashboardPage.tsx      # Student dashboard
│   ├── TeacherDashboardPage.tsx
│   ├── EditorPage.tsx         # Code editor
│   └── IDEPage.tsx            # Full IDE
├── sections/                  # Landing page sections
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── StudentsSection.tsx
│   ├── TeachersSection.tsx
│   └── ...
├── store/                     # State management
│   ├── authStore.ts
│   ├── ideStore.ts
│   ├── languageStore.ts
│   └── uiStore.ts
├── hooks/
│   ├── useAuth.ts
│   └── use-mobile.ts
└── lib/
    ├── utils.ts
    └── programmingLanguages.ts
```

### State Management (Zustand)

#### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}
```

#### IDE Store
```typescript
interface IDEStore {
  files: FileNode[];
  activeFile: string | null;
  code: string;
  language: ProgrammingLanguage;
  output: string;
  isRunning: boolean;
  setCode: (code: string) => void;
  runCode: () => Promise<void>;
}
```

#### Language Store
```typescript
interface LanguageStore {
  currentLanguage: LanguageCode;
  translations: Record<string, string>;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}
```

## Design System

### Color Palette

#### Primary Colors
- **Primary Blue**: `#2E86AB` - Main brand color
- **Teal Accent**: `#14b8a6` - Secondary accent
- **Orange Accent**: `#f59e0b` - Call-to-action
- **Dark Navy**: `#1A1D2B` - Text primary
- **Gray**: `#5A6078` - Text secondary

#### Background Colors
- **Light Background**: `#F6F7FB`
- **Card Background**: `#FFFFFF`
- **Hover State**: `#F0F4FA`
- **Border**: `#E8EAF6`

#### Status Colors
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Orange)
- **Info**: `#3b82f6` (Blue)

### Typography

#### Font Families
- **Body**: `'Poppins', sans-serif` - Clean, modern, readable
- **Headings**: `'Montserrat', sans-serif` - Bold, impactful
- **Hero**: `'Space Grotesk', monospace` - Tech-focused
- **Code**: `'Fira Code', 'Consolas', monospace` - Code editor

#### Font Sizes
- **Hero**: `3rem` (48px) - `4rem` (64px)
- **H1**: `2.5rem` (40px)
- **H2**: `2rem` (32px)
- **H3**: `1.5rem` (24px)
- **Body**: `1rem` (16px)
- **Small**: `0.875rem` (14px)
- **Tiny**: `0.75rem` (12px)

#### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Spacing System
Based on 4px base unit:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Border Radius
- **Small**: `0.5rem` (8px) - Buttons, inputs
- **Medium**: `0.75rem` (12px) - Cards
- **Large**: `1rem` (16px) - Modals
- **XL**: `1.5rem` (24px) - Hero sections
- **Full**: `9999px` - Pills, avatars

### Shadows
```css
/* Elevation levels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Animations

#### Keyframes
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(46, 134, 171, 0.3); }
  50% { box-shadow: 0 0 40px rgba(46, 134, 171, 0.6); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 200%; }
}
```

#### Transitions
- **Fast**: `150ms` - Hover states, clicks
- **Normal**: `300ms` - Modals, dropdowns
- **Slow**: `500ms` - Page transitions
- **Ease**: `cubic-bezier(0.4, 0, 0.2, 1)` - Default easing

### Button Styles

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #2E86AB 0%, #14b8a6 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(46, 134, 171, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: #2E86AB;
  border: 2px solid #2E86AB;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #2E86AB;
  color: white;
}
```

### Card Styles
```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
--mobile: 320px;      /* Small phones */
--sm: 640px;          /* Large phones */
--md: 768px;          /* Tablets */
--lg: 1024px;         /* Small laptops */
--xl: 1280px;         /* Desktops */
--2xl: 1536px;        /* Large screens */
```

### Touch Targets
- Minimum size: `44px × 44px` (Apple/Google guidelines)
- Spacing between targets: `8px` minimum
- Touch manipulation: `touch-action: manipulation`

### Mobile Optimizations
- Hamburger menu for navigation
- Collapsible sections
- Bottom navigation for key actions
- Swipe gestures support
- Reduced animations on low-end devices

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  language TEXT DEFAULT 'en',
  institution TEXT,
  department TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Progress Table
```sql
CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  code TEXT,
  language TEXT,
  attempts INTEGER DEFAULT 0,
  completed_at DATETIME,
  time_spent INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Assignments Table
```sql
CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  syllabus_code TEXT,
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

## API Design

### Authentication Endpoints
```
POST   /api/auth/signup      - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/me          - Get current user
PUT    /api/auth/profile     - Update profile
```

### Student Endpoints
```
GET    /api/problems         - Get problem list
GET    /api/problems/:id     - Get problem details
POST   /api/code/run         - Execute code
POST   /api/code/submit      - Submit solution
GET    /api/progress         - Get user progress
GET    /api/achievements     - Get achievements
```

### Teacher Endpoints
```
GET    /api/teacher/students - Get student list
GET    /api/teacher/analytics - Get class analytics
POST   /api/assignments      - Create assignment
GET    /api/assignments/:id  - Get assignment details
PUT    /api/assignments/:id  - Update assignment
```

### AI Endpoints
```
POST   /api/ai/explain       - Explain code
POST   /api/ai/debug         - Debug assistance
POST   /api/ai/suggest       - Code suggestions
```

## Security Considerations

### Authentication
- JWT tokens with 24-hour expiry
- Refresh token mechanism
- Password hashing with bcrypt (10 rounds)
- Rate limiting on auth endpoints

### Data Protection
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (Content Security Policy)
- CSRF tokens for state-changing operations

### API Security
- HTTPS only in production
- CORS configuration
- Request size limits
- API rate limiting (100 requests/minute)

## Performance Optimizations

### Frontend
- Code splitting and lazy loading
- Image optimization (WebP format)
- Tree shaking unused code
- Minification and compression
- Service Worker for caching
- Virtual scrolling for long lists

### Backend
- Database indexing
- Query optimization
- Response caching
- Connection pooling
- Compression middleware

## Accessibility Features

### WCAG 2.1 Compliance
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Skip navigation links
- Alt text for images
- Color contrast ratio > 4.5:1
- Screen reader compatibility

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save code
- `Ctrl/Cmd + Enter`: Run code
- `Ctrl/Cmd + /`: Toggle comment
- `Esc`: Close modals
- `Tab`: Navigate elements

## Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)         │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│  App Server  │        │  App Server  │
│   (Node.js)  │        │   (Node.js)  │
└──────────────┘        └──────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌─────────────────────┐
        │   Database (SQLite) │
        └─────────────────────┘
```

### CI/CD Pipeline
1. Code push to GitHub
2. Automated tests run
3. Build production bundle
4. Deploy to staging
5. Manual approval
6. Deploy to production
7. Health checks

## Monitoring & Analytics

### Metrics to Track
- Page load times
- API response times
- Error rates
- User engagement
- Feature usage
- Conversion rates
- System resource usage

### Tools
- Error tracking: Sentry
- Analytics: Google Analytics
- Performance: Lighthouse CI
- Uptime monitoring: UptimeRobot

## Future Technical Enhancements
- Microservices architecture
- GraphQL API
- Real-time collaboration (WebRTC)
- Kubernetes orchestration
- Machine learning for personalization
- Advanced caching strategies
- CDN integration
- Multi-region deployment
