/**
 * Enhanced API Client for CodeSahayak
 * Handles authentication, offline queue, and API communication
 */

class APIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL || window.location.origin;
        this.token = localStorage.getItem('codesahayak_token');
        this.refreshToken = localStorage.getItem('codesahayak_refresh_token');
        this.offlineQueue = [];
        this.isRefreshing = false;
        this.refreshSubscribers = [];
        
        this.setupInterceptors();
        this.loadOfflineQueue();
    }

    // ========================================================================
    // AUTHENTICATION METHODS
    // ========================================================================

    async signup(userData) {
        try {
            const response = await this.post('/api/auth/signup', userData);
            this.setTokens(response.token, response.refreshToken);
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async login(credentials) {
        try {
            const response = await this.post('/api/auth/login', credentials);
            this.setTokens(response.token, response.refreshToken);
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async logout() {
        this.clearTokens();
        // Clear offline queue
        this.offlineQueue = [];
        this.saveOfflineQueue();
    }

    async getProfile() {
        try {
            return await this.get('/api/auth/me');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateProfile(profileData) {
        try {
            return await this.put('/api/auth/profile', profileData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async changePassword(passwordData) {
        try {
            return await this.put('/api/auth/password', passwordData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async forgotPassword(email) {
        try {
            return await this.post('/api/auth/forgot-password', { email });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            return await this.post('/api/auth/reset-password', { token, newPassword });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ========================================================================
    // CODE MANAGEMENT METHODS
    // ========================================================================

    async saveCode(codeData) {
        try {
            return await this.post('/api/code/save', codeData);
        } catch (error) {
            if (!navigator.onLine) {
                return this.queueOfflineAction('saveCode', codeData);
            }
            throw this.handleError(error);
        }
    }

    async getMyCode() {
        try {
            return await this.get('/api/code/mine');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getCodeById(id) {
        try {
            return await this.get(`/api/code/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateCode(id, codeData) {
        try {
            return await this.put(`/api/code/${id}`, codeData);
        } catch (error) {
            if (!navigator.onLine) {
                return this.queueOfflineAction('updateCode', { id, ...codeData });
            }
            throw this.handleError(error);
        }
    }

    async deleteCode(id) {
        try {
            return await this.delete(`/api/code/${id}`);
        } catch (error) {
            if (!navigator.onLine) {
                return this.queueOfflineAction('deleteCode', { id });
            }
            throw this.handleError(error);
        }
    }

    async searchCode(query, filters = {}) {
        try {
            const params = new URLSearchParams({ q: query, ...filters });
            return await this.get(`/api/code/search?${params}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ========================================================================
    // AI TUTOR METHODS
    // ========================================================================

    async explainCode(codeData) {
        try {
            return await this.post('/api/ai/explain', codeData);
        } catch (error) {
            // Try offline explanation if available
            if (!navigator.onLine) {
                return this.getOfflineExplanation(codeData);
            }
            throw this.handleError(error);
        }
    }

    async getHint(hintData) {
        try {
            return await this.post('/api/ai/hint', hintData);
        } catch (error) {
            if (!navigator.onLine) {
                return this.getOfflineHint(hintData);
            }
            throw this.handleError(error);
        }
    }

    async explainError(errorData) {
        try {
            return await this.post('/api/ai/error-explain', errorData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async explainConcept(conceptData) {
        try {
            return await this.post('/api/ai/concept-explain', conceptData);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ========================================================================
    // PROGRESS TRACKING METHODS
    // ========================================================================

    async updateProgress(progressData) {
        try {
            return await this.post('/api/progress/update', progressData);
        } catch (error) {
            if (!navigator.onLine) {
                return this.queueOfflineAction('updateProgress', progressData);
            }
            throw this.handleError(error);
        }
    }

    async getStats() {
        try {
            return await this.get('/api/progress/stats');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getDetailedProgress() {
        try {
            return await this.get('/api/progress/detailed');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getRecommendations() {
        try {
            return await this.get('/api/progress/recommendations');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async exportProgress() {
        try {
            return await this.get('/api/progress/export');
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ========================================================================
    // CORE HTTP METHODS
    // ========================================================================

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, { 
            ...options, 
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, { 
            ...options, 
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    async request(url, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        // Add auth token if available
        if (this.token && !options.skipAuth) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(this.baseURL + url, config);
            
            // Handle token expiration
            if (response.status === 401 && !options.skipAuth) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry request with new token
                    config.headers['Authorization'] = `Bearer ${this.token}`;
                    return this.request(url, { ...options, skipAuth: true });
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            if (!navigator.onLine) {
                throw new Error('You are offline. Changes will be synced when connection is restored.');
            }
            throw error;
        }
    }

    // ========================================================================
    // TOKEN MANAGEMENT
    // ========================================================================

    setTokens(token, refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        localStorage.setItem('codesahayak_token', token);
        if (refreshToken) {
            localStorage.setItem('codesahayak_refresh_token', refreshToken);
        }
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('codesahayak_token');
        localStorage.removeItem('codesahayak_refresh_token');
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        if (this.isRefreshing) {
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            const response = await this.post('/api/auth/refresh', 
                { refreshToken: this.refreshToken },
                { skipAuth: true }
            );

            this.setTokens(response.token, response.refreshToken);
            this.isRefreshing = false;
            
            // Notify subscribers
            this.refreshSubscribers.forEach(callback => callback(true));
            this.refreshSubscribers = [];

            return true;
        } catch (error) {
            this.isRefreshing = false;
            this.clearTokens();
            
            // Notify subscribers
            this.refreshSubscribers.forEach(callback => callback(false));
            this.refreshSubscribers = [];

            return false;
        }
    }

    // ========================================================================
    // OFFLINE QUEUE MANAGEMENT
    // ========================================================================

    queueOfflineAction(action, data) {
        const queueItem = {
            id: Date.now() + Math.random(),
            action,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        this.offlineQueue.push(queueItem);
        this.saveOfflineQueue();

        return {
            success: true,
            queued: true,
            message: 'Action queued for sync when online'
        };
    }

    async syncOfflineQueue() {
        if (!navigator.onLine || this.offlineQueue.length === 0) {
            return;
        }

        console.log(`Syncing ${this.offlineQueue.length} offline actions...`);

        const queue = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const item of queue) {
            try {
                await this.executeQueuedAction(item);
                console.log(`Synced: ${item.action}`);
            } catch (error) {
                console.error(`Failed to sync ${item.action}:`, error);
                item.retryCount++;
                
                // Re-queue if retry count is less than 3
                if (item.retryCount < 3) {
                    this.offlineQueue.push(item);
                }
            }
        }

        this.saveOfflineQueue();
    }

    async executeQueuedAction(item) {
        switch (item.action) {
            case 'saveCode':
                return await this.saveCode(item.data);
            case 'updateCode':
                return await this.updateCode(item.data.id, item.data);
            case 'deleteCode':
                return await this.deleteCode(item.data.id);
            case 'updateProgress':
                return await this.updateProgress(item.data);
            default:
                throw new Error(`Unknown action: ${item.action}`);
        }
    }

    saveOfflineQueue() {
        try {
            localStorage.setItem('codesahayak_offline_queue', 
                JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }

    loadOfflineQueue() {
        try {
            const saved = localStorage.getItem('codesahayak_offline_queue');
            if (saved) {
                this.offlineQueue = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error);
            this.offlineQueue = [];
        }
    }

    // ========================================================================
    // OFFLINE FALLBACKS
    // ========================================================================

    async getOfflineExplanation(codeData) {
        try {
            const response = await fetch('/offline-explanations.json');
            const explanations = await response.json();
            
            // Simple keyword matching
            const code = codeData.code.toLowerCase();
            let explanation = explanations.default[codeData.language || 'en'];

            if (code.includes('for') || code.includes('while')) {
                explanation = explanations.loops[codeData.language || 'en'];
            } else if (code.includes('function') || code.includes('def')) {
                explanation = explanations.functions[codeData.language || 'en'];
            }

            return {
                explanation,
                offline: true,
                language: codeData.language || 'en'
            };
        } catch (error) {
            return {
                explanation: 'Offline mode: Limited explanations available',
                offline: true
            };
        }
    }

    async getOfflineHint(hintData) {
        const hints = {
            en: [
                'Think about the problem step by step',
                'Consider the data structures you need',
                'Break the problem into smaller parts'
            ],
            hi: [
                'समस्या को चरण दर चरण सोचें',
                'आवश्यक डेटा संरचनाओं पर विचार करें',
                'समस्या को छोटे भागों में तोड़ें'
            ]
        };

        const level = hintData.level || 1;
        const language = hintData.language || 'en';
        const hintList = hints[language] || hints.en;

        return {
            hint: hintList[Math.min(level - 1, hintList.length - 1)],
            level,
            offline: true,
            language
        };
    }

    // ========================================================================
    // SETUP & UTILITIES
    // ========================================================================

    setupInterceptors() {
        // Setup online/offline listeners
        window.addEventListener('online', () => {
            console.log('Back online - syncing queued actions...');
            this.syncOfflineQueue();
        });

        window.addEventListener('offline', () => {
            console.log('Gone offline - actions will be queued');
        });
    }

    handleError(error) {
        console.error('API Error:', error);
        return {
            error: error.message || 'An error occurred',
            details: error
        };
    }
}

// Create global API instance
const api = new APIClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, api };
}
