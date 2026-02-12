// Progress model for CodeSahayak
// Handles all progress tracking and learning analytics

const { v4: uuidv4 } = require('uuid');

class Progress {
    constructor(db) {
        this.db = db;
    }

    // Create or update progress for a concept
    async updateProgress(userId, progressData) {
        const { 
            concept, 
            solved = false, 
            hintsUsed = 0, 
            timeSpent = 0,
            difficulty = 'beginner',
            category = 'general'
        } = progressData;

        if (!concept || !userId) {
            throw new Error('User ID and concept are required');
        }

        // Check if progress record exists
        const existing = await this.findByUserAndConcept(userId, concept);

        if (existing) {
            return this.updateExisting(existing.id, {
                solved,
                hintsUsed,
                timeSpent,
                difficulty,
                category
            });
        } else {
            return this.createNew(userId, {
                concept,
                solved,
                hintsUsed,
                timeSpent,
                difficulty,
                category
            });
        }
    }

    // Find progress by user and concept
    async findByUserAndConcept(userId, concept) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM progress WHERE user_id = ? AND concept = ?',
                [userId, concept],
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

    // Create new progress record
    async createNew(userId, progressData) {
        const { 
            concept, 
            solved, 
            hintsUsed, 
            timeSpent, 
            difficulty, 
            category 
        } = progressData;

        const progressId = uuidv4();
        const initialMastery = this.calculateMastery(1, solved, hintsUsed, timeSpent);

        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO progress (
                    id, user_id, concept, attempts, solved, hints_used, 
                    time_spent, mastery_score, difficulty, category,
                    first_attempt, last_attempt
                ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                    progressId, userId, concept, solved ? 1 : 0, 
                    hintsUsed, timeSpent, initialMastery, difficulty, category
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: progressId,
                            attempts: 1,
                            mastery: initialMastery,
                            solved: solved
                        });
                    }
                }
            );
        });
    }

    // Update existing progress record
    async updateExisting(progressId, updateData) {
        const { solved, hintsUsed, timeSpent } = updateData;

        return new Promise((resolve, reject) => {
            // First get current data
            this.db.get(
                'SELECT * FROM progress WHERE id = ?',
                [progressId],
                (err, current) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const newAttempts = current.attempts + 1;
                    const newHintsUsed = current.hints_used + (hintsUsed || 0);
                    const newTimeSpent = current.time_spent + (timeSpent || 0);
                    const newMastery = this.calculateMastery(
                        newAttempts, 
                        solved, 
                        newHintsUsed, 
                        newTimeSpent,
                        current.mastery_score
                    );

                    // Update the record
                    this.db.run(
                        `UPDATE progress SET 
                            attempts = ?,
                            solved = CASE WHEN ? = 1 THEN 1 ELSE solved END,
                            hints_used = ?,
                            time_spent = ?,
                            mastery_score = ?,
                            last_attempt = CURRENT_TIMESTAMP
                        WHERE id = ?`,
                        [newAttempts, solved ? 1 : 0, newHintsUsed, newTimeSpent, newMastery, progressId],
                        function(updateErr) {
                            if (updateErr) {
                                reject(updateErr);
                            } else {
                                resolve({
                                    attempts: newAttempts,
                                    mastery: newMastery,
                                    solved: solved || current.solved === 1
                                });
                            }
                        }
                    );
                }
            );
        });
    }

    // Calculate mastery score based on performance
    calculateMastery(attempts, solved, hintsUsed, timeSpent, currentMastery = 0) {
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

            // Time-based adjustment (assuming reasonable time ranges)
            if (timeSpent < 300) improvement += 0.1; // Less than 5 minutes
            else if (timeSpent > 1800) improvement -= 0.05; // More than 30 minutes

            mastery = Math.min(mastery + improvement, 1.0);
        } else {
            // Small penalty for failed attempts
            mastery = Math.max(mastery - 0.05, 0);
        }

        return Math.round(mastery * 100) / 100; // Round to 2 decimal places
    }

    // Get user's overall progress statistics
    async getUserStats(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT 
                    COUNT(*) as total_concepts,
                    SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved_concepts,
                    AVG(attempts) as avg_attempts,
                    AVG(mastery_score) as avg_mastery,
                    SUM(attempts) as total_attempts,
                    SUM(hints_used) as total_hints,
                    SUM(time_spent) as total_time,
                    MAX(last_attempt) as last_activity
                FROM progress 
                WHERE user_id = ?`,
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || {
                            total_concepts: 0,
                            solved_concepts: 0,
                            avg_attempts: 0,
                            avg_mastery: 0,
                            total_attempts: 0,
                            total_hints: 0,
                            total_time: 0,
                            last_activity: null
                        });
                    }
                }
            );
        });
    }

    // Get progress by category
    async getProgressByCategory(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT 
                    category,
                    difficulty,
                    COUNT(*) as total,
                    SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as solved,
                    AVG(mastery_score) as avg_mastery,
                    AVG(attempts) as avg_attempts
                FROM progress 
                WHERE user_id = ?
                GROUP BY category, difficulty
                ORDER BY category, difficulty`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Organize by category
                        const categories = {};
                        rows.forEach(row => {
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
                                avg_mastery: row.avg_mastery,
                                avg_attempts: row.avg_attempts
                            };
                        });

                        resolve(categories);
                    }
                }
            );
        });
    }

    // Get learning streak
    async getLearningStreak(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT DISTINCT DATE(last_attempt) as date
                FROM progress 
                WHERE user_id = ? AND solved = 1
                ORDER BY date DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
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
                            
                            if (this.isSameDay(date, expectedDate)) {
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
                        
                        resolve({
                            currentStreak,
                            maxStreak,
                            totalActiveDays: dates.length
                        });
                    }
                }
            );
        });
    }

    // Helper function to check if two dates are the same day
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Get recent progress
    async getRecentProgress(userId, limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT concept, solved, attempts, mastery_score, 
                        difficulty, category, last_attempt
                FROM progress 
                WHERE user_id = ?
                ORDER BY last_attempt DESC
                LIMIT ?`,
                [userId, limit],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // Get mastery levels for concepts
    async getMasteryLevels(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT concept, mastery_score, difficulty, category
                FROM progress 
                WHERE user_id = ?
                ORDER BY mastery_score DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const levels = {
                            mastered: rows.filter(r => r.mastery_score >= 0.8),
                            proficient: rows.filter(r => r.mastery_score >= 0.6 && r.mastery_score < 0.8),
                            learning: rows.filter(r => r.mastery_score >= 0.3 && r.mastery_score < 0.6),
                            struggling: rows.filter(r => r.mastery_score < 0.3)
                        };
                        
                        resolve(levels);
                    }
                }
            );
        });
    }

    // Delete progress record
    async delete(progressId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM progress WHERE id = ? AND user_id = ?',
                [progressId, userId],
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

module.exports = Progress;