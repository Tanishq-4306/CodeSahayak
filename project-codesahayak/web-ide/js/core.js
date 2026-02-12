/**
 * CodeSahayak Core Architecture
 * Component-based system with state management and routing
 */

// ============================================================================
// COMPONENT SYSTEM
// ============================================================================

class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.children = [];
        this.mounted = false;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (this.mounted) {
            this.update();
        }
    }

    render() {
        // Override in subclasses
        return '';
    }

    mount(container) {
        const html = this.render();
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = html;
            this.element = container.firstElementChild || container;
            this.mounted = true;
            this.afterMount();
        }
    }

    update() {
        if (this.element && this.element.parentNode) {
            const html = this.render();
            const temp = document.createElement('div');
            temp.innerHTML = html;
            this.element.parentNode.replaceChild(temp.firstElementChild, this.element);
            this.element = temp.firstElementChild;
            this.afterUpdate();
        }
    }

    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.mounted = false;
            this.afterUnmount();
        }
    }

    afterMount() {
        // Override for lifecycle hook
    }

    afterUpdate() {
        // Override for lifecycle hook
    }

    afterUnmount() {
        // Override for lifecycle hook
    }
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

class StateManager {
    constructor() {
        this.state = {
            user: null,
            isAuthenticated: false,
            language: 'en',
            theme: 'light',
            offline: !navigator.onLine,
            loading: false,
            error: null
        };
        this.listeners = new Map();
        this.setupOnlineListener();
    }

    setupOnlineListener() {
        window.addEventListener('online', () => this.setState({ offline: false }));
        window.addEventListener('offline', () => this.setState({ offline: true }));
    }

    getState(key) {
        return key ? this.state[key] : this.state;
    }

    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Notify listeners
        Object.keys(updates).forEach(key => {
            if (this.listeners.has(key)) {
                this.listeners.get(key).forEach(callback => {
                    callback(this.state[key], prevState[key]);
                });
            }
        });

        // Notify global listeners
        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(callback => {
                callback(this.state, prevState);
            });
        }
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    // Authentication helpers
    setUser(user) {
        this.setState({ 
            user, 
            isAuthenticated: !!user,
            language: user?.language || this.state.language
        });
    }

    logout() {
        localStorage.removeItem('codesahayak_token');
        localStorage.removeItem('codesahayak_refresh_token');
        this.setState({ 
            user: null, 
            isAuthenticated: false 
        });
    }

    // Loading state helpers
    setLoading(loading) {
        this.setState({ loading });
    }

    setError(error) {
        this.setState({ error });
    }

    clearError() {
        this.setState({ error: null });
    }
}

// Global state instance
const appState = new StateManager();

// ============================================================================
// ROUTER
// ============================================================================

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.container = null;
        this.guards = [];
        
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => this.handleLinkClick(e));
    }

    register(path, component, options = {}) {
        this.routes.set(path, { component, options });
    }

    addGuard(guardFn) {
        this.guards.push(guardFn);
    }

    setContainer(container) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
    }

    navigate(path, replace = false) {
        if (replace) {
            window.history.replaceState({}, '', path);
        } else {
            window.history.pushState({}, '', path);
        }
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        
        // Run guards
        for (const guard of this.guards) {
            const result = await guard(path);
            if (result !== true) {
                if (typeof result === 'string') {
                    this.navigate(result, true);
                }
                return;
            }
        }

        // Find matching route
        let route = this.routes.get(path);
        
        // Try to match dynamic routes
        if (!route) {
            for (const [routePath, routeData] of this.routes) {
                if (this.matchRoute(routePath, path)) {
                    route = routeData;
                    break;
                }
            }
        }

        // Handle 404
        if (!route) {
            route = this.routes.get('/404') || { 
                component: () => '<h1>404 - Page Not Found</h1>' 
            };
        }

        // Unmount current component
        if (this.currentRoute && this.currentRoute.unmount) {
            this.currentRoute.unmount();
        }

        // Mount new component
        if (this.container) {
            if (typeof route.component === 'function') {
                const ComponentClass = route.component;
                this.currentRoute = new ComponentClass();
                this.currentRoute.mount(this.container);
            } else {
                this.container.innerHTML = route.component;
            }
        }
    }

    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');

        if (routeParts.length !== actualParts.length) return false;

        return routeParts.every((part, i) => {
            return part.startsWith(':') || part === actualParts[i];
        });
    }

    handleLinkClick(e) {
        const link = e.target.closest('a[data-link]');
        if (link) {
            e.preventDefault();
            this.navigate(link.getAttribute('href'));
        }
    }

    start() {
        this.handleRoute();
    }
}

// Global router instance
const router = new Router();

// ============================================================================
// EVENT BUS
// ============================================================================

class EventBus {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);

        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }

    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// Global event bus
const eventBus = new EventBus();

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary {
    constructor() {
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    handleError(error) {
        console.error('Application Error:', error);
        
        appState.setError({
            message: error.message || 'An unexpected error occurred',
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        eventBus.emit('error', error);

        // Show user-friendly error message
        this.showErrorToast(error.message || 'Something went wrong');
    }

    showErrorToast(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">❌</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Initialize error boundary
const errorBoundary = new ErrorBoundary();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Format date
    formatDate(date, locale = 'en') {
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format time ago
    timeAgo(date, translations = {}) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return translations[unit] 
                    ? `${interval} ${translations[unit]}${interval > 1 ? 's' : ''} ago`
                    : `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return translations.justNow || 'just now';
    },

    // Sanitize HTML
    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    // Generate unique ID
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if object is empty
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Component,
        StateManager,
        Router,
        EventBus,
        ErrorBoundary,
        appState,
        router,
        eventBus,
        utils
    };
}
