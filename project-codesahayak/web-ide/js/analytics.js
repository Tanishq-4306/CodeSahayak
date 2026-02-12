/**
 * CodeSahayak Analytics System
 * Tracks user journey, learning patterns, and system performance
 * Privacy-focused analytics for Indian students
 */

class CodeSahayakAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.startTime = Date.now();
        this.events = [];
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupEventListeners();
        this.initializeSession();
    }

    generateSessionId() {
        return 'cs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventListeners() {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineEvents();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Page visibility for session tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('session_pause');
            } else {
                this.trackEvent('session_resume');
            }
        });

        // Unload tracking
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: Date.now() - this.startTime,
                eventsCount: this.events.length
            });
            this.flushEvents();
        });
    }

    initializeSession() {
        // Get user info if authenticated
        const user = JSON.parse(localStorage.getItem('codesahayak_user') || 'null');
        if (user) {
            this.userId = user.id;
        }

        // Track session start
        this.trackEvent('session_start', {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform
        });
    }

    /**
     * Track user journey events
     * @param {string} event - Event name
     * @param {object} data - Additional event data
     * @param {string} category - Event category (learning, ui, system, etc.)
     */
    trackEvent(event, data = {}, category = 'general') {
        const eventData = {
            id: this.generateEventId(),
            sessionId: this.sessionId,
            userId: this.userId,
            event,
            category,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            referrer: document.referrer
        };

        this.events.push(eventData);
        
        // Send to server if online, otherwise queue
        if (this.isOnline) {
            this.sendEvent(eventData);
        } else {
            this.offlineQueue.push(eventData);
        }

        // Store in localStorage for persistence
        this.storeEventLocally(eventData);
        
        console.log('📊 Analytics:', event, data);
    }

    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    async sendEvent(eventData) {
        try {
            const response = await fetch('/api/analytics/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(window.authManager?.getAuthHeaders() || {})
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                // If failed, add to offline queue
                this.offlineQueue.push(eventData);
            }
        } catch (error) {
            console.error('Analytics send failed:', error);
            this.offlineQueue.push(eventData);
        }
    }

    storeEventLocally(eventData) {
        try {
            const stored = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            stored.push(eventData);
            
            // Keep only last 100 events locally
            if (stored.length > 100) {
                stored.splice(0, stored.length - 100);
            }
            
            localStorage.setItem('analytics_events', JSON.stringify(stored));
        } catch (error) {
            console.error('Local analytics storage failed:', error);
        }
    }

    async syncOfflineEvents() {
        if (this.offlineQueue.length === 0) return;

        console.log(`📊 Syncing ${this.offlineQueue.length} offline analytics events`);

        const eventsToSync = [...this.offlineQueue];
        this.offlineQueue = [];

        try {
            const response = await fetch('/api/analytics/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(window.authManager?.getAuthHeaders() || {})
                },
                body: JSON.stringify({ events: eventsToSync })
            });

            if (!response.ok) {
                // Re-add to queue if failed
                this.offlineQueue.push(...eventsToSync);
            } else {
                console.log('✅ Analytics events synced successfully');
            }
        } catch (error) {
            console.error('Analytics sync failed:', error);
            this.offlineQueue.push(...eventsToSync);
        }
    }

    flushEvents() {
        // Send any remaining events synchronously (for page unload)
        if (this.offlineQueue.length > 0) {
            navigator.sendBeacon('/api/analytics/batch', JSON.stringify({
                events: this.offlineQueue
            }));
        }
    }

    // ========== LEARNING ANALYTICS ==========

    trackLearningEvent(concept, action, data = {}) {
        this.trackEvent(`learning_${action}`, {
            concept,
            ...data
        }, 'learning');
    }

    trackCodeExecution(language, code, success, output = '') {
        this.trackEvent('code_executed', {
            language,
            codeLength: code.length,
            success,
            outputLength: output.length,
            linesOfCode: code.split('\n').length
        }, 'learning');
    }

    trackAIInteraction(type, concept, language, success = true) {
        this.trackEvent('ai_interaction', {
            type, // 'explain', 'hint', 'error'
            concept,
            language,
            success
        }, 'learning');
    }

    trackProgressUpdate(concept, mastery, attempts, hintsUsed) {
        this.trackEvent('progress_update', {
            concept,
            mastery,
            attempts,
            hintsUsed,
            masteryLevel: this.getMasteryLevel(mastery)
        }, 'learning');
    }

    getMasteryLevel(mastery) {
        if (mastery >= 0.8) return 'expert';
        if (mastery >= 0.6) return 'proficient';
        if (mastery >= 0.4) return 'developing';
        return 'beginner';
    }

    // ========== UI ANALYTICS ==========

    trackUIEvent(element, action, data = {}) {
        this.trackEvent(`ui_${action}`, {
            element,
            ...data
        }, 'ui');
    }

    trackPageView(page) {
        this.trackEvent('page_view', {
            page,
            loadTime: performance.now()
        }, 'navigation');
    }

    trackLanguageChange(from, to) {
        this.trackEvent('language_change', {
            from,
            to
        }, 'ui');
    }

    trackThemeChange(theme) {
        this.trackEvent('theme_change', {
            theme
        }, 'ui');
    }

    // ========== ERROR ANALYTICS ==========

    trackError(error, context = '') {
        this.trackEvent('error_occurred', {
            message: error.message,
            stack: error.stack,
            context,
            userAgent: navigator.userAgent
        }, 'error');
    }

    trackAPIError(endpoint, status, message) {
        this.trackEvent('api_error', {
            endpoint,
            status,
            message
        }, 'error');
    }

    // ========== PERFORMANCE ANALYTICS ==========

    trackPerformance(metric, value, context = '') {
        this.trackEvent('performance_metric', {
            metric,
            value,
            context
        }, 'performance');
    }

    trackLoadTime(page, loadTime) {
        this.trackEvent('page_load_time', {
            page,
            loadTime
        }, 'performance');
    }

    // ========== ENGAGEMENT ANALYTICS ==========

    trackEngagement(action, duration = 0, data = {}) {
        this.trackEvent(`engagement_${action}`, {
            duration,
            ...data
        }, 'engagement');
    }

    trackTimeSpent(activity, startTime) {
        const duration = Date.now() - startTime;
        this.trackEvent('time_spent', {
            activity,
            duration
        }, 'engagement');
    }

    // ========== CULTURAL ANALYTICS ==========

    trackCulturalPreference(language, metaphorUsed, understood = null) {
        this.trackEvent('cultural_interaction', {
            language,
            metaphorUsed,
            understood
        }, 'cultural');
    }

    trackLanguageEffectiveness(concept, language, hintsNeeded, timeToSolve) {
        this.trackEvent('language_effectiveness', {
            concept,
            language,
            hintsNeeded,
            timeToSolve
        }, 'cultural');
    }

    // ========== STREAK AND ACHIEVEMENT ANALYTICS ==========

    trackStreakUpdate(currentStreak, previousStreak) {
        this.trackEvent('streak_update', {
            currentStreak,
            previousStreak,
            streakChange: currentStreak - previousStreak
        }, 'achievement');
    }

    trackAchievementUnlock(achievement, criteria) {
        this.trackEvent('achievement_unlock', {
            achievement,
            criteria
        }, 'achievement');
    }

    // ========== ANALYTICS DASHBOARD METHODS ==========

    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            eventsCount: this.events.length,
            categories: this.getEventsByCategory()
        };
    }

    getEventsByCategory() {
        const categories = {};
        this.events.forEach(event => {
            categories[event.category] = (categories[event.category] || 0) + 1;
        });
        return categories;
    }

    getLearningInsights() {
        const learningEvents = this.events.filter(e => e.category === 'learning');
        const concepts = {};
        const languages = {};

        learningEvents.forEach(event => {
            if (event.data.concept) {
                concepts[event.data.concept] = (concepts[event.data.concept] || 0) + 1;
            }
            if (event.data.language) {
                languages[event.data.language] = (languages[event.data.language] || 0) + 1;
            }
        });

        return {
            totalLearningEvents: learningEvents.length,
            conceptsExplored: Object.keys(concepts).length,
            languagesUsed: Object.keys(languages).length,
            mostExploredConcept: Object.keys(concepts).reduce((a, b) => 
                concepts[a] > concepts[b] ? a : b, ''),
            preferredLanguage: Object.keys(languages).reduce((a, b) => 
                languages[a] > languages[b] ? a : b, '')
        };
    }

    // ========== PRIVACY METHODS ==========

    anonymizeData() {
        // Remove personally identifiable information
        this.userId = 'anonymous_' + this.sessionId;
        this.events.forEach(event => {
            event.userId = this.userId;
            delete event.data.email;
            delete event.data.name;
        });
    }

    clearAnalyticsData() {
        this.events = [];
        this.offlineQueue = [];
        localStorage.removeItem('analytics_events');
        console.log('📊 Analytics data cleared');
    }

    exportAnalyticsData() {
        const data = {
            session: this.getSessionSummary(),
            events: this.events,
            insights: this.getLearningInsights()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codesahayak_analytics_${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ========== GLOBAL ANALYTICS INSTANCE ==========
window.analytics = new CodeSahayakAnalytics();

// ========== CONVENIENCE FUNCTIONS ==========

// Quick tracking functions for common events
window.trackUserJourney = (step, data = {}) => {
    window.analytics.trackEvent(`journey_${step}`, data, 'journey');
};

window.trackLearning = (concept, action, data = {}) => {
    window.analytics.trackLearningEvent(concept, action, data);
};

window.trackUI = (element, action, data = {}) => {
    window.analytics.trackUIEvent(element, action, data);
};

window.trackError = (error, context = '') => {
    window.analytics.trackError(error, context);
};

// ========== AUTO-TRACKING SETUP ==========

// Auto-track page views
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    window.analytics.trackPageView(page);
});

// Auto-track clicks on important elements
document.addEventListener('click', (event) => {
    const element = event.target;
    
    // Track button clicks
    if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
        const buttonText = element.textContent.trim();
        const buttonId = element.id || 'unknown';
        
        window.analytics.trackUIEvent('button', 'click', {
            text: buttonText,
            id: buttonId,
            className: element.className
        });
    }
    
    // Track navigation clicks
    if (element.tagName === 'A' && element.href) {
        window.analytics.trackUIEvent('link', 'click', {
            href: element.href,
            text: element.textContent.trim()
        });
    }
});

// Auto-track form submissions
document.addEventListener('submit', (event) => {
    const form = event.target;
    const formId = form.id || 'unknown';
    
    window.analytics.trackUIEvent('form', 'submit', {
        id: formId,
        action: form.action,
        method: form.method
    });
});

// Auto-track errors
window.addEventListener('error', (event) => {
    window.analytics.trackError(event.error, 'global_error_handler');
});

// Auto-track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    window.analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection');
});

console.log('📊 CodeSahayak Analytics initialized');
console.log('📊 Session ID:', window.analytics.sessionId);