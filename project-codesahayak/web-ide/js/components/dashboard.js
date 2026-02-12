/**
 * Dashboard Components for CodeSahayak
 * Stats, Progress, Achievements, and Activity Tracking
 */

// ============================================================================
// STATS CARDS COMPONENT
// ============================================================================

class StatsCards extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            stats: {
                problemsSolved: 0,
                learningHours: 0,
                streakDays: 0,
                conceptsMastered: 0
            },
            loading: true,
            animating: false
        };
    }

    async afterMount() {
        await this.loadStats();
        this.animateCounters();
    }

    async loadStats() {
        try {
            const stats = await api.getStats();
            this.setState({ 
                stats: {
                    problemsSolved: stats.solved_concepts || 0,
                    learningHours: Math.floor((stats.total_time || 0) / 3600),
                    streakDays: stats.current_streak || 0,
                    conceptsMastered: stats.total_concepts || 0
                },
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
            this.setState({ loading: false });
        }
    }

    animateCounters() {
        this.setState({ animating: true });
        setTimeout(() => this.setState({ animating: false }), 1000);
    }

    render() {
        const { stats, loading, animating } = this.state;
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};

        if (loading) {
            return `
                <div class="stats-cards">
                    ${[1,2,3,4].map(() => `
                        <div class="stat-card skeleton">
                            <div class="skeleton-icon"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-number"></div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="stats-cards">
                <div class="stat-card ${animating ? 'animate' : ''}">
                    <div class="stat-icon">📊</div>
                    <div class="stat-label">${t.problemsSolved || 'Problems Solved'}</div>
                    <div class="stat-value" data-target="${stats.problemsSolved}">
                        ${stats.problemsSolved}
                    </div>
                </div>

                <div class="stat-card ${animating ? 'animate' : ''}">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-label">${t.learningHours || 'Learning Hours'}</div>
                    <div class="stat-value" data-target="${stats.learningHours}">
                        ${stats.learningHours}
                    </div>
                </div>

                <div class="stat-card ${animating ? 'animate' : ''} streak-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-label">${t.streakDays || 'Day Streak'}</div>
                    <div class="stat-value" data-target="${stats.streakDays}">
                        ${stats.streakDays}
                    </div>
                </div>

                <div class="stat-card ${animating ? 'animate' : ''}">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-label">${t.conceptsMastered || 'Concepts Mastered'}</div>
                    <div class="stat-value" data-target="${stats.conceptsMastered}">
                        ${stats.conceptsMastered}
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// CONCEPT MASTERY BARS COMPONENT
// ============================================================================

class ConceptMasteryBars extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            concepts: [],
            loading: true
        };
    }

    async afterMount() {
        await this.loadConcepts();
    }

    async loadConcepts() {
        try {
            const progress = await api.getDetailedProgress();
            const concepts = progress.concepts || [];
            
            // Sort by mastery score
            concepts.sort((a, b) => b.mastery_score - a.mastery_score);
            
            this.setState({ 
                concepts: concepts.slice(0, 6), // Top 6 concepts
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load concepts:', error);
            this.setState({ loading: false });
        }
    }

    getRecommendation(mastery) {
        if (mastery >= 0.8) return { text: 'Excellent', class: 'excellent' };
        if (mastery >= 0.6) return { text: 'Good', class: 'good' };
        if (mastery >= 0.4) return { text: 'Practice More', class: 'practice' };
        return { text: 'Needs Work', class: 'needs-work' };
    }

    render() {
        const { concepts, loading } = this.state;
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};

        if (loading) {
            return `
                <div class="concept-mastery-section">
                    <h2 class="section-title">${t.conceptMastery || 'Concept Mastery'}</h2>
                    <div class="concept-mastery-bars">
                        ${[1,2,3,4,5,6].map(() => `
                            <div class="concept-bar skeleton">
                                <div class="skeleton-text"></div>
                                <div class="skeleton-bar"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (concepts.length === 0) {
            return `
                <div class="concept-mastery-section">
                    <h2 class="section-title">${t.conceptMastery || 'Concept Mastery'}</h2>
                    <div class="empty-state">
                        <div class="empty-icon">📚</div>
                        <p>${t.noConcepts || 'Start solving problems to track your progress'}</p>
                        <a href="/ide" class="btn btn-primary" data-link>
                            ${t.startCoding || 'Start Coding'}
                        </a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="concept-mastery-section">
                <h2 class="section-title">${t.conceptMastery || 'Concept Mastery'}</h2>
                <div class="concept-mastery-bars">
                    ${concepts.map(concept => {
                        const recommendation = this.getRecommendation(concept.mastery_score);
                        const percentage = Math.round(concept.mastery_score * 100);
                        
                        return `
                            <div class="concept-bar">
                                <div class="concept-header">
                                    <span class="concept-name">
                                        ${this.getConceptIcon(concept.concept)} 
                                        ${concept.concept}
                                    </span>
                                    <span class="concept-percentage">${percentage}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div 
                                        class="progress-fill ${recommendation.class}" 
                                        style="width: ${percentage}%"
                                    ></div>
                                </div>
                                <div class="concept-footer">
                                    <span class="concept-attempts">
                                        ${concept.attempts} ${t.attempts || 'attempts'}
                                    </span>
                                    <span class="concept-recommendation ${recommendation.class}">
                                        ${recommendation.text}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    getConceptIcon(concept) {
        const icons = {
            variables: '📦',
            loops: '🔄',
            functions: '⚙️',
            arrays: '📊',
            objects: '🎯',
            classes: '🏗️',
            recursion: '♾️',
            algorithms: '🧮'
        };
        return icons[concept.toLowerCase()] || '📝';
    }
}

// ============================================================================
// STREAK CALENDAR COMPONENT
// ============================================================================

class StreakCalendar extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            activeDays: [],
            currentStreak: 0,
            loading: true
        };
    }

    async afterMount() {
        await this.loadStreakData();
    }

    async loadStreakData() {
        try {
            const stats = await api.getStats();
            const progress = await api.getDetailedProgress();
            
            // Get last 21 days of activity
            const activeDays = this.getActiveDays(progress.recent || []);
            
            this.setState({ 
                activeDays,
                currentStreak: stats.current_streak || 0,
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load streak data:', error);
            this.setState({ loading: false });
        }
    }

    getActiveDays(recentProgress) {
        const days = new Set();
        recentProgress.forEach(item => {
            if (item.solved) {
                const date = new Date(item.last_attempt).toISOString().split('T')[0];
                days.add(date);
            }
        });
        return Array.from(days);
    }

    getLast21Days() {
        const days = [];
        const today = new Date();
        
        for (let i = 20; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        
        return days;
    }

    render() {
        const { activeDays, currentStreak, loading } = this.state;
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};

        if (loading) {
            return `
                <div class="streak-calendar-section">
                    <h2 class="section-title">${t.yourStreak || 'Your Streak'}</h2>
                    <div class="skeleton-calendar"></div>
                </div>
            `;
        }

        const days = this.getLast21Days();
        const today = new Date().toISOString().split('T')[0];

        return `
            <div class="streak-calendar-section">
                <div class="streak-header">
                    <h2 class="section-title">${t.yourStreak || 'Your Streak'}</h2>
                    <div class="streak-count">
                        <span class="streak-flame">🔥</span>
                        <span class="streak-number">${currentStreak}</span>
                        <span class="streak-label">${t.days || 'days'}</span>
                    </div>
                </div>
                
                <div class="streak-calendar">
                    ${days.map(date => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isActive = activeDays.includes(dateStr);
                        const isToday = dateStr === today;
                        const isFuture = date > new Date();
                        
                        return `
                            <div 
                                class="calendar-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}"
                                title="${date.toLocaleDateString()}"
                            >
                                <div class="day-number">${date.getDate()}</div>
                                ${isActive ? '<div class="day-indicator">✓</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="streak-message">
                    ${currentStreak > 0 
                        ? `<p class="streak-encouragement">
                            ${currentStreak >= 7 
                                ? t.greatStreak || '🎉 Amazing streak! Keep it going!' 
                                : t.keepGoing || '💪 Keep going! You\'re doing great!'}
                           </p>`
                        : `<p class="streak-start">
                            ${t.startStreak || '🚀 Start your coding streak today!'}
                           </p>`
                    }
                </div>
            </div>
        `;
    }
}

// ============================================================================
// RECENT ACTIVITY COMPONENT
// ============================================================================

class RecentActivity extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            activities: [],
            loading: true
        };
    }

    async afterMount() {
        await this.loadActivities();
    }

    async loadActivities() {
        try {
            const progress = await api.getDetailedProgress();
            const activities = (progress.recent || []).slice(0, 10);
            
            this.setState({ 
                activities,
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load activities:', error);
            this.setState({ loading: false });
        }
    }

    render() {
        const { activities, loading } = this.state;
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};

        if (loading) {
            return `
                <div class="recent-activity-section">
                    <h2 class="section-title">${t.recentActivity || 'Recent Activity'}</h2>
                    <div class="activity-list">
                        ${[1,2,3,4,5].map(() => `
                            <div class="activity-item skeleton">
                                <div class="skeleton-icon"></div>
                                <div class="skeleton-text"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (activities.length === 0) {
            return `
                <div class="recent-activity-section">
                    <h2 class="section-title">${t.recentActivity || 'Recent Activity'}</h2>
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <p>${t.noActivity || 'No recent activity yet'}</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="recent-activity-section">
                <h2 class="section-title">${t.recentActivity || 'Recent Activity'}</h2>
                <div class="activity-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon ${activity.solved ? 'success' : 'pending'}">
                                ${activity.solved ? '✅' : '🔄'}
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">
                                    ${activity.concept}
                                </div>
                                <div class="activity-meta">
                                    <span class="activity-time">
                                        ${utils.timeAgo(activity.last_attempt)}
                                    </span>
                                    <span class="activity-attempts">
                                        ${activity.attempts} ${t.attempts || 'attempts'}
                                    </span>
                                    ${activity.hints_used > 0 ? `
                                        <span class="activity-hints">
                                            💡 ${activity.hints_used} ${t.hints || 'hints'}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="activity-action">
                                <button 
                                    class="btn btn-sm btn-ghost"
                                    onclick="router.navigate('/ide?concept=${activity.concept}')"
                                >
                                    ${t.practice || 'Practice'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

class Dashboard extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            user: appState.getState('user')
        };
    }

    render() {
        const { user } = this.state;
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};
        
        const greeting = this.getGreeting();

        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="welcome-section">
                        <h1 class="welcome-title">
                            ${greeting}, ${user?.name || 'Student'}! 👋
                        </h1>
                        <p class="welcome-subtitle">
                            ${t.welcomeMessage || 'Ready to continue your coding journey?'}
                        </p>
                    </div>
                    <div class="quick-actions">
                        <a href="/ide" class="btn btn-primary" data-link>
                            <span>💻</span>
                            ${t.startCoding || 'Start Coding'}
                        </a>
                        <a href="/library" class="btn btn-secondary" data-link>
                            <span>📚</span>
                            ${t.myLibrary || 'My Library'}
                        </a>
                    </div>
                </div>

                <div id="statsCards"></div>

                <div class="dashboard-grid">
                    <div class="dashboard-main">
                        <div id="conceptMastery"></div>
                        <div id="recentActivity"></div>
                    </div>
                    <div class="dashboard-sidebar">
                        <div id="streakCalendar"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getGreeting() {
        const hour = new Date().getHours();
        const t = window.translations?.[appState.getState('language')]?.dashboard || {};
        
        if (hour < 12) return t.goodMorning || 'Good morning';
        if (hour < 18) return t.goodAfternoon || 'Good afternoon';
        return t.goodEvening || 'Good evening';
    }

    afterMount() {
        // Mount child components
        const statsCards = new StatsCards();
        statsCards.mount('#statsCards');

        const conceptMastery = new ConceptMasteryBars();
        conceptMastery.mount('#conceptMastery');

        const recentActivity = new RecentActivity();
        recentActivity.mount('#recentActivity');

        const streakCalendar = new StreakCalendar();
        streakCalendar.mount('#streakCalendar');
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatsCards,
        ConceptMasteryBars,
        StreakCalendar,
        RecentActivity,
        Dashboard
    };
}
