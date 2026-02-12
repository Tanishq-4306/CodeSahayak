// CodeSnippet model for CodeSahayak
// Handles all code snippet-related database operations

const { v4: uuidv4 } = require('uuid');

class CodeSnippet {
    constructor(db) {
        this.db = db;
    }

    // Create a new code snippet
    async create(snippetData) {
        const { userId, title, code, language, tags, description, difficulty, category } = snippetData;
        
        if (!code || !userId) {
            throw new Error('Code and user ID are required');
        }

        const snippetId = uuidv4();

        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO code_snippets (
                    id, user_id, title, code, language, tags, description, 
                    difficulty, category, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                    snippetId, userId, title || 'Untitled', code, 
                    language || 'python', tags || '', description || '',
                    difficulty || 'beginner', category || 'general'
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: snippetId,
                            title: title || 'Untitled',
                            language: language || 'python',
                            created_at: new Date().toISOString()
                        });
                    }
                }
            );
        });
    }

    // Find snippet by ID
    async findById(snippetId, userId = null) {
        const query = userId 
            ? 'SELECT * FROM code_snippets WHERE id = ? AND user_id = ?'
            : 'SELECT * FROM code_snippets WHERE id = ?';
        
        const params = userId ? [snippetId, userId] : [snippetId];

        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get user's snippets with pagination and filtering
    async getUserSnippets(userId, options = {}) {
        const { 
            page = 1, 
            limit = 20, 
            language = null, 
            category = null,
            search = null,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = options;

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE user_id = ?';
        let params = [userId];

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
        const validSortColumns = ['created_at', 'updated_at', 'title', 'language'];
        const validSortOrders = ['ASC', 'DESC'];
        
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const query = `
            SELECT id, title, language, tags, description, difficulty, category, created_at, updated_at
            FROM code_snippets 
            ${whereClause}
            ORDER BY ${sortColumn} ${sortDirection}
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);

        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Get total count for pagination
                    const countQuery = `SELECT COUNT(*) as total FROM code_snippets ${whereClause}`;
                    const countParams = params.slice(0, -2); // Remove limit and offset

                    this.db.get(countQuery, countParams, (countErr, countRow) => {
                        if (countErr) {
                            reject(countErr);
                        } else {
                            resolve({
                                snippets: rows,
                                pagination: {
                                    page,
                                    limit,
                                    total: countRow.total,
                                    totalPages: Math.ceil(countRow.total / limit)
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Update snippet
    async update(snippetId, userId, updateData) {
        const { title, code, language, tags, description, difficulty, category } = updateData;

        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE code_snippets SET 
                    title = COALESCE(?, title),
                    code = COALESCE(?, code),
                    language = COALESCE(?, language),
                    tags = COALESCE(?, tags),
                    description = COALESCE(?, description),
                    difficulty = COALESCE(?, difficulty),
                    category = COALESCE(?, category),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?`,
                [title, code, language, tags, description, difficulty, category, snippetId, userId],
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

    // Delete snippet
    async delete(snippetId, userId) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM code_snippets WHERE id = ? AND user_id = ?',
                [snippetId, userId],
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

    // Get snippet statistics
    async getStats(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT 
                    language,
                    category,
                    difficulty,
                    COUNT(*) as count
                FROM code_snippets 
                WHERE user_id = ?
                GROUP BY language, category, difficulty
                ORDER BY count DESC`,
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Process stats
                        const stats = {
                            byLanguage: {},
                            byCategory: {},
                            byDifficulty: {},
                            total: 0
                        };

                        rows.forEach(row => {
                            stats.total += row.count;
                            
                            if (!stats.byLanguage[row.language]) {
                                stats.byLanguage[row.language] = 0;
                            }
                            stats.byLanguage[row.language] += row.count;

                            if (!stats.byCategory[row.category]) {
                                stats.byCategory[row.category] = 0;
                            }
                            stats.byCategory[row.category] += row.count;

                            if (!stats.byDifficulty[row.difficulty]) {
                                stats.byDifficulty[row.difficulty] = 0;
                            }
                            stats.byDifficulty[row.difficulty] += row.count;
                        });

                        resolve(stats);
                    }
                }
            );
        });
    }

    // Get recent snippets
    async getRecent(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT id, title, language, category, created_at
                FROM code_snippets 
                WHERE user_id = ?
                ORDER BY created_at DESC
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

    // Search snippets across all users (public snippets)
    async searchPublic(searchTerm, options = {}) {
        const { language = null, category = null, limit = 20 } = options;
        
        let whereClause = 'WHERE (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
        let params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

        if (language) {
            whereClause += ' AND language = ?';
            params.push(language);
        }

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        params.push(limit);

        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT id, title, language, tags, description, difficulty, category, created_at
                FROM code_snippets 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ?`,
                params,
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
}

module.exports = CodeSnippet;