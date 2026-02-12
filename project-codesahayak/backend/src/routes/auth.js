// Enhanced Authentication Routes for CodeSahayak
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'codesahayak_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'codesahayak_refresh_secret_2026';

// Initialize with database
let db;
function initializeAuthRoutes(database) {
    db = database;
}

// Enhanced signup with email verification
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, language, college, yearOfStudy } = req.body;

        // Validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            const userId = uuidv4();

            // Insert user
            db.run(`INSERT INTO users 
                (id, email, password_hash, name, language, college, year_of_study, email_verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                [userId, email, hashedPassword, name, language || 'en', college || null, yearOfStudy || null],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Generate tokens
                    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
                    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        refreshToken,
                        user: { 
                            id: userId, 
                            email, 
                            name, 
                            language: language || 'en',
                            college: college || null,
                            yearOfStudy: yearOfStudy || null
                        }
                    });
                });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enhanced login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Generate tokens
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'Login successful',
            token,
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

// Refresh token
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid refresh token' });

        db.get('SELECT email FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err || !user) return res.status(404).json({ error: 'User not found' });

            const newToken = jwt.sign(
                { userId: decoded.userId, email: user.email }, 
                JWT_SECRET, 
                { expiresIn: '7d' }
            );
            const newRefreshToken = jwt.sign(
                { userId: decoded.userId }, 
                JWT_REFRESH_SECRET, 
                { expiresIn: '30d' }
            );

            res.json({ token: newToken, refreshToken: newRefreshToken });
        });
    });
});

// Get current user profile
router.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        db.get(`SELECT id, email, name, language, college, year_of_study, 
                email_verified, profile_picture_url, preferences, created_at, last_login 
                FROM users WHERE id = ? AND deleted_at IS NULL`, 
            [decoded.userId], 
            (err, user) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!user) return res.status(404).json({ error: 'User not found' });
                
                res.json({
                    ...user,
                    preferences: user.preferences ? JSON.parse(user.preferences) : {}
                });
            }
        );
    });
});

// Update profile
router.put('/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const { name, language, college, yearOfStudy, preferences } = req.body;

        db.run(`UPDATE users SET 
            name = COALESCE(?, name),
            language = COALESCE(?, language),
            college = COALESCE(?, college),
            year_of_study = COALESCE(?, year_of_study),
            preferences = COALESCE(?, preferences),
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [name, language, college, yearOfStudy, 
             preferences ? JSON.stringify(preferences) : null, decoded.userId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Profile updated successfully', changes: this.changes });
            }
        );
    });
});

// Change password
router.put('/password', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token required' });

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        db.get('SELECT password_hash FROM users WHERE id = ?', [decoded.userId], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });

            const isValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, decoded.userId],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Password updated successfully' });
                }
            );
        });
    });
});

// Request password reset
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        db.run(`INSERT INTO password_reset_tokens (id, user_id, token, expires_at) 
                VALUES (?, ?, ?, ?)`,
            [uuidv4(), user.id, resetToken, expiresAt],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                // In production, send email here
                console.log(`Password reset token for ${email}: ${resetToken}`);
                
                res.json({ 
                    message: 'If the email exists, a reset link has been sent',
                    // Remove in production
                    devToken: resetToken
                });
            }
        );
    });
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    db.get(`SELECT user_id FROM password_reset_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`,
        [token],
        async (err, resetToken) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!resetToken) return res.status(400).json({ error: 'Invalid or expired token' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, resetToken.user_id],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });

                    // Mark token as used
                    db.run('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);

                    res.json({ message: 'Password reset successfully' });
                }
            );
        }
    );
});

module.exports = { router, initializeAuthRoutes };
