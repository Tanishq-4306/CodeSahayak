// API client for CodeSahayak backend
// Handles all HTTP requests with authentication

const API_BASE = 'http://localhost:3000/api';
const FRONTEND_URL = window.location.origin;

class APIClient {
    constructor() {
        this.baseURL = API_BASE;
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
        
        // Handle token expiration
        if (response.status === 401 || response.status === 403) {
            this.clearToken();
            if (!window.location.pathname.includes('login')) {
                window.location.href = `${FRONTEND_URL}/login.html?session=expired`;
            }
            throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'API request failed');
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

    async getDetailedProgress() {
        try {
            const response = await fetch(`${this.baseURL}/progress/detailed`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get detailed progress error:', error);
            throw error;
        }
    }

    async getRecommendations() {
        try {
            const response = await fetch(`${this.baseURL}/progress/recommendations`, {
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Get recommendations error:', error);
            throw error;
        }
    }

    async updateLanguage(language) {
        try {
            const response = await fetch(`${this.baseURL}/auth/language`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ language })
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Update language error:', error);
            throw error;
        }
    }

    async explainError(errorData) {
        try {
            const response = await fetch(`${this.baseURL}/ai/error-explain`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(errorData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Explain error error:', error);
            throw error;
        }
    }

    async explainConcept(conceptData) {
        try {
            const response = await fetch(`${this.baseURL}/ai/concept-explain`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(conceptData)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Explain concept error:', error);
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

// Utility functions for error handling and notifications
function handleApiError(error, defaultMessage = 'Something went wrong') {
    console.error('API Error:', error);
    const message = error.message || defaultMessage;
    
    // Show user-friendly error
    if (window.toast) {
        window.toast.error(message);
    } else {
        showToast(message, 'error');
    }
    
    return message;
}

function showSuccess(message) {
    if (window.toast) {
        window.toast.success(message);
    } else {
        showToast(message, 'success');
    }
}

function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(toast);
    }
    
    // Set color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    toast.style.transform = 'translateX(0)';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
    }, 3000);
}

// Auto-redirect to login if not authenticated (for protected pages)
function requireAuth() {
    if (!apiClient.isAuthenticated()) {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login') && !currentPath.includes('signup')) {
            window.location.href = `${FRONTEND_URL}/login.html?redirect=${encodeURIComponent(currentPath)}`;
        }
        return false;
    }
    return true;
}

// Auto-redirect to dashboard if already authenticated (for auth pages)
function redirectIfAuthenticated() {
    if (apiClient.isAuthenticated()) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'dashboard.html';
        window.location.href = redirect;
        return true;
    }
    return false;
}

// Check if backend is running
async function checkBackendHealth() {
    try {
        const response = await fetch('http://localhost:3000/health');
        return await response.json();
    } catch (error) {
        console.error('Backend health check failed:', error);
        return { status: 'ERROR', error: error.message };
    }
}

// Export for use in other modules
window.apiClient = apiClient;
window.requireAuth = requireAuth;
window.redirectIfAuthenticated = redirectIfAuthenticated;
window.handleApiError = handleApiError;
window.showSuccess = showSuccess;
window.checkBackendHealth = checkBackendHealth;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check auth for protected pages
    const protectedPages = ['dashboard', 'ide', 'library', 'progress', 'settings'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        requireAuth();
    }
    
    // Setup global error handler for network issues
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message) {
            if (event.reason.message.includes('401') || event.reason.message.includes('403')) {
                apiClient.clearToken();
                window.location.href = `${FRONTEND_URL}/login.html?session=expired`;
            }
        }
    });
    
    console.log('✅ CodeSahayak API client initialized');
});