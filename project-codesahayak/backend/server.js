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

// Create tables
function createTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        language TEXT DEFAULT 'en',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // Code snippets table
    db.run(`CREATE TABLE IF NOT EXISTS code_snippets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        code TEXT NOT NULL,
        language TEXT DEFAULT 'python',
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Progress table
    db.run(`CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        concept TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        solved BOOLEAN DEFAULT 0,
        hints_used INTEGER DEFAULT 0,
        last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
        mastery_score REAL DEFAULT 0.0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log('Database tables created/verified');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'codesahayak_secret_key_2026';

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// AUTH ROUTES
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name, language } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = uuidv4();

            // Insert user
            db.run('INSERT INTO users (id, email, password, name, language) VALUES (?, ?, ?, ?, ?)',
                [userId, email, hashedPassword, name || 'Student', language || 'en'],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Generate JWT
                    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: { id: userId, email, name: name || 'Student', language: language || 'en' }
                    });
                });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                language: user.language
            }
        });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, email, name, language FROM users WHERE id = ?', [req.user.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// CODE ROUTES
app.post('/api/code/save', authenticateToken, (req, res) => {
    const { title, code, language, tags } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    const snippetId = uuidv4();
    db.run('INSERT INTO code_snippets (id, user_id, title, code, language, tags) VALUES (?, ?, ?, ?, ?, ?)',
        [snippetId, req.user.userId, title || 'Untitled', code, language || 'python', tags || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Code saved successfully', id: snippetId });
        });
});

app.get('/api/code/mine', authenticateToken, (req, res) => {
    db.all('SELECT id, title, language, tags, created_at FROM code_snippets WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

app.get('/api/code/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM code_snippets WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Code snippet not found' });
            res.json(row);
        });
});

// AI TUTOR ROUTES
app.post('/api/ai/explain', authenticateToken, (req, res) => {
    const { code, language, line } = req.body;
    
    // Mock AI explanations
    const explanations = {
        en: {
            factorial: "This function calculates factorial by multiplying all numbers from 1 to n.",
            loop: "This loop iterates through each element and performs an operation.",
            function: "Functions are reusable blocks of code that perform specific tasks.",
            variable: "Variables store data that can be used and modified in your program.",
            error: `Error on line ${line}: Make sure the variable is defined before using it.`
        },
        hi: {
            factorial: "यह फंक्शन फैक्टोरियल निकालता है। यह 1 से n तक सभी संख्याओं को गुणा करता है।",
            loop: "यह लूप हर एलिमेंट को इटरेट करता है और एक ऑपरेशन परफॉर्म करता है।",
            function: "फंक्शन्स कोड के रीयूजेबल ब्लॉक्स हैं जो स्पेसिफिक टास्क परफॉर्म करते हैं।",
            variable: "वेरिएबल्स डेटा स्टोर करते हैं जिसका उपयोग प्रोग्राम में किया जा सकता है।",
            error: `लाइन ${line} पर एरर: सुनिश्चित करें कि वेरिएबल का उपयोग करने से पहले उसे डिफाइन किया गया है।`
        }
    };

    // Simple code analysis
    let explanationKey = 'error';
    if (code.includes('factorial') || code.includes('*=')) {
        explanationKey = 'factorial';
    } else if (code.includes('for') || code.includes('while')) {
        explanationKey = 'loop';
    } else if (code.includes('def ') || code.includes('function')) {
        explanationKey = 'function';
    }

    const userLang = language || 'en';
    const explanation = explanations[userLang]?.[explanationKey] || explanations['en'][explanationKey];

    res.json({
        explanation: explanation,
        language: userLang,
        concept: explanationKey,
        hint: "Try to understand the logic step by step. Break down the problem into smaller parts."
    });
});

app.post('/api/ai/hint', authenticateToken, (req, res) => {
    const { code, language, level } = req.body;
    
    const hints = {
        en: {
            1: "Think about what this code is trying to accomplish. What is the main goal?",
            2: "Look at the structure. What programming concepts are being used here?",
            3: "Focus on the key variables and how they change in each iteration."
        },
        hi: {
            1: "सोचिए कि यह कोड क्या करने की कोशिश कर रहा है। मुख्य लक्ष्य क्या है?",
            2: "स्ट्रक्चर को देखिए। यहाँ कौन से प्रोग्रामिंग कॉन्सेप्ट्स का उपयोग हो रहा है?",
            3: "मुख्य वेरिएबल्स पर ध्यान दें और देखें कि वे हर इटरेशन में कैसे बदलते हैं।"
        }
    };

    const userLang = language || 'en';
    const hintLevel = Math.min(level || 1, 3);
    const hint = hints[userLang]?.[hintLevel] || hints['en'][hintLevel];

    res.json({
        hint: hint,
        level: hintLevel,
        language: userLang
    });
});

// PROGRESS ROUTES
app.post('/api/progress/update', authenticateToken, (req, res) => {
    const { concept, solved, hintsUsed } = req.body;

    db.get('SELECT * FROM progress WHERE user_id = ? AND concept = ?',
        [req.user.userId, concept],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (row) {
                // Update existing progress
                const newMastery = solved ? Math.min(row.mastery_score + 0.1, 1.0) : row.mastery_score;
                db.run('UPDATE progress SET attempts = attempts + 1, solved = ?, hints_used = hints_used + ?, mastery_score = ?, last_attempt = CURRENT_TIMESTAMP WHERE id = ?',
                    [solved ? 1 : 0, hintsUsed || 0, newMastery, row.id],
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: 'Progress updated', attempts: row.attempts + 1, mastery: newMastery });
                    });
            } else {
                // Create new progress record
                const progressId = uuidv4();
                const initialMastery = solved ? 0.2 : 0.0;
                db.run('INSERT INTO progress (id, user_id, concept, attempts, solved, hints_used, mastery_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [progressId, req.user.userId, concept, 1, solved ? 1 : 0, hintsUsed || 0, initialMastery],
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: 'Progress created', attempts: 1, mastery: initialMastery });
                    });
            }
        });
});

app.get('/api/progress/stats', authenticateToken, (req, res) => {
    db.all(`SELECT 
        COUNT(*) as total_concepts,
        SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved_concepts,
        AVG(attempts) as avg_attempts,
        AVG(mastery_score) as avg_mastery,
        SUM(attempts) as total_attempts
        FROM progress WHERE user_id = ?`,
        [req.user.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows[0] || { 
                total_concepts: 0, 
                solved_concepts: 0, 
                avg_attempts: 0,
                avg_mastery: 0,
                total_attempts: 0
            });
        });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
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