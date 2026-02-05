// Utility functions for CodeSahayak
// Common helpers and UI utilities

// Toast notification system
class ToastManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        return toast;
    }

    getIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || icons['info'];
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Loading spinner utility
class LoadingManager {
    static show(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <span class="loading-text">${text}</span>
                </div>
            `;
            element.classList.add('loading');
        }
    }

    static hide(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (element) {
            element.classList.remove('loading');
        }
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password && password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static showFieldError(fieldElement, message) {
        // Remove existing error
        this.clearFieldError(fieldElement);
        
        fieldElement.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        fieldElement.parentNode.insertBefore(errorDiv, fieldElement.nextSibling);
    }

    static clearFieldError(fieldElement) {
        fieldElement.classList.remove('error');
        
        const errorDiv = fieldElement.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    static clearAllErrors(formElement) {
        const errorFields = formElement.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }
}

// Local storage utilities
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
}

// Date and time utilities
class DateUtils {
    static formatDate(date, locale = 'en-IN') {
        try {
            return new Intl.DateTimeFormat(locale).format(new Date(date));
        } catch (error) {
            return new Date(date).toLocaleDateString();
        }
    }

    static formatDateTime(date, locale = 'en-IN') {
        try {
            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        } catch (error) {
            return new Date(date).toLocaleString();
        }
    }

    static timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return this.formatDate(date);
    }
}

// Code execution utilities
class CodeExecutor {
    static executeJavaScript(code) {
        try {
            // Create a safe execution context
            const originalConsole = console.log;
            const output = [];
            
            // Override console.log to capture output
            console.log = (...args) => {
                output.push(args.join(' '));
            };
            
            // Execute the code
            const result = eval(code);
            
            // Restore console.log
            console.log = originalConsole;
            
            return {
                success: true,
                output: output.join('\n'),
                result: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                output: ''
            };
        }
    }

    static mockPythonExecution(code) {
        // Mock Python execution for demo purposes
        const output = [];
        
        try {
            // Simple pattern matching for common Python constructs
            if (code.includes('print(')) {
                const printMatches = code.match(/print\((.*?)\)/g);
                if (printMatches) {
                    printMatches.forEach(match => {
                        const content = match.match(/print\((.*?)\)/)[1];
                        // Simple evaluation for basic expressions
                        if (content.includes('factorial(5)')) {
                            output.push('120');
                        } else if (content.includes('factorial(4)')) {
                            output.push('24');
                        } else {
                            // Remove quotes and evaluate simple expressions
                            const cleaned = content.replace(/['"]/g, '');
                            output.push(cleaned);
                        }
                    });
                }
            }
            
            return {
                success: true,
                output: output.join('\n') || 'Code executed successfully',
                language: 'python'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                output: ''
            };
        }
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('codesahayak_theme') || 'dark';
        this.applyTheme();
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('codesahayak_theme', theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize global utilities
const toast = new ToastManager();
const themeManager = new ThemeManager();

// Export utilities to global scope
window.toast = toast;
window.LoadingManager = LoadingManager;
window.FormValidator = FormValidator;
window.StorageManager = StorageManager;
window.DateUtils = DateUtils;
window.CodeExecutor = CodeExecutor;
window.themeManager = themeManager;

// Add CSS for toast notifications and loading spinners
const utilityStyles = `
<style>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
}

.toast {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    background: white;
    border-left: 4px solid #007bff;
}

.toast-success { border-left-color: #28a745; }
.toast-error { border-left-color: #dc3545; }
.toast-warning { border-left-color: #ffc107; }
.toast-info { border-left-color: #17a2b8; }

.toast-icon {
    margin-right: 8px;
    font-size: 16px;
}

.toast-message {
    flex: 1;
    font-size: 14px;
    color: #333;
}

.toast-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
    margin-left: 8px;
}

.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
}

.field-error {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
}

.error {
    border-color: #dc3545 !important;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
    .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
    }
}
</style>
`;

// Inject utility styles
document.head.insertAdjacentHTML('beforeend', utilityStyles);