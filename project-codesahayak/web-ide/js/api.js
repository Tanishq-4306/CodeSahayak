// API client for CodeSahayak backend
// Handles all HTTP requests with authentication

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('codesahayak_token');
    }

    // Get authorization headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Handle API responses
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('codesahayak_token', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('codesahayak_token');
        localStorage.removeItem('codesahayak_user');
    }

    // AUTH ENDPOINTS
    async signup(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            
            const data = await this.handleResponse(response);
            
            if (data.token) {
                this.setToken(data.token);
                localStorage.setItem('codesahayak_user', JSON.stringify(data.user));
            }
            
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(credentials)
            });
            
            const data = await this.handleResponse(response);
            
            if (data.token) {
                this.setToken(data.token);
                localStorage.setItem('codesahayak_user', JSON.stringify(data.user));
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    // CODE ENDPOINTS
    async saveCode(codeData) {
        try {
            const response = await fetch(`${this.baseURL}/code/save`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(codeData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Save code error:', error);
            throw error;
        }
    }

    async getMySnippets() {
        try {
            const response = await fetch(`${this.baseURL}/code/mine`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get snippets error:', error);
            throw error;
        }
    }

    async getSnippet(id) {
        try {
            const response = await fetch(`${this.baseURL}/code/${id}`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get snippet error:', error);
            throw error;
        }
    }

    // AI TUTOR ENDPOINTS
    async explainCode(codeData) {
        try {
            const response = await fetch(`${this.baseURL}/ai/explain`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(codeData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Explain code error:', error);
            throw error;
        }
    }

    async getHint(hintData) {
        try {
            const response = await fetch(`${this.baseURL}/ai/hint`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(hintData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get hint error:', error);
            throw error;
        }
    }

    // PROGRESS ENDPOINTS
    async updateProgress(progressData) {
        try {
            const response = await fetch(`${this.baseURL}/progress/update`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(progressData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update progress error:', error);
            throw error;
        }
    }

    async getProgressStats() {
        try {
            const response = await fetch(`${this.baseURL}/progress/stats`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get progress stats error:', error);
            throw error;
        }
    }

    // UTILITY METHODS
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('codesahayak_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    logout() {
        this.clearToken();
        window.location.href = 'login.html';
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch('http://localhost:3000/health');
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', error: error.message };
        }
    }
}

// Global API client instance
const apiClient = new APIClient();

// Auto-redirect to login if not authenticated (for protected pages)
function requireAuth() {
    if (!apiClient.isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Auto-redirect to dashboard if already authenticated (for auth pages)
function redirectIfAuthenticated() {
    if (apiClient.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}

// Export for use in other modules
window.apiClient = apiClient;
window.requireAuth = requireAuth;
window.redirectIfAuthenticated = redirectIfAuthenticated;