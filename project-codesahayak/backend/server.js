const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../web-ide')));

// Database setup
const dbPath = path.join(__dirname, '../database/codesahayak.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database error:', err.message);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables with comprehensive schema
function createTables() {
    // Enhanced Users table with comprehensive profile information
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        college TEXT,
        year_of_study INTEGER,
        profile_picture_url TEXT,
        preferences TEXT DEFAULT '{}',
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        email_verified BOOLEAN DEFAULT 0,
        deleted_at DATETIME
    )`);

    // Enhanced Code snippets table with rich metadata
    db.run(`CREATE TABLE IF NOT EXISTS code_snippets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        code TEXT NOT NULL,
        language TEXT DEFAULT 'python',
        tags TEXT DEFAULT '',
        difficulty TEXT DEFAULT 'beginner',
        category TEXT DEFAULT 'general',
        is_public BOOLEAN DEFAULT 0,
        execution_count INTEGER DEFAULT 0,
        last_executed DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Enhanced Progress table with detailed metrics
    db.run(`CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        concept TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        solved BOOLEAN DEFAULT 0,
        hints_used INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        mastery_score REAL DEFAULT 0.0,
        difficulty TEXT DEFAULT 'beginner',
        category TEXT DEFAULT 'general',
        first_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, concept)
    )`);

    // Concepts master table for curriculum
    db.run(`CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
        prerequisites TEXT DEFAULT '[]',
        examples TEXT DEFAULT '{}',
        cultural_metaphors TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User sessions for analytics
    db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_end DATETIME,
        pages_visited TEXT DEFAULT '[]',
        actions_performed TEXT DEFAULT '{}',
        device_info TEXT DEFAULT '{}',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Achievements system
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        criteria TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id),
        UNIQUE(user_id, achievement_id)
    )`);

    // Password reset tokens
    db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Email verification tokens
    db.run(`CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Initialize default concepts and achievements
    setTimeout(() => {
        initializeDefaultData();
    }, 1000);
    
    console.log('Enhanced database schema created/verified');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'codesahayak_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'codesahayak_refresh_secret_2026';

// Initialize default concepts and achievements
function initializeDefaultData() {
    // Default programming concepts with cultural metaphors
    const concepts = [
        {
            id: uuidv4(),
            name: 'variables',
            display_name: JSON.stringify({
                en: 'Variables',
                hi: 'चर (Variables)',
                ta: 'மாறிகள்',
                bn: 'ভেরিয়েবল',
                mr: 'व्हेरिएबल्स',
                te: 'వేరియబల్స్',
                gu: 'વેરિયેબલ્સ',
                kn: 'ವೇರಿಯಬಲ್ಸ್'
            }),
            description: JSON.stringify({
                en: 'Storage containers for data in programming',
                hi: 'प्रोग्रामिंग में डेटा के लिए स्टोरेज कंटेनर',
                ta: 'நிரலாக்கத்தில் தரவுக்கான சேமிப்பு கொள்கலன்கள்',
                bn: 'প্রোগ্রামিংয়ে ডেটার জন্য স্টোরেজ কন্টেইনার',
                mr: 'प्रोग्रामिंगमध्ये डेटासाठी स्टोरेज कंटेनर',
                te: 'ప్రోగ్రామింగ్‌లో డేటా కోసం స్టోరేజ్ కంటైనర్లు',
                gu: 'પ્રોગ્રામિંગમાં ડેટા માટે સ્ટોરેજ કન્ટેનર',
                kn: 'ಪ್ರೋಗ್ರಾಮಿಂಗ್‌ನಲ್ಲಿ ಡೇಟಾಗಾಗಿ ಸಂಗ್ರಹಣೆ ಕಂಟೇನರ್‌ಗಳು'
            }),
            difficulty: 1,
            prerequisites: JSON.stringify([]),
            examples: JSON.stringify({
                python: 'name = "राम"\nage = 25',
                javascript: 'let name = "राम";\nlet age = 25;',
                java: 'String name = "राम";\nint age = 25;'
            }),
            cultural_metaphors: JSON.stringify({
                hi: 'वेरिएबल्स चाय के कप की तरह हैं - आप उनमें अलग-अलग चीजें रख सकते हैं',
                ta: 'மாறிகள் தேநீர் கப் போன்றவை - நீங்கள் அவற்றில் வெவ்வேறு விஷயங்களை வைக்கலாம்',
                bn: 'ভেরিয়েবল চায়ের কাপের মতো - আপনি তাতে বিভিন্ন জিনিস রাখতে পারেন'
            })
        },
        {
            id: uuidv4(),
            name: 'loops',
            display_name: JSON.stringify({
                en: 'Loops',
                hi: 'लूप्स',
                ta: 'சுழல்கள்',
                bn: 'লুপ',
                mr: 'लूप्स',
                te: 'లూప్స్',
                gu: 'લૂપ્સ',
                kn: 'ಲೂಪ್‌ಗಳು'
            }),
            description: JSON.stringify({
                en: 'Repetitive execution of code blocks',
                hi: 'कोड ब्लॉक्स का दोहराव',
                ta: 'குறியீடு தொகுதிகளின் மீண்டும் மீண்டும் செயல்படுத்தல்',
                bn: 'কোড ব্লকের পুনরাবৃত্তিমূলক সম্পাদন'
            }),
            difficulty: 2,
            prerequisites: JSON.stringify(['variables']),
            cultural_metaphors: JSON.stringify({
                hi: 'लूप्स बरगद के पेड़ की जड़ों की तरह हैं - वे तब तक बढ़ते रहते हैं जब तक शर्त पूरी न हो जाए',
                ta: 'சுழல்கள் ஆலமரத்தின் வேர்களைப் போன்றவை - நிபந்தனை பூர்த்தியாகும் வரை அவை வளர்ந்து கொண்டே இருக்கும்'
            })
        }
    ];

    // Default achievements
    const achievements = [
        {
            id: uuidv4(),
            name: 'first_code',
            display_name: JSON.stringify({
                en: 'First Steps',
                hi: 'पहला कदम',
                ta: 'முதல் படி',
                bn: 'প্রথম পদক্ষেপ'
            }),
            description: JSON.stringify({
                en: 'Wrote your first code!',
                hi: 'आपका पहला कोड लिखा!',
                ta: 'உங்கள் முதல் குறியீட்டை எழுதினீர்கள்!',
                bn: 'আপনার প্রথম কোড লিখেছেন!'
            }),
            icon: '🎯',
            criteria: JSON.stringify({ type: 'code_saved', count: 1 }),
            points: 10
        },
        {
            id: uuidv4(),
            name: 'streak_7',
            display_name: JSON.stringify({
                en: 'Week Warrior',
                hi: 'सप्ताह योद्धा',
                ta: 'வார வீரர்',
                bn: 'সপ্তাহের যোদ্ধা'
            }),
            description: JSON.stringify({
                en: '7-day coding streak!',
                hi: '7 दिन की कोडिंग स्ट्रीक!',
                ta: '7 நாள் குறியீட்டு தொடர்!',
                bn: '7 দিনের কোডিং স্ট্রিক!'
            }),
            icon: '🔥',
            criteria: JSON.stringify({ type: 'streak', count: 7 }),
            points: 50
        }
    ];

    // Insert concepts if they don't exist
    concepts.forEach(concept => {
        db.run(`INSERT OR IGNORE INTO concepts 
            (id, name, display_name, description, difficulty, prerequisites, examples, cultural_metaphors) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [concept.id, concept.name, concept.display_name, concept.description, 
             concept.difficulty, concept.prerequisites, concept.examples, concept.cultural_metaphors]
        );
    });

    // Insert achievements if they don't exist
    achievements.forEach(achievement => {
        db.run(`INSERT OR IGNORE INTO achievements 
            (id, name, display_name, description, icon, criteria, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [achievement.id, achievement.name, achievement.display_name, 
             achievement.description, achievement.icon, achievement.criteria, achievement.points]
        );
    });
}

// Authentication middleware with enhanced security
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Access token required',
            code: 'TOKEN_MISSING'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                });
            }
            return res.status(403).json({ 
                error: 'Invalid token',
                code: 'TOKEN_INVALID'
            });
        }
        req.user = user;
        next();
    });
}

// Rate limiting middleware
const rateLimitStore = new Map();

function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimitStore.has(key)) {
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const limit = rateLimitStore.get(key);
        
        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + windowMs;
            return next();
        }
        
        if (limit.count >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil((limit.resetTime - now) / 1000)
            });
        }
        
        limit.count++;
        next();
    };
}

// Input validation middleware
function validateInput(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });
        }
        next();
    };
}

// Simple validation schemas (basic implementation)
const validationSchemas = {
    signup: {
        validate: (data) => {
            const errors = [];
            if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
                errors.push({ message: 'Valid email is required' });
            }
            if (!data.password || data.password.length < 6) {
                errors.push({ message: 'Password must be at least 6 characters' });
            }
            if (!data.name || data.name.trim().length < 2) {
                errors.push({ message: 'Name must be at least 2 characters' });
            }
            return { error: errors.length > 0 ? { details: errors } : null };
        }
    },
    login: {
        validate: (data) => {
            const errors = [];
            if (!data.email) errors.push({ message: 'Email is required' });
            if (!data.password) errors.push({ message: 'Password is required' });
            return { error: errors.length > 0 ? { details: errors } : null };
        }
    }
};

// ENHANCED AUTH ROUTES
app.post('/api/auth/signup', rateLimit(10, 15 * 60 * 1000), validateInput(validationSchemas.signup), async (req, res) => {
    try {
        const { email, password, name, language, college, yearOfStudy } = req.body;

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                return res.status(400).json({ 
                    error: 'User already exists',
                    code: 'USER_EXISTS'
                });
            }

            // Hash password with higher rounds for security
            const hashedPassword = await bcrypt.hash(password, 12);
            const userId = uuidv4();
            const verificationToken = uuidv4();

            // Insert user
            db.run(`INSERT INTO users 
                (id, email, password_hash, name, language, college, year_of_study, email_verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, email, hashedPassword, name || 'Student', language || 'en', 
                 college || '', yearOfStudy || null, 0],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Create email verification token
                    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                    db.run(`INSERT INTO email_verification_tokens 
                        (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
                        [uuidv4(), userId, verificationToken, tokenExpiry.toISOString()]);

                    // Generate JWT tokens
                    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
                    const refreshToken = jwt.sign({ userId, email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

                    res.status(201).json({
                        message: 'User created successfully',
                        accessToken,
                        refreshToken,
                        user: { 
                            id: userId, 
                            email, 
                            name: name || 'Student', 
                            language: language || 'en',
                            college: college || '',
                            yearOfStudy: yearOfStudy || null,
                            emailVerified: false
                        },
                        verificationToken // In production, send via email
                    });
                });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', rateLimit(20, 15 * 60 * 1000), validateInput(validationSchemas.login), (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ 
            error: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
        });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ 
            error: 'Invalid credentials',
            code: 'INVALID_CREDENTIALS'
        });

        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                language: user.language,
                college: user.college,
                yearOfStudy: user.year_of_study,
                emailVerified: user.email_verified === 1
            }
        });
    });
});

app.post('/api/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid refresh token' });

        const accessToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get(`SELECT id, email, name, language, college, year_of_study, 
            email_verified, created_at, last_login FROM users WHERE id = ?`, 
            [req.user.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            ...user,
            emailVerified: user.email_verified === 1
        });
    });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const { name, language, college, yearOfStudy } = req.body;
    
    db.run(`UPDATE users SET 
        name = COALESCE(?, name),
        language = COALESCE(?, language),
        college = COALESCE(?, college),
        year_of_study = COALESCE(?, year_of_study),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [name, language, college, yearOfStudy, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Profile updated successfully', changes: this.changes });
        });
});

app.put('/api/auth/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, req.user.userId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Password updated successfully' });
            });
    });
});

app.post('/api/auth/verify-email', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Verification token required' });
    }

    db.get(`SELECT * FROM email_verification_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`, 
            [token], (err, tokenRecord) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!tokenRecord) return res.status(400).json({ error: 'Invalid or expired token' });

        // Mark email as verified and token as used
        db.run('UPDATE users SET email_verified = 1 WHERE id = ?', [tokenRecord.user_id]);
        db.run('UPDATE email_verification_tokens SET used = 1 WHERE id = ?', [tokenRecord.id]);

        res.json({ message: 'Email verified successfully' });
    });
});

app.post('/api/auth/forgot-password', rateLimit(5, 15 * 60 * 1000), (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        const resetToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        db.run(`INSERT INTO password_reset_tokens 
            (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
            [uuidv4(), user.id, resetToken, tokenExpiry.toISOString()],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                // In production, send email with reset link
                res.json({ 
                    message: 'If the email exists, a reset link has been sent',
                    resetToken // Remove this in production
                });
            });
    });
});

app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.get(`SELECT * FROM password_reset_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`, 
            [token], async (err, tokenRecord) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!tokenRecord) return res.status(400).json({ error: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Update password and mark token as used
        db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
            [hashedPassword, tokenRecord.user_id]);
        db.run('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenRecord.id]);

        res.json({ message: 'Password reset successfully' });
    });
});

// ENHANCED CODE MANAGEMENT ROUTES
app.post('/api/code/save', authenticateToken, (req, res) => {
    const { title, description, code, language, tags, difficulty, category } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    const snippetId = uuidv4();
    const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

    db.run(`INSERT INTO code_snippets 
        (id, user_id, title, description, code, language, tags, difficulty, category) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [snippetId, req.user.userId, title || 'Untitled', description || '', 
         code, language || 'python', tagsString, difficulty || 'beginner', category || 'general'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Check for achievements
            checkAchievements(req.user.userId, 'code_saved');
            
            res.json({ 
                message: 'Code saved successfully', 
                id: snippetId,
                snippet: {
                    id: snippetId,
                    title: title || 'Untitled',
                    language: language || 'python',
                    difficulty: difficulty || 'beginner',
                    category: category || 'general'
                }
            });
        });
});

app.get('/api/code/mine', authenticateToken, (req, res) => {
    const { page = 1, limit = 20, language, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.userId];

    // Add filters
    if (language) {
        whereClause += ' AND language = ?';
        params.push(language);
    }
    if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        whereClause += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'updated_at', 'title', 'language', 'difficulty'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const query = `SELECT id, title, description, language, tags, difficulty, category, 
                   execution_count, created_at, updated_at
                   FROM code_snippets ${whereClause}
                   ORDER BY ${sortColumn} ${sortDirection}
                   LIMIT ? OFFSET ?`;

    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM code_snippets ${whereClause}`;
        const countParams = params.slice(0, -2);
        
        db.get(countQuery, countParams, (countErr, countRow) => {
            if (countErr) return res.status(500).json({ error: countErr.message });
            
            res.json({
                snippets: rows.map(row => ({
                    ...row,
                    tags: row.tags ? row.tags.split(',') : []
                })),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countRow.total,
                    totalPages: Math.ceil(countRow.total / limit)
                }
            });
        });
    });
});

app.get('/api/code/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM code_snippets WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Code snippet not found' });
            
            res.json({
                ...row,
                tags: row.tags ? row.tags.split(',') : []
            });
        });
});

app.put('/api/code/:id', authenticateToken, (req, res) => {
    const { title, description, code, language, tags, difficulty, category } = req.body;
    const tagsString = Array.isArray(tags) ? tags.join(',') : (tags || '');

    db.run(`UPDATE code_snippets SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        code = COALESCE(?, code),
        language = COALESCE(?, language),
        tags = COALESCE(?, tags),
        difficulty = COALESCE(?, difficulty),
        category = COALESCE(?, category),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?`,
        [title, description, code, language, tagsString, difficulty, category, req.params.id, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Code snippet not found' });
            res.json({ message: 'Code snippet updated successfully', changes: this.changes });
        });
});

app.delete('/api/code/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM code_snippets WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Code snippet not found' });
            res.json({ message: 'Code snippet deleted successfully' });
        });
});

app.get('/api/code/search', authenticateToken, (req, res) => {
    const { q, language, category, difficulty, limit = 20 } = req.query;
    
    if (!q) {
        return res.status(400).json({ error: 'Search query required' });
    }

    let whereClause = 'WHERE (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    let params = [`%${q}%`, `%${q}%`, `%${q}%`];

    if (language) {
        whereClause += ' AND language = ?';
        params.push(language);
    }
    if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
    }
    if (difficulty) {
        whereClause += ' AND difficulty = ?';
        params.push(difficulty);
    }

    params.push(parseInt(limit));

    db.all(`SELECT id, title, description, language, tags, difficulty, category, created_at
            FROM code_snippets ${whereClause}
            ORDER BY created_at DESC LIMIT ?`,
        params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows.map(row => ({
                ...row,
                tags: row.tags ? row.tags.split(',') : []
            })));
        });
});

app.get('/api/code/stats', authenticateToken, (req, res) => {
    db.all(`SELECT 
        language,
        category,
        difficulty,
        COUNT(*) as count
        FROM code_snippets 
        WHERE user_id = ?
        GROUP BY language, category, difficulty
        ORDER BY count DESC`,
        [req.user.userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const stats = {
                byLanguage: {},
                byCategory: {},
                byDifficulty: {},
                total: 0
            };

            rows.forEach(row => {
                stats.total += row.count;
                
                stats.byLanguage[row.language] = (stats.byLanguage[row.language] || 0) + row.count;
                stats.byCategory[row.category] = (stats.byCategory[row.category] || 0) + row.count;
                stats.byDifficulty[row.difficulty] = (stats.byDifficulty[row.difficulty] || 0) + row.count;
            });

            res.json(stats);
        });
});

app.post('/api/code/:id/execute', authenticateToken, (req, res) => {
    // Update execution count
    db.run(`UPDATE code_snippets SET 
        execution_count = execution_count + 1,
        last_executed = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Execution recorded', executionCount: this.changes });
        });
});

app.get('/api/code/:id/export', authenticateToken, (req, res) => {
    const { format = 'json' } = req.query;
    
    db.get('SELECT * FROM code_snippets WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Code snippet not found' });
            
            const snippet = {
                ...row,
                tags: row.tags ? row.tags.split(',') : []
            };

            if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${snippet.title}.json"`);
                res.json(snippet);
            } else if (format === 'code') {
                res.setHeader('Content-Type', 'text/plain');
                res.setHeader('Content-Disposition', `attachment; filename="${snippet.title}.${getFileExtension(snippet.language)}"`);
                res.send(snippet.code);
            } else {
                res.status(400).json({ error: 'Invalid format. Use json or code' });
            }
        });
});

// Helper function to get file extension based on language
function getFileExtension(language) {
    const extensions = {
        python: 'py',
        javascript: 'js',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        html: 'html',
        css: 'css'
    };
    return extensions[language] || 'txt';
}

// ENHANCED AI TUTOR ROUTES WITH CULTURAL INTEGRATION
app.post('/api/ai/explain', authenticateToken, (req, res) => {
    const { code, language, userLanguage, line, concept } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    // Enhanced multilingual explanations with cultural metaphors
    const culturalExplanations = {
        en: {
            factorial: {
                explanation: "This function calculates factorial by multiplying all numbers from 1 to n. It's like counting all possible arrangements of items.",
                metaphor: "Think of it like arranging books on a shelf - factorial tells you how many different ways you can arrange them.",
                concept: "Factorial is a mathematical function that multiplies a number by all positive integers less than it."
            },
            loop: {
                explanation: "This loop iterates through each element and performs an operation repeatedly until a condition is met.",
                metaphor: "Like a potter's wheel that keeps spinning until the clay is perfectly shaped.",
                concept: "Loops allow you to repeat code efficiently instead of writing the same thing multiple times."
            },
            function: {
                explanation: "Functions are reusable blocks of code that perform specific tasks and can return values.",
                metaphor: "Functions are like specialized tools in a craftsman's workshop - each has a specific purpose.",
                concept: "Functions help organize code into manageable, reusable pieces."
            },
            variable: {
                explanation: "Variables store data that can be used and modified throughout your program.",
                metaphor: "Variables are like labeled containers in a spice shop - each holds something different.",
                concept: "Variables are the basic building blocks for storing and manipulating data."
            },
            array: {
                explanation: "Arrays store multiple values in a single variable, accessed by index numbers.",
                metaphor: "Arrays are like a train with numbered compartments, each holding different cargo.",
                concept: "Arrays help organize related data in a structured, indexed format."
            }
        },
        hi: {
            factorial: {
                explanation: "यह फंक्शन फैक्टोरियल निकालता है। यह 1 से n तक सभी संख्याओं को गुणा करता है।",
                metaphor: "यह चाय की दुकान में कप गिनने जैसा है - हर कप को पिछले सभी कपों के साथ गुणा करना।",
                concept: "फैक्टोरियल एक गणितीय फंक्शन है जो संख्या को उससे छोटी सभी धनात्मक संख्याओं से गुणा करता है।"
            },
            loop: {
                explanation: "यह लूप हर एलिमेंट को इटरेट करता है और एक ऑपरेशन को तब तक दोहराता है जब तक शर्त पूरी न हो जाए।",
                metaphor: "यह बरगद के पेड़ की जड़ों की तरह है - वे तब तक बढ़ते रहते हैं जब तक मिट्टी मिलती रहे।",
                concept: "लूप्स आपको कोड को कुशलता से दोहराने की अनुमति देते हैं।"
            },
            function: {
                explanation: "फंक्शन्स कोड के रीयूजेबल ब्लॉक्स हैं जो स्पेसिफिक टास्क परफॉर्म करते हैं।",
                metaphor: "फंक्शन्स कारीगर की दुकान के औजारों की तरह हैं - हर एक का अपना काम है।",
                concept: "फंक्शन्स कोड को व्यवस्थित और पुन: उपयोग योग्य टुकड़ों में बांटने में मदद करते हैं।"
            },
            variable: {
                explanation: "वेरिएबल्स डेटा स्टोर करते हैं जिसका उपयोग प्रोग्राम में किया जा सकता है।",
                metaphor: "वेरिएबल्स चाय के कप की तरह हैं - आप उनमें अलग-अलग चीजें रख सकते हैं।",
                concept: "वेरिएबल्स डेटा स्टोर करने और उसमें बदलाव करने के लिए बुनियादी ब्लॉक्स हैं।"
            },
            array: {
                explanation: "एरे एक ही वेरिएबल में कई वैल्यूज स्टोर करते हैं, जिन्हें इंडेक्स नंबर से एक्सेस किया जाता है।",
                metaphor: "एरे रेलगाड़ी के डिब्बों की तरह हैं - हर डिब्बे में अलग सामान होता है।",
                concept: "एरे संबंधित डेटा को व्यवस्थित, इंडेक्स्ड फॉर्मेट में व्यवस्थित करने में मदद करते हैं।"
            }
        },
        ta: {
            factorial: {
                explanation: "இந்த செயல்பாடு காரணியல் கணக்கிடுகிறது. இது 1 முதல் n வரையிலான அனைத்து எண்களையும் பெருக்குகிறது।",
                metaphor: "இது தேநீர் கடையில் கப்புகளை எண்ணுவது போன்றது - ஒவ்வொரு கப்பையும் முந்தைய அனைத்து கப்புகளுடன் பெருக்குவது.",
                concept: "காரணியல் ஒரு கணித செயல்பாடு ஆகும், இது ஒரு எண்ணை அதை விட சிறிய அனைத்து நேர்மறை எண்களுடன் பெருக்குகிறது."
            },
            loop: {
                explanation: "இந்த சுழல் ஒவ்வொரு உறுப்பையும் மீண்டும் மீண்டும் செய்து ஒரு நிபந்தனை பூர்த்தியாகும் வரை ஒரு செயல்பாட்டை செய்கிறது.",
                metaphor: "இது ஆலமரத்தின் வேர்களைப் போன்றது - மண் கிடைக்கும் வரை அவை வளர்ந்து கொண்டே இருக்கும்.",
                concept: "சுழல்கள் குறியீட்டை திறமையாக மீண்டும் செய்ய உங்களை அனுமதிக்கின்றன."
            },
            function: {
                explanation: "செயல்பாடுகள் குறிப்பிட்ட பணிகளை செய்யும் மீண்டும் பயன்படுத்தக்கூடிய குறியீடு தொகுதிகள்.",
                metaphor: "செயல்பாடுகள் கைவினைஞரின் கடையில் உள்ள கருவிகள் போன்றவை - ஒவ்வொன்றுக்கும் அதன் சொந்த வேலை உள்ளது.",
                concept: "செயல்பாடுகள் குறியீட்டை நிர்வகிக்கக்கூடிய, மீண்டும் பயன்படுத்தக்கூடிய துண்டுகளாக ஒழுங்கமைக்க உதவுகின்றன."
            }
        },
        bn: {
            factorial: {
                explanation: "এই ফাংশন ফ্যাক্টোরিয়াল বের করে। এটি ১ থেকে n পর্যন্ত সব সংখ্যা গুণ করে।",
                metaphor: "এটি চায়ের দোকানে কাপ গোনার মতো - প্রতিটি কাপকে আগের সব কাপের সাথে গুণ করা।",
                concept: "ফ্যাক্টোরিয়াল একটি গাণিতিক ফাংশন যা একটি সংখ্যাকে তার চেয়ে ছোট সব ধনাত্মক সংখ্যা দিয়ে গুণ করে।"
            },
            loop: {
                explanation: "এই লুপ প্রতিটি উপাদানকে পুনরাবৃত্তি করে এবং একটি শর্ত পূরণ না হওয়া পর্যন্ত একটি অপারেশন করে।",
                metaphor: "এটি বট গাছের শিকড়ের মতো - মাটি পাওয়া পর্যন্ত তারা বাড়তে থাকে।",
                concept: "লুপ আপনাকে কোড দক্ষতার সাথে পুনরাবৃত্তি করতে দেয়।"
            }
        }
    };

    // Analyze code to determine concept
    let detectedConcept = 'general';
    const codeAnalysis = analyzeCode(code, language);
    
    if (codeAnalysis.hasFactorial) detectedConcept = 'factorial';
    else if (codeAnalysis.hasLoop) detectedConcept = 'loop';
    else if (codeAnalysis.hasFunction) detectedConcept = 'function';
    else if (codeAnalysis.hasVariable) detectedConcept = 'variable';
    else if (codeAnalysis.hasArray) detectedConcept = 'array';

    const lang = userLanguage || 'en';
    const explanationData = culturalExplanations[lang]?.[detectedConcept] || 
                           culturalExplanations['en'][detectedConcept] || 
                           culturalExplanations['en']['function'];

    // Generate contextual explanation
    let contextualExplanation = explanationData.explanation;
    if (line && codeAnalysis.errors.length > 0) {
        const errorExplanations = {
            en: `Error on line ${line}: ${codeAnalysis.errors[0]}. ${explanationData.concept}`,
            hi: `लाइन ${line} पर एरर: ${codeAnalysis.errors[0]}। ${explanationData.concept}`,
            ta: `வரி ${line} இல் பிழை: ${codeAnalysis.errors[0]}। ${explanationData.concept}`,
            bn: `লাইন ${line} এ ত্রুটি: ${codeAnalysis.errors[0]}। ${explanationData.concept}`
        };
        contextualExplanation = errorExplanations[lang] || errorExplanations['en'];
    }

    res.json({
        explanation: contextualExplanation,
        culturalMetaphor: explanationData.metaphor,
        concept: detectedConcept,
        language: lang,
        codeAnalysis: {
            complexity: codeAnalysis.complexity,
            concepts: codeAnalysis.concepts,
            suggestions: codeAnalysis.suggestions
        },
        nextSteps: generateNextSteps(detectedConcept, lang)
    });
});

app.post('/api/ai/hint', authenticateToken, (req, res) => {
    const { code, language, userLanguage, level, concept } = req.body;
    
    const hintLevel = Math.min(Math.max(level || 1, 1), 3); // Ensure level is 1-3
    
    const progressiveHints = {
        en: {
            factorial: {
                1: "Think about what factorial means. How do you calculate 5! (5 factorial)? Start with the mathematical definition.",
                2: "You need to multiply numbers in sequence. Consider using a loop that starts from 1 and goes up to n.",
                3: "Initialize a result variable to 1, then multiply it by each number from 1 to n in a loop."
            },
            loop: {
                1: "Consider what you want to repeat. What condition should control when the loop stops?",
                2: "Think about the loop structure: initialization, condition, and increment/decrement.",
                3: "Use a for loop with proper initialization, condition checking, and counter updates."
            },
            function: {
                1: "What task should this function perform? What inputs does it need and what should it return?",
                2: "Define the function signature with appropriate parameters and return type.",
                3: "Implement the function body with proper parameter usage and return statement."
            }
        },
        hi: {
            factorial: {
                1: "सोचिए कि फैक्टोरियल का मतलब क्या है। आप 5! (5 फैक्टोरियल) कैसे निकालते हैं? गणितीय परिभाषा से शुरू करें।",
                2: "आपको संख्याओं को क्रम में गुणा करना है। एक लूप का उपयोग करें जो 1 से शुरू होकर n तक जाए।",
                3: "एक रिजल्ट वेरिएबल को 1 से शुरू करें, फिर लूप में 1 से n तक हर संख्या से गुणा करें।"
            },
            loop: {
                1: "सोचिए कि आप क्या दोहराना चाहते हैं। कौन सी शर्त तय करेगी कि लूप कब रुकेगा?",
                2: "लूप की संरचना के बारे में सोचें: शुरुआत, शर्त, और बढ़ाना/घटाना।",
                3: "उचित शुरुआत, शर्त जांच, और काउंटर अपडेट के साथ for लूप का उपयोग करें।"
            }
        },
        ta: {
            factorial: {
                1: "காரணியல் என்றால் என்ன என்பதை சிந்தியுங்கள். 5! (5 காரணியல்) எப்படி கணக்கிடுவீர்கள்? கணித வரையறையுடன் தொடங்குங்கள்.",
                2: "எண்களை வரிசையில் பெருக்க வேண்டும். 1 இல் தொடங்கி n வரை செல்லும் சுழலைப் பயன்படுத்துங்கள்.",
                3: "முடிவு மாறியை 1 ஆக தொடங்கி, சுழலில் 1 முதல் n வரை ஒவ்வொரு எண்ணாலும் பெருக்குங்கள்."
            }
        }
    };

    const lang = userLanguage || 'en';
    const detectedConcept = concept || analyzeCode(code, language).primaryConcept || 'general';
    
    const hint = progressiveHints[lang]?.[detectedConcept]?.[hintLevel] || 
                progressiveHints['en'][detectedConcept]?.[hintLevel] ||
                `Level ${hintLevel} hint: Break down the problem into smaller steps and think about the logic flow.`;

    // Track hint usage for progress
    updateProgressHints(req.user.userId, detectedConcept, 1);

    res.json({
        hint: hint,
        level: hintLevel,
        concept: detectedConcept,
        language: lang,
        maxLevel: 3,
        pedagogicalNote: hintLevel < 3 ? 
            "Try to solve with this hint first. Ask for the next level only if needed." :
            "This is the most detailed hint. Try to implement the solution yourself."
    });
});

app.post('/api/ai/error-explain', authenticateToken, (req, res) => {
    const { error, code, language, userLanguage, line } = req.body;
    
    const errorExplanations = {
        en: {
            syntax: "This is a syntax error - the code structure is incorrect. Check for missing brackets, semicolons, or incorrect indentation.",
            runtime: "This error occurs when the program runs. Check for undefined variables, division by zero, or array index out of bounds.",
            logic: "The code runs but doesn't produce expected results. Review your algorithm and variable values."
        },
        hi: {
            syntax: "यह एक सिंटैक्स एरर है - कोड की संरचना गलत है। गुम ब्रैकेट्स, सेमीकोलन, या गलत इंडेंटेशन की जांच करें।",
            runtime: "यह एरर प्रोग्राम चलने पर होता है। अपरिभाषित वेरिएबल्स, शून्य से भाग, या एरे इंडेक्स की जांच करें।",
            logic: "कोड चलता है लेकिन अपेक्षित परिणाम नहीं देता। अपने एल्गोरिदम और वेरिएबल वैल्यूज की समीक्षा करें।"
        }
    };

    const errorType = classifyError(error, code);
    const lang = userLanguage || 'en';
    
    const explanation = errorExplanations[lang]?.[errorType] || 
                       errorExplanations['en'][errorType];

    res.json({
        errorType: errorType,
        explanation: explanation,
        suggestion: generateErrorSuggestion(error, code, lang),
        line: line,
        language: lang,
        culturalContext: generateCulturalErrorContext(errorType, lang)
    });
});

// Helper functions for code analysis
function analyzeCode(code, language) {
    const analysis = {
        hasFactorial: /factorial|fact|\*=.*\w+|for.*\*/.test(code),
        hasLoop: /for\s*\(|while\s*\(|for\s+\w+\s+in/.test(code),
        hasFunction: /def\s+\w+|function\s+\w+|public\s+\w+\s+\w+\s*\(/.test(code),
        hasVariable: /\w+\s*=\s*|let\s+\w+|var\s+\w+|int\s+\w+/.test(code),
        hasArray: /\[\s*\]|\w+\[\d+\]|array|list/.test(code),
        complexity: calculateComplexity(code),
        concepts: [],
        suggestions: [],
        errors: [],
        primaryConcept: 'general'
    };

    // Determine primary concept
    if (analysis.hasFactorial) analysis.primaryConcept = 'factorial';
    else if (analysis.hasFunction) analysis.primaryConcept = 'function';
    else if (analysis.hasLoop) analysis.primaryConcept = 'loop';
    else if (analysis.hasArray) analysis.primaryConcept = 'array';
    else if (analysis.hasVariable) analysis.primaryConcept = 'variable';

    return analysis;
}

function calculateComplexity(code) {
    let complexity = 1;
    const lines = code.split('\n').length;
    const loops = (code.match(/for|while/g) || []).length;
    const conditions = (code.match(/if|else|elif/g) || []).length;
    
    complexity += loops * 2 + conditions + Math.floor(lines / 10);
    
    if (complexity <= 3) return 'simple';
    if (complexity <= 7) return 'moderate';
    return 'complex';
}

function generateNextSteps(concept, language) {
    const nextSteps = {
        en: {
            factorial: ["Try implementing iterative factorial", "Learn about recursive factorial", "Practice with larger numbers"],
            loop: ["Practice different loop types", "Learn about nested loops", "Try loop optimization techniques"],
            function: ["Add parameters to functions", "Learn about return values", "Practice function composition"]
        },
        hi: {
            factorial: ["इटरेटिव फैक्टोरियल बनाने की कोशिश करें", "रिकर्सिव फैक्टोरियल के बारे में सीखें", "बड़ी संख्याओं के साथ अभ्यास करें"],
            loop: ["विभिन्न लूप प्रकारों का अभ्यास करें", "नेस्टेड लूप्स के बारे में सीखें", "लूप ऑप्टिमाइज़ेशन तकनीकों को आज़माएं"]
        }
    };

    return nextSteps[language]?.[concept] || nextSteps['en'][concept] || ["Continue practicing", "Try more examples", "Learn related concepts"];
}

function classifyError(error, code) {
    if (/syntax|invalid syntax|unexpected token/i.test(error)) return 'syntax';
    if (/undefined|not defined|null|reference error/i.test(error)) return 'runtime';
    return 'logic';
}

function generateErrorSuggestion(error, code, language) {
    const suggestions = {
        en: "Check the line mentioned in the error. Look for typos, missing brackets, or incorrect variable names.",
        hi: "एरर में बताई गई लाइन की जांच करें। टाइपो, गुम ब्रैकेट्स, या गलत वेरिएबल नामों की तलाश करें।"
    };
    return suggestions[language] || suggestions['en'];
}

function generateCulturalErrorContext(errorType, language) {
    const contexts = {
        en: {
            syntax: "Like writing Hindi in English script - the computer doesn't understand the format.",
            runtime: "Like trying to use a tool that isn't there - the program can't find what it needs.",
            logic: "Like following a recipe but getting different results - the steps might be in wrong order."
        },
        hi: {
            syntax: "जैसे हिंदी को अंग्रेजी स्क्रिप्ट में लिखना - कंप्यूटर फॉर्मेट नहीं समझता।",
            runtime: "जैसे ऐसे औजार का उपयोग करना जो वहां नहीं है - प्रोग्राम को जो चाहिए वो नहीं मिल रहा।",
            logic: "जैसे रेसिपी फॉलो करना लेकिन अलग नतीजा मिलना - स्टेप्स गलत क्रम में हो सकते हैं।"
        }
    };
    return contexts[language]?.[errorType] || contexts['en'][errorType];
}

function updateProgressHints(userId, concept, hintsUsed) {
    // Update progress tracking for hint usage
    db.run(`INSERT OR REPLACE INTO progress 
        (id, user_id, concept, hints_used, last_attempt) 
        VALUES (
            COALESCE((SELECT id FROM progress WHERE user_id = ? AND concept = ?), ?),
            ?, ?, 
            COALESCE((SELECT hints_used FROM progress WHERE user_id = ? AND concept = ?), 0) + ?,
            CURRENT_TIMESTAMP
        )`,
        [userId, concept, uuidv4(), userId, concept, userId, concept, hintsUsed]
    );
}

function checkAchievements(userId, actionType) {
    // Simple achievement checking - can be expanded
    if (actionType === 'code_saved') {
        db.get('SELECT COUNT(*) as count FROM code_snippets WHERE user_id = ?', [userId], (err, result) => {
            if (!err && result.count === 1) {
                // First code achievement
                db.run(`INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
                    SELECT ?, ?, id FROM achievements WHERE name = 'first_code'`,
                    [uuidv4(), userId]);
            }
        });
    }
}

// ENHANCED PROGRESS TRACKING ROUTES
app.post('/api/progress/update', authenticateToken, (req, res) => {
    const { concept, solved, hintsUsed, timeSpent, difficulty, category } = req.body;

    if (!concept) {
        return res.status(400).json({ error: 'Concept is required' });
    }

    db.get('SELECT * FROM progress WHERE user_id = ? AND concept = ?',
        [req.user.userId, concept],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (row) {
                // Update existing progress
                const newAttempts = row.attempts + 1;
                const newHintsUsed = row.hints_used + (hintsUsed || 0);
                const newTimeSpent = row.time_spent_seconds + (timeSpent || 0);
                const newMastery = calculateMasteryScore(newAttempts, solved, newHintsUsed, newTimeSpent, row.mastery_score);

                db.run(`UPDATE progress SET 
                    attempts = ?,
                    solved = CASE WHEN ? = 1 THEN 1 ELSE solved END,
                    hints_used = ?,
                    time_spent_seconds = ?,
                    mastery_score = ?,
                    difficulty = COALESCE(?, difficulty),
                    category = COALESCE(?, category),
                    last_attempt = CURRENT_TIMESTAMP
                    WHERE id = ?`,
                    [newAttempts, solved ? 1 : 0, newHintsUsed, newTimeSpent, newMastery, 
                     difficulty, category, row.id],
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        // Check for achievements
                        checkProgressAchievements(req.user.userId, newMastery, newAttempts);
                        
                        res.json({ 
                            message: 'Progress updated', 
                            attempts: newAttempts, 
                            mastery: newMastery,
                            solved: solved || row.solved === 1
                        });
                    });
            } else {
                // Create new progress record
                const progressId = uuidv4();
                const initialMastery = calculateMasteryScore(1, solved, hintsUsed || 0, timeSpent || 0, 0);
                
                db.run(`INSERT INTO progress 
                    (id, user_id, concept, attempts, solved, hints_used, time_spent_seconds, 
                     mastery_score, difficulty, category, first_attempt, last_attempt) 
                    VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [progressId, req.user.userId, concept, solved ? 1 : 0, hintsUsed || 0, 
                     timeSpent || 0, initialMastery, difficulty || 'beginner', category || 'general'],
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        checkProgressAchievements(req.user.userId, initialMastery, 1);
                        
                        res.json({ 
                            message: 'Progress created', 
                            attempts: 1, 
                            mastery: initialMastery,
                            solved: solved
                        });
                    });
            }
        });
});

app.get('/api/progress/stats', authenticateToken, (req, res) => {
    db.get(`SELECT 
        COUNT(*) as total_concepts,
        SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved_concepts,
        AVG(attempts) as avg_attempts,
        AVG(mastery_score) as avg_mastery,
        SUM(attempts) as total_attempts,
        SUM(hints_used) as total_hints,
        SUM(time_spent_seconds) as total_time,
        MAX(last_attempt) as last_activity
        FROM progress WHERE user_id = ?`,
        [req.user.userId],
        (err, stats) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Get learning streak
            getLearningStreak(req.user.userId, (streakErr, streakData) => {
                if (streakErr) return res.status(500).json({ error: streakErr.message });
                
                res.json({
                    ...stats,
                    total_concepts: stats.total_concepts || 0,
                    solved_concepts: stats.solved_concepts || 0,
                    avg_attempts: Math.round((stats.avg_attempts || 0) * 100) / 100,
                    avg_mastery: Math.round((stats.avg_mastery || 0) * 100) / 100,
                    total_attempts: stats.total_attempts || 0,
                    total_hints: stats.total_hints || 0,
                    total_time: stats.total_time || 0,
                    learning_hours: Math.round(((stats.total_time || 0) / 3600) * 100) / 100,
                    current_streak: streakData.currentStreak,
                    max_streak: streakData.maxStreak,
                    total_active_days: streakData.totalActiveDays
                });
            });
        });
});

app.get('/api/progress/detailed', authenticateToken, (req, res) => {
    const { category, difficulty, limit = 50 } = req.query;
    
    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.userId];
    
    if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
    }
    if (difficulty) {
        whereClause += ' AND difficulty = ?';
        params.push(difficulty);
    }
    
    params.push(parseInt(limit));

    db.all(`SELECT concept, attempts, solved, hints_used, time_spent_seconds, 
            mastery_score, difficulty, category, first_attempt, last_attempt
            FROM progress ${whereClause}
            ORDER BY last_attempt DESC
            LIMIT ?`,
        params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json(rows.map(row => ({
                ...row,
                solved: row.solved === 1,
                time_spent_minutes: Math.round((row.time_spent_seconds / 60) * 100) / 100,
                mastery_level: getMasteryLevel(row.mastery_score)
            })));
        });
});

app.get('/api/progress/analytics', authenticateToken, (req, res) => {
    // Get progress by category and difficulty
    db.all(`SELECT 
        category,
        difficulty,
        COUNT(*) as total,
        SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved,
        AVG(mastery_score) as avg_mastery,
        AVG(attempts) as avg_attempts,
        SUM(time_spent_seconds) as total_time
        FROM progress 
        WHERE user_id = ?
        GROUP BY category, difficulty
        ORDER BY category, difficulty`,
        [req.user.userId], (err, categoryData) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Get daily progress for the last 30 days
            db.all(`SELECT 
                DATE(last_attempt) as date,
                COUNT(*) as attempts,
                SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved,
                AVG(mastery_score) as avg_mastery
                FROM progress 
                WHERE user_id = ? AND last_attempt >= date('now', '-30 days')
                GROUP BY DATE(last_attempt)
                ORDER BY date DESC`,
                [req.user.userId], (err, dailyData) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    // Organize category data
                    const categories = {};
                    categoryData.forEach(row => {
                        if (!categories[row.category]) {
                            categories[row.category] = {
                                total: 0,
                                solved: 0,
                                difficulties: {}
                            };
                        }
                        
                        categories[row.category].total += row.total;
                        categories[row.category].solved += row.solved;
                        categories[row.category].difficulties[row.difficulty] = {
                            total: row.total,
                            solved: row.solved,
                            avg_mastery: Math.round(row.avg_mastery * 100) / 100,
                            avg_attempts: Math.round(row.avg_attempts * 100) / 100,
                            total_hours: Math.round((row.total_time / 3600) * 100) / 100
                        };
                    });

                    res.json({
                        byCategory: categories,
                        dailyProgress: dailyData,
                        summary: {
                            totalCategories: Object.keys(categories).length,
                            mostActiveCategory: getMostActiveCategory(categories),
                            averageDailyProgress: calculateAverageDailyProgress(dailyData)
                        }
                    });
                });
        });
});

app.get('/api/progress/recommendations', authenticateToken, (req, res) => {
    // Get user's mastery levels to generate recommendations
    db.all(`SELECT concept, mastery_score, difficulty, category, attempts, solved
            FROM progress 
            WHERE user_id = ?
            ORDER BY mastery_score ASC, attempts DESC`,
        [req.user.userId], (err, progress) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const recommendations = generateRecommendations(progress);
            
            res.json({
                recommendations: recommendations,
                focusAreas: identifyFocusAreas(progress),
                nextChallenges: suggestNextChallenges(progress),
                studyPlan: generateStudyPlan(progress)
            });
        });
});

app.get('/api/progress/export', authenticateToken, (req, res) => {
    const { format = 'json' } = req.query;
    
    // Get comprehensive progress data
    db.all(`SELECT p.*, u.name, u.email, u.language
            FROM progress p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
            ORDER BY p.last_attempt DESC`,
        [req.user.userId], (err, progressData) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Get code snippets
            db.all(`SELECT id, title, language, difficulty, category, created_at
                    FROM code_snippets 
                    WHERE user_id = ?
                    ORDER BY created_at DESC`,
                [req.user.userId], (err, snippets) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    const exportData = {
                        user: progressData.length > 0 ? {
                            name: progressData[0].name,
                            email: progressData[0].email,
                            language: progressData[0].language
                        } : {},
                        progress: progressData.map(p => ({
                            concept: p.concept,
                            attempts: p.attempts,
                            solved: p.solved === 1,
                            hints_used: p.hints_used,
                            time_spent_hours: Math.round((p.time_spent_seconds / 3600) * 100) / 100,
                            mastery_score: p.mastery_score,
                            difficulty: p.difficulty,
                            category: p.category,
                            first_attempt: p.first_attempt,
                            last_attempt: p.last_attempt
                        })),
                        codeSnippets: snippets,
                        exportDate: new Date().toISOString(),
                        summary: {
                            totalConcepts: progressData.length,
                            solvedConcepts: progressData.filter(p => p.solved === 1).length,
                            totalSnippets: snippets.length,
                            averageMastery: progressData.length > 0 ? 
                                Math.round((progressData.reduce((sum, p) => sum + p.mastery_score, 0) / progressData.length) * 100) / 100 : 0
                        }
                    };

                    if (format === 'json') {
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Content-Disposition', 'attachment; filename="codesahayak-progress.json"');
                        res.json(exportData);
                    } else if (format === 'csv') {
                        const csv = convertToCSV(exportData.progress);
                        res.setHeader('Content-Type', 'text/csv');
                        res.setHeader('Content-Disposition', 'attachment; filename="codesahayak-progress.csv"');
                        res.send(csv);
                    } else {
                        res.status(400).json({ error: 'Invalid format. Use json or csv' });
                    }
                });
        });
});

// Helper functions for progress tracking
function calculateMasteryScore(attempts, solved, hintsUsed, timeSpent, currentMastery = 0) {
    let mastery = currentMastery;

    if (solved) {
        // Base improvement for solving
        let improvement = 0.2;

        // Bonus for solving with fewer attempts
        if (attempts === 1) improvement += 0.3;
        else if (attempts <= 3) improvement += 0.2;
        else if (attempts <= 5) improvement += 0.1;

        // Penalty for using many hints
        if (hintsUsed > 3) improvement -= 0.1;
        else if (hintsUsed > 1) improvement -= 0.05;

        // Time-based adjustment (reasonable time ranges)
        if (timeSpent < 300) improvement += 0.1; // Less than 5 minutes
        else if (timeSpent > 1800) improvement -= 0.05; // More than 30 minutes

        mastery = Math.min(mastery + improvement, 1.0);
    } else {
        // Small penalty for failed attempts
        mastery = Math.max(mastery - 0.05, 0);
    }

    return Math.round(mastery * 100) / 100;
}

function getMasteryLevel(score) {
    if (score >= 0.8) return 'mastered';
    if (score >= 0.6) return 'proficient';
    if (score >= 0.3) return 'learning';
    return 'struggling';
}

function getLearningStreak(userId, callback) {
    db.all(`SELECT DISTINCT DATE(last_attempt) as date
            FROM progress 
            WHERE user_id = ? AND solved = 1
            ORDER BY date DESC`,
        [userId], (err, rows) => {
            if (err) return callback(err);
            
            let currentStreak = 0;
            let maxStreak = 0;
            let tempStreak = 0;
            
            const today = new Date();
            const dates = rows.map(row => new Date(row.date));
            
            // Calculate current streak
            for (let i = 0; i < dates.length; i++) {
                const date = dates[i];
                const expectedDate = new Date(today);
                expectedDate.setDate(today.getDate() - i);
                
                if (isSameDay(date, expectedDate)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            
            // Calculate max streak
            for (let i = 0; i < dates.length; i++) {
                if (i === 0) {
                    tempStreak = 1;
                } else {
                    const prevDate = dates[i - 1];
                    const currDate = dates[i];
                    const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
                    
                    if (dayDiff === 1) {
                        tempStreak++;
                    } else {
                        maxStreak = Math.max(maxStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
            }
            maxStreak = Math.max(maxStreak, tempStreak);
            
            callback(null, {
                currentStreak,
                maxStreak,
                totalActiveDays: dates.length
            });
        });
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function checkProgressAchievements(userId, mastery, attempts) {
    // Check for mastery achievements
    if (mastery >= 0.8) {
        db.run(`INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
            SELECT ?, ?, id FROM achievements WHERE name = 'concept_mastered'`,
            [uuidv4(), userId]);
    }
    
    // Check for streak achievements
    getLearningStreak(userId, (err, streakData) => {
        if (!err && streakData.currentStreak >= 7) {
            db.run(`INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id)
                SELECT ?, ?, id FROM achievements WHERE name = 'streak_7'`,
                [uuidv4(), userId]);
        }
    });
}

function generateRecommendations(progress) {
    const recommendations = [];
    
    // Find struggling concepts
    const struggling = progress.filter(p => p.mastery_score < 0.3);
    if (struggling.length > 0) {
        recommendations.push({
            type: 'review',
            priority: 'high',
            message: `Review ${struggling.length} struggling concepts`,
            concepts: struggling.map(p => p.concept)
        });
    }
    
    // Find concepts to practice more
    const needsPractice = progress.filter(p => p.mastery_score >= 0.3 && p.mastery_score < 0.6);
    if (needsPractice.length > 0) {
        recommendations.push({
            type: 'practice',
            priority: 'medium',
            message: `Practice ${needsPractice.length} concepts to improve mastery`,
            concepts: needsPractice.map(p => p.concept)
        });
    }
    
    return recommendations;
}

function identifyFocusAreas(progress) {
    const categories = {};
    progress.forEach(p => {
        if (!categories[p.category]) {
            categories[p.category] = { total: 0, avgMastery: 0, concepts: [] };
        }
        categories[p.category].total++;
        categories[p.category].avgMastery += p.mastery_score;
        categories[p.category].concepts.push(p.concept);
    });
    
    // Calculate average mastery per category
    Object.keys(categories).forEach(cat => {
        categories[cat].avgMastery /= categories[cat].total;
    });
    
    // Sort by lowest mastery (needs most focus)
    return Object.entries(categories)
        .sort(([,a], [,b]) => a.avgMastery - b.avgMastery)
        .slice(0, 3)
        .map(([category, data]) => ({
            category,
            avgMastery: Math.round(data.avgMastery * 100) / 100,
            conceptCount: data.total,
            needsAttention: data.avgMastery < 0.6
        }));
}

function suggestNextChallenges(progress) {
    const mastered = progress.filter(p => p.mastery_score >= 0.8);
    const suggestions = [];
    
    if (mastered.some(p => p.concept === 'variables')) {
        suggestions.push('Try working with arrays and lists');
    }
    if (mastered.some(p => p.concept === 'loops')) {
        suggestions.push('Practice nested loops and complex iterations');
    }
    if (mastered.some(p => p.concept === 'functions')) {
        suggestions.push('Learn about recursion and advanced function concepts');
    }
    
    return suggestions;
}

function generateStudyPlan(progress) {
    const plan = [];
    const struggling = progress.filter(p => p.mastery_score < 0.3);
    const learning = progress.filter(p => p.mastery_score >= 0.3 && p.mastery_score < 0.6);
    
    if (struggling.length > 0) {
        plan.push({
            week: 1,
            focus: 'Review Fundamentals',
            concepts: struggling.slice(0, 3).map(p => p.concept),
            goal: 'Improve mastery to 60%+'
        });
    }
    
    if (learning.length > 0) {
        plan.push({
            week: 2,
            focus: 'Strengthen Understanding',
            concepts: learning.slice(0, 3).map(p => p.concept),
            goal: 'Achieve 80%+ mastery'
        });
    }
    
    plan.push({
        week: 3,
        focus: 'New Challenges',
        concepts: ['Advanced topics based on your progress'],
        goal: 'Expand your programming knowledge'
    });
    
    return plan;
}

function getMostActiveCategory(categories) {
    let maxTotal = 0;
    let mostActive = 'general';
    
    Object.entries(categories).forEach(([category, data]) => {
        if (data.total > maxTotal) {
            maxTotal = data.total;
            mostActive = category;
        }
    });
    
    return mostActive;
}

function calculateAverageDailyProgress(dailyData) {
    if (dailyData.length === 0) return 0;
    const totalAttempts = dailyData.reduce((sum, day) => sum + day.attempts, 0);
    return Math.round((totalAttempts / dailyData.length) * 100) / 100;
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
        ).join(',')
    );
    
    return [headers, ...rows].join('\n');
}

// ACHIEVEMENTS AND CONCEPTS ROUTES
app.get('/api/achievements', authenticateToken, (req, res) => {
    // Get all achievements with user's unlock status
    db.all(`SELECT 
        a.id, a.name, a.display_name, a.description, a.icon, a.criteria, a.points,
        CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as unlocked,
        ua.unlocked_at
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY unlocked DESC, a.points ASC`,
        [req.user.userId], (err, achievements) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json(achievements.map(achievement => ({
                ...achievement,
                display_name: JSON.parse(achievement.display_name),
                description: JSON.parse(achievement.description),
                criteria: JSON.parse(achievement.criteria),
                unlocked: achievement.unlocked === 1,
                unlocked_at: achievement.unlocked_at
            })));
        });
});

app.get('/api/achievements/stats', authenticateToken, (req, res) => {
    db.get(`SELECT 
        COUNT(*) as total_achievements,
        SUM(CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END) as unlocked_achievements,
        SUM(CASE WHEN ua.id IS NOT NULL THEN a.points ELSE 0 END) as total_points
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?`,
        [req.user.userId], (err, stats) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                total: stats.total_achievements || 0,
                unlocked: stats.unlocked_achievements || 0,
                points: stats.total_points || 0,
                completion_percentage: stats.total_achievements > 0 ? 
                    Math.round((stats.unlocked_achievements / stats.total_achievements) * 100) : 0
            });
        });
});

app.get('/api/concepts', authenticateToken, (req, res) => {
    const { language = 'en', difficulty, category } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (difficulty) {
        whereClause += ' WHERE difficulty = ?';
        params.push(difficulty);
    }

    db.all(`SELECT id, name, display_name, description, difficulty, prerequisites, 
            examples, cultural_metaphors FROM concepts${whereClause} ORDER BY difficulty, name`,
        params, (err, concepts) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json(concepts.map(concept => {
                const displayName = JSON.parse(concept.display_name);
                const description = JSON.parse(concept.description);
                const examples = JSON.parse(concept.examples || '{}');
                const metaphors = JSON.parse(concept.cultural_metaphors || '{}');
                
                return {
                    id: concept.id,
                    name: concept.name,
                    display_name: displayName[language] || displayName['en'] || concept.name,
                    description: description[language] || description['en'] || '',
                    difficulty: concept.difficulty,
                    prerequisites: JSON.parse(concept.prerequisites || '[]'),
                    examples: examples,
                    cultural_metaphor: metaphors[language] || metaphors['en'] || ''
                };
            }));
        });
});

app.get('/api/concepts/:name/progress', authenticateToken, (req, res) => {
    const conceptName = req.params.name;
    
    db.get(`SELECT * FROM progress WHERE user_id = ? AND concept = ?`,
        [req.user.userId, conceptName], (err, progress) => {
            if (err) return res.status(500).json({ error: err.message });
            
            if (!progress) {
                return res.json({
                    concept: conceptName,
                    attempts: 0,
                    solved: false,
                    hints_used: 0,
                    mastery_score: 0,
                    mastery_level: 'not_started'
                });
            }
            
            res.json({
                ...progress,
                solved: progress.solved === 1,
                mastery_level: getMasteryLevel(progress.mastery_score),
                time_spent_minutes: Math.round((progress.time_spent_seconds / 60) * 100) / 100
            });
        });
});

// USER DASHBOARD DATA ENDPOINT
app.get('/api/dashboard', authenticateToken, (req, res) => {
    // Get comprehensive dashboard data in a single request
    const userId = req.user.userId;
    
    // Get user stats
    db.get(`SELECT 
        COUNT(DISTINCT cs.id) as total_snippets,
        COUNT(DISTINCT p.concept) as total_concepts,
        SUM(CASE WHEN p.solved = 1 THEN 1 ELSE 0 END) as solved_concepts,
        AVG(p.mastery_score) as avg_mastery,
        SUM(p.attempts) as total_attempts,
        SUM(p.time_spent_seconds) as total_time
        FROM users u
        LEFT JOIN code_snippets cs ON u.id = cs.user_id
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.id = ?`,
        [userId], (err, stats) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Get recent activity
            db.all(`SELECT 'code' as type, title as name, language, created_at as timestamp
                    FROM code_snippets WHERE user_id = ?
                    UNION ALL
                    SELECT 'progress' as type, concept as name, 
                           CASE WHEN solved = 1 THEN 'solved' ELSE 'attempted' END as language,
                           last_attempt as timestamp
                    FROM progress WHERE user_id = ?
                    ORDER BY timestamp DESC LIMIT 10`,
                [userId, userId], (err, activity) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    // Get learning streak
                    getLearningStreak(userId, (streakErr, streakData) => {
                        if (streakErr) return res.status(500).json({ error: streakErr.message });
                        
                        // Get achievements
                        db.all(`SELECT a.name, a.display_name, a.icon, ua.unlocked_at
                                FROM achievements a
                                JOIN user_achievements ua ON a.id = ua.achievement_id
                                WHERE ua.user_id = ?
                                ORDER BY ua.unlocked_at DESC LIMIT 5`,
                            [userId], (err, achievements) => {
                                if (err) return res.status(500).json({ error: err.message });
                                
                                res.json({
                                    stats: {
                                        total_snippets: stats.total_snippets || 0,
                                        total_concepts: stats.total_concepts || 0,
                                        solved_concepts: stats.solved_concepts || 0,
                                        avg_mastery: Math.round((stats.avg_mastery || 0) * 100) / 100,
                                        total_attempts: stats.total_attempts || 0,
                                        learning_hours: Math.round(((stats.total_time || 0) / 3600) * 100) / 100,
                                        current_streak: streakData.currentStreak,
                                        max_streak: streakData.maxStreak
                                    },
                                    recentActivity: activity,
                                    recentAchievements: achievements.map(a => ({
                                        ...a,
                                        display_name: JSON.parse(a.display_name)
                                    })),
                                    streakCalendar: generateStreakCalendar(userId)
                                });
                            });
                    });
                });
        });
});

// SETTINGS AND PREFERENCES
app.get('/api/settings', authenticateToken, (req, res) => {
    db.get(`SELECT language, preferences FROM users WHERE id = ?`, 
        [req.user.userId], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });
            
            const preferences = user.preferences ? JSON.parse(user.preferences) : {};
            
            res.json({
                language: user.language,
                preferences: {
                    theme: preferences.theme || 'light',
                    fontSize: preferences.fontSize || 14,
                    autoSave: preferences.autoSave !== false,
                    notifications: preferences.notifications !== false,
                    culturalMetaphors: preferences.culturalMetaphors !== false,
                    ...preferences
                }
            });
        });
});

app.put('/api/settings', authenticateToken, (req, res) => {
    const { language, preferences } = req.body;
    
    const preferencesJson = JSON.stringify(preferences || {});
    
    db.run(`UPDATE users SET 
        language = COALESCE(?, language),
        preferences = COALESCE(?, preferences),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [language, preferencesJson, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Settings updated successfully', changes: this.changes });
        });
});

// ANALYTICS AND INSIGHTS
app.get('/api/analytics/learning-patterns', authenticateToken, (req, res) => {
    // Analyze learning patterns over time
    db.all(`SELECT 
        strftime('%H', last_attempt) as hour,
        strftime('%w', last_attempt) as day_of_week,
        COUNT(*) as attempts,
        AVG(mastery_score) as avg_mastery
        FROM progress 
        WHERE user_id = ? AND last_attempt >= date('now', '-30 days')
        GROUP BY hour, day_of_week
        ORDER BY day_of_week, hour`,
        [req.user.userId], (err, patterns) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Process patterns into insights
            const hourlyActivity = {};
            const dailyActivity = {};
            
            patterns.forEach(p => {
                const hour = parseInt(p.hour);
                const day = parseInt(p.day_of_week);
                
                if (!hourlyActivity[hour]) hourlyActivity[hour] = 0;
                if (!dailyActivity[day]) dailyActivity[day] = 0;
                
                hourlyActivity[hour] += p.attempts;
                dailyActivity[day] += p.attempts;
            });
            
            // Find peak learning times
            const peakHour = Object.entries(hourlyActivity)
                .sort(([,a], [,b]) => b - a)[0];
            const peakDay = Object.entries(dailyActivity)
                .sort(([,a], [,b]) => b - a)[0];
            
            res.json({
                hourlyActivity,
                dailyActivity,
                insights: {
                    peakLearningHour: peakHour ? parseInt(peakHour[0]) : null,
                    peakLearningDay: peakDay ? parseInt(peakDay[0]) : null,
                    totalSessions: patterns.reduce((sum, p) => sum + p.attempts, 0),
                    averageSessionQuality: patterns.length > 0 ? 
                        Math.round((patterns.reduce((sum, p) => sum + p.avg_mastery, 0) / patterns.length) * 100) / 100 : 0
                }
            });
        });
});

// Helper function to generate streak calendar
function generateStreakCalendar(userId) {
    // This would generate a 21-day calendar showing activity
    // For now, return a simple structure
    return {
        days: Array.from({ length: 21 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (20 - i));
            return {
                date: date.toISOString().split('T')[0],
                active: Math.random() > 0.5, // Placeholder - should check actual data
                attempts: Math.floor(Math.random() * 5)
            };
        })
    };
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: {
            authentication: 'enhanced',
            multilingual: 'supported',
            offline: 'ready',
            cultural_integration: 'active'
        }
    });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'CodeSahayak API Documentation',
        version: '2.0.0',
        description: 'Ultra-comprehensive coding education platform with cultural integration',
        endpoints: {
            authentication: [
                'POST /api/auth/signup',
                'POST /api/auth/login', 
                'POST /api/auth/refresh',
                'GET /api/auth/me',
                'PUT /api/auth/profile',
                'PUT /api/auth/password',
                'POST /api/auth/verify-email',
                'POST /api/auth/forgot-password',
                'POST /api/auth/reset-password'
            ],
            code_management: [
                'POST /api/code/save',
                'GET /api/code/mine',
                'GET /api/code/:id',
                'PUT /api/code/:id',
                'DELETE /api/code/:id',
                'GET /api/code/search',
                'GET /api/code/stats',
                'POST /api/code/:id/execute',
                'GET /api/code/:id/export'
            ],
            ai_tutor: [
                'POST /api/ai/explain',
                'POST /api/ai/hint',
                'POST /api/ai/error-explain'
            ],
            progress: [
                'POST /api/progress/update',
                'GET /api/progress/stats',
                'GET /api/progress/detailed',
                'GET /api/progress/analytics',
                'GET /api/progress/recommendations',
                'GET /api/progress/export'
            ],
            achievements: [
                'GET /api/achievements',
                'GET /api/achievements/stats'
            ],
            concepts: [
                'GET /api/concepts',
                'GET /api/concepts/:name/progress'
            ],
            dashboard: [
                'GET /api/dashboard'
            ],
            settings: [
                'GET /api/settings',
                'PUT /api/settings'
            ],
            analytics: [
                'GET /api/analytics/learning-patterns'
            ]
        },
        cultural_features: {
            supported_languages: ['hi', 'ta', 'bn', 'mr', 'te', 'gu', 'kn', 'pa', 'en'],
            cultural_metaphors: 'integrated',
            regional_adaptation: 'available'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Something went wrong!',
        code: err.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        ...(isDevelopment && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        available_endpoints: '/api/docs'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║       CodeSahayak Backend Started                    ║
╠═══════════════════════════════════════════════════════╣
║ API running at: http://localhost:${PORT}            ║
║ Database: SQLite (codesahayak.db)                    ║
║ JWT Authentication enabled                           ║
║ AI Tutor ready in multiple languages                ║
║ Progress tracking enabled                            ║
╚═══════════════════════════════════════════════════════╝
    `);
    console.log('Ready to receive connections...');
});