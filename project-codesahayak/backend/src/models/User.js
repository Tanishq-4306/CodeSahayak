// User model for CodeSahayak
// Handles all user-related database operations

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(db) {
        this.db = db;
    }

    // Create a new user
    async create(userData) {
        const { email, password, name, language, role = 'student' } = userData;
        
        try {
            // Check if user already exists
            const existingUser = await this.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            const userId = uuidv4();

            return new Promise((resolve, reject) => {
                this.db.run(
                    `INSERT INTO users (
                        id, email, password, name, language, role, 
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [userId, email, hashedPassword, name || 'Student', language || 'en', role],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                id: userId,
                                email,
                                name: name || 'Student',
                                language: language || 'en',
                                role
                            });
                        }
                    }
                );
            });
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Find user by ID
    async findById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, email, name, language, role, created_at, updated_at, last_login FROM users WHERE id = ?',
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update user profile
    async updateProfile(userId, updateData) {
        const { name, language, preferences } = updateData;
        
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE users SET 
                    name = COALESCE(?, name),
                    language = COALESCE(?, language),
                    preferences = COALESCE(?, preferences),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [name, language, preferences, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Update last login
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                [userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Get user statistics
    async getStats(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.language,
                    u.created_at,
                    u.last_login,
                    COUNT(DISTINCT cs.id) as total_snippets,
                    COUNT(DISTINCT p.id) as total_concepts,
                    SUM(CASE WHEN p.solved = 1 THEN 1 ELSE 0 END) as solved_concepts,
                    AVG(p.mastery_score) as avg_mastery,
                    SUM(p.attempts) as total_attempts
                FROM users u
                LEFT JOIN code_snippets cs ON u.id = cs.user_id
                LEFT JOIN progress p ON u.id = p.user_id
                WHERE u.id = ?
                GROUP BY u.id`,
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || {});
                    }
                }
            );
        });
    }

    // Get learning streak
    async getLearningStreak(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT DATE(last_attempt) as date
                FROM progress 
                WHERE user_id = ? AND solved = 1
                ORDER BY last_attempt DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Calculate streak
                        let streak = 0;
                        const today = new Date().toISOString().split('T')[0];
                        const dates = [...new Set(rows.map(row => row.date))];
                        
                        for (let i = 0; i < dates.length; i++) {
                            const date = new Date(dates[i]);
                            const expectedDate = new Date();
                            expectedDate.setDate(expectedDate.getDate() - i);
                            
                            if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                                streak++;
                            } else {
                                break;
                            }
                        }
                        
                        resolve({ streak, totalDays: dates.length });
                    }
                }
            );
        });
    }

    // Delete user account
    async delete(userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM users WHERE id = ?',
                [userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }
}

module.exports = User;