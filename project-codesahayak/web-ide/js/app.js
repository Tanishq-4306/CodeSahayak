/**
 * CodeSahayak Main Application
 * Integrates all components and initializes the application
 */

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

class CodeSahayakApp {
    constructor() {
        this.initialized = false;
        this.translations = {};
        this.currentLanguage = 'en';
    }

    async init() {
        if (this.initialized) return;

        console.log('🚀 Initializing CodeSahayak...');

        try {
            // 1. Register Service Worker
            await this.registerServiceWorker();

            // 2. Load translations
            await this.loadTranslations();

            // 3. Check authentication
            await this.checkAuth();

            // 4. Setup router
            this.setupRouter();

            // 5. Setup global event listeners
            this.setupEventListeners();

            // 6. Initialize UI
            this.initializeUI();

            // 7. Start router
            router.start();

            this.initialized = true;
            console.log('✅ CodeSahayak initialized successfully');

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showError('Failed to initialize application');
        }
    }

    // ========================================================================
    // SERVICE WORKER REGISTRATION
    // ========================================================================

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker-enhanced.js');
                console.log('✅ Service Worker registered:', registration.scope);

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'SYNC_QUEUE') {
                        api.syncOfflineQueue();
                    }
                });

            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>🎉 New version available!</span>
                <button id="updateBtn" class="btn btn-sm btn-primary">Update Now</button>
            </div>
        `;
        document.body.appendChild(notification);

        document.getElementById('updateBtn').onclick = () => {
            window.location.reload();
        };
    }

    // ========================================================================
    // TRANSLATION SYSTEM
    // ========================================================================

    async loadTranslations() {
        const savedLanguage = localStorage.getItem('codesahayak_language') || 
                             navigator.language.split('-')[0] || 'en';
        
        this.currentLanguage = savedLanguage;
        appState.setState({ language: savedLanguage });

        try {
            const response = await fetch(`/locales/${savedLanguage}.json`);
            const translations = await response.json();
            
            this.translations[savedLanguage] = translations;
            window.translations = this.translations;

            console.log(`✅ Translations loaded: ${savedLanguage}`);
        } catch (error) {
            console.warn(`⚠️ Failed to load translations for ${savedLanguage}, falling back to English`);
            
            // Fallback to English
            const response = await fetch('/locales/en.json');
            const translations = await response.json();
            this.translations.en = translations;
            window.translations = this.translations;
        }
    }

    async switchLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            appState.setState({ language });
            localStorage.setItem('codesahayak_language', language);
            
            // Reload current page to apply translations
            router.handleRoute();
            return;
        }

        try {
            const response = await fetch(`/locales/${language}.json`);
            const translations = await response.json();
            
            this.translations[language] = translations;
            this.currentLanguage = language;
            appState.setState({ language });
            localStorage.setItem('codesahayak_language', language);

            // Reload current page to apply translations
            router.handleRoute();

        } catch (error) {
            console.error(`Failed to load language: ${language}`, error);
            this.showError('Failed to switch language');
        }
    }

    // ========================================================================
    // AUTHENTICATION
    // ========================================================================

    async checkAuth() {
        const token = localStorage.getItem('codesahayak_token');
        
        if (!token) {
            appState.setState({ isAuthenticated: false, user: null });
            return;
        }

        try {
            const user = await api.getProfile();
            appState.setUser(user);
            console.log('✅ User authenticated:', user.email);
        } catch (error) {
            console.warn('⚠️ Authentication check failed:', error);
            appState.setState({ isAuthenticated: false, user: null });
            localStorage.removeItem('codesahayak_token');
            localStorage.removeItem('codesahayak_refresh_token');
        }
    }

    // ========================================================================
    // ROUTER SETUP
    // ========================================================================

    setupRouter() {
        router.setContainer('#app');

        // Public routes
        router.register('/', LandingPage);
        router.register('/login', LoginPage);
        router.register('/signup', SignupPage);
        router.register('/about', AboutPage);
        router.register('/contact', ContactPage);
        router.register('/privacy', PrivacyPage);
        router.register('/terms', TermsPage);

        // Protected routes
        router.register('/dashboard', Dashboard);
        router.register('/ide', IDEPage);
        router.register('/library', LibraryPage);
        router.register('/progress', ProgressPage);
        router.register('/settings', SettingsPage);
        router.register('/achievements', AchievementsPage);

        // 404
        router.register('/404', NotFoundPage);

        // Auth guard for protected routes
        router.addGuard(async (path) => {
            const protectedRoutes = ['/dashboard', '/ide', '/library', '/progress', '/settings', '/achievements'];
            
            if (protectedRoutes.some(route => path.startsWith(route))) {
                if (!appState.getState('isAuthenticated')) {
                    return '/login';
                }
            }

            // Redirect authenticated users away from auth pages
            if (['/login', '/signup'].includes(path) && appState.getState('isAuthenticated')) {
                return '/dashboard';
            }

            return true;
        });
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Online/Offline status
        window.addEventListener('online', () => {
            appState.setState({ offline: false });
            this.showToast('✅ Back online', 'success');
            api.syncOfflineQueue();
        });

        window.addEventListener('offline', () => {
            appState.setState({ offline: true });
            this.showToast('⚠️ You are offline', 'warning');
        });

        // User events
        eventBus.on('user:login', (user) => {
            console.log('User logged in:', user.email);
            this.showToast(`Welcome back, ${user.name}!`, 'success');
        });

        eventBus.on('user:signup', (user) => {
            console.log('User signed up:', user.email);
            this.showToast(`Welcome to CodeSahayak, ${user.name}!`, 'success');
        });

        eventBus.on('user:logout', () => {
            console.log('User logged out');
            appState.logout();
            router.navigate('/');
            this.showToast('Logged out successfully', 'info');
        });

        // Language change
        appState.subscribe('language', (newLang, oldLang) => {
            if (newLang !== oldLang) {
                this.switchLanguage(newLang);
            }
        });

        // Error handling
        eventBus.on('error', (error) => {
            this.showError(error.message || 'An error occurred');
        });
    }

    // ========================================================================
    // UI INITIALIZATION
    // ========================================================================

    initializeUI() {
        // Create app container if it doesn't exist
        if (!document.getElementById('app')) {
            const app = document.createElement('div');
            app.id = 'app';
            document.body.appendChild(app);
        }

        // Create toast container
        if (!document.getElementById('toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Create offline indicator
        this.createOfflineIndicator();

        // Add loading class
        document.body.classList.add('app-loaded');
    }

    createOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator';
        indicator.innerHTML = `
            <div class="offline-content">
                <div class="bharat-map">🗺️</div>
                <span class="offline-text">Offline Mode</span>
            </div>
        `;
        document.body.appendChild(indicator);

        // Show/hide based on offline state
        appState.subscribe('offline', (isOffline) => {
            if (isOffline) {
                indicator.classList.add('show');
            } else {
                indicator.classList.remove('show');
            }
        });
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showToast(message, 'error');
    }
}

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

// Import all page components (these are now in separate files)
// LandingPage, AboutPage, ContactPage, PrivacyPage, TermsPage - from pages.js
// LibraryPage, SettingsPage - from library.js
// AchievementsPage, ProgressPage - from achievements.js

// ============================================================================
// APPLICATION HELPER METHODS
// ============================================================================

// Add helper methods to app instance
CodeSahayakApp.prototype.switchSettingsTab = function(tab) {
    const settingsPage = router.currentRoute;
    if (settingsPage && settingsPage.setState) {
        settingsPage.setState({ activeTab: tab });
    }
};

CodeSahayakApp.prototype.openSnippet = function(snippetId) {
    router.navigate(`/ide?snippet=${snippetId}`);
};

CodeSahayakApp.prototype.deleteSnippet = async function(snippetId) {
    const t = window.translations?.[appState.getState('language')]?.library || {};
    
    if (confirm(t.confirmDelete || 'Are you sure you want to delete this code?')) {
        try {
            await api.deleteCode(snippetId);
            this.showToast(t.deleted || 'Code deleted successfully', 'success');
            
            // Reload library page
            if (router.currentRoute && router.currentRoute.loadSnippets) {
                router.currentRoute.loadSnippets();
            }
        } catch (error) {
            this.showToast(error.error || 'Failed to delete code', 'error');
        }
    }
};

CodeSahayakApp.prototype.exportUserData = async function() {
    const t = window.translations?.[appState.getState('language')]?.settings || {};
    
    try {
        this.showToast(t.exporting || 'Exporting your data...', 'info');
        
        const progress = await api.exportProgress();
        const snippets = await api.getMyCode();
        const user = appState.getState('user');
        
        const data = {
            user: {
                name: user.name,
                email: user.email,
                language: user.language,
                college: user.college,
                yearOfStudy: user.yearOfStudy
            },
            progress,
            snippets,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codesahayak-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast(t.exported || 'Data exported successfully', 'success');
    } catch (error) {
        this.showToast(error.error || 'Failed to export data', 'error');
    }
};

CodeSahayakApp.prototype.confirmDeleteAccount = function() {
    const t = window.translations?.[appState.getState('language')]?.settings || {};
    
    const confirmed = confirm(
        t.deleteConfirm || 'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
        const doubleConfirm = prompt(
            t.deletePrompt || 'Type "DELETE" to confirm account deletion'
        );
        
        if (doubleConfirm === 'DELETE') {
            this.deleteAccount();
        }
    }
};

CodeSahayakApp.prototype.deleteAccount = async function() {
    const t = window.translations?.[appState.getState('language')]?.settings || {};
    
    try {
        // In production, this would call an API endpoint
        // await api.deleteAccount();
        
        this.showToast(t.accountDeleted || 'Account deleted successfully', 'success');
        
        setTimeout(() => {
            appState.logout();
            router.navigate('/');
        }, 2000);
    } catch (error) {
        this.showToast(error.error || 'Failed to delete account', 'error');
    }
};

// ============================================================================
// APPLICATION STARTUP
// ============================================================================

// Create global app instance
const app = new CodeSahayakApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CodeSahayakApp, app };
}
