/**
 * Achievements and Progress Page Components
 */

// ============================================================================
// ACHIEVEMENTS PAGE
// ============================================================================

class AchievementsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            achievements: [],
            userAchievements: [],
            loading: true
        };
    }

    async afterMount() {
        await this.loadAchievements();
    }

    async loadAchievements() {
        try {
            // Mock achievements data
            const achievements = [
                {
                    id: '1',
                    name: 'first_code',
                    icon: '🎯',
                    title: 'First Steps',
                    description: 'Wrote your first code!',
                    points: 10,
                    unlocked: true,
                    unlockedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'streak_7',
                    icon: '🔥',
                    title: 'Week Warrior',
                    description: '7-day coding streak!',
                    points: 50,
                    unlocked: true,
                    unlockedAt: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'problems_10',
                    icon: '💯',
                    title: 'Problem Solver',
                    description: 'Solved 10 problems',
                    points: 100,
                    unlocked: false,
                    progress: 7,
                    total: 10
                },
                {
                    id: '4',
                    name: 'streak_30',
                    icon: '🏆',
                    title: 'Month Master',
                    description: '30-day coding streak!',
                    points: 200,
                    unlocked: false,
                    progress: 7,
                    total: 30
                },
                {
                    id: '5',
                    name: 'languages_3',
                    icon: '🌟',
                    title: 'Polyglot',
                    description: 'Coded in 3 different languages',
                    points: 75,
                    unlocked: false,
                    progress: 2,
                    total: 3
                },
                {
                    id: '6',
                    name: 'perfect_week',
                    icon: '✨',
                    title: 'Perfect Week',
                    description: 'Coded every day for a week',
                    points: 150,
                    unlocked: false,
                    progress: 5,
                    total: 7
                }
            ];

            this.setState({ 
                achievements,
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load achievements:', error);
            this.setState({ loading: false });
        }
    }

    render() {
        const { achievements, loading } = this.state;
        const t = window.translations?.[appState.getState('language')]?.achievements || {};

        const unlockedAchievements = achievements.filter(a => a.unlocked);
        const lockedAchievements = achievements.filter(a => !a.unlocked);
        const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

        return `
            <div class="achievements-page">
                <div class="achievements-header">
                    <h1>${t.title || 'Achievements'}</h1>
                    <div class="achievements-stats">
                        <div class="stat-badge">
                            <span class="badge-icon">🏆</span>
                            <div>
                                <div class="badge-number">${unlockedAchievements.length}/${achievements.length}</div>
                                <div class="badge-label">${t.unlocked || 'Unlocked'}</div>
                            </div>
                        </div>
                        <div class="stat-badge">
                            <span class="badge-icon">⭐</span>
                            <div>
                                <div class="badge-number">${totalPoints}</div>
                                <div class="badge-label">${t.points || 'Points'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${loading ? `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>${t.loading || 'Loading achievements...'}</p>
                    </div>
                ` : `
                    <div class="achievements-content">
                        ${unlockedAchievements.length > 0 ? `
                            <section class="achievements-section">
                                <h2>${t.unlocked || 'Unlocked'}</h2>
                                <div class="achievements-grid">
                                    ${unlockedAchievements.map(a => this.renderAchievement(a, true)).join('')}
                                </div>
                            </section>
                        ` : ''}

                        ${lockedAchievements.length > 0 ? `
                            <section class="achievements-section">
                                <h2>${t.locked || 'Locked'}</h2>
                                <div class="achievements-grid">
                                    ${lockedAchievements.map(a => this.renderAchievement(a, false)).join('')}
                                </div>
                            </section>
                        ` : ''}
                    </div>
                `}
            </div>
        `;
    }

    renderAchievement(achievement, unlocked) {
        const t = window.translations?.[appState.getState('language')]?.achievements || {};

        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon ${unlocked ? 'shine' : ''}">${achievement.icon}</div>
                <h3 class="achievement-title">${achievement.title}</h3>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-points">
                    <span class="points-icon">⭐</span>
                    <span>${achievement.points} ${t.points || 'points'}</span>
                </div>
                ${!unlocked && achievement.progress !== undefined ? `
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div 
                                class="progress-fill" 
                                style="width: ${(achievement.progress / achievement.total) * 100}%"
                            ></div>
                        </div>
                        <div class="progress-text">${achievement.progress}/${achievement.total}</div>
                    </div>
                ` : unlocked ? `
                    <div class="achievement-unlocked">
                        <span>✅ ${t.unlocked || 'Unlocked'}</span>
                        <span class="unlock-date">${utils.timeAgo(achievement.unlockedAt)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// ============================================================================
// PROGRESS PAGE
// ============================================================================

class ProgressPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: null,
            progress: [],
            loading: true
        };
    }

    async afterMount() {
        await this.loadProgress();
    }

    async loadProgress() {
        try {
            const stats = await api.getStats();
            const detailedProgress = await api.getDetailedProgress();

            this.setState({ 
                stats,
                progress: detailedProgress.concepts || [],
                loading: false 
            });
        } catch (error) {
            console.error('Failed to load progress:', error);
            this.setState({ loading: false });
        }
    }

    render() {
        const { stats, progress, loading } = this.state;
        const t = window.translations?.[appState.getState('language')]?.progress || {};

        return `
            <div class="progress-page">
                <div class="progress-header">
                    <h1>${t.title || 'Your Progress'}</h1>
                </div>

                ${loading ? `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>${t.loading || 'Loading progress...'}</p>
                    </div>
                ` : `
                    <div class="progress-content">
                        <!-- Overall Stats -->
                        <section class="progress-section">
                            <h2>${t.overallProgress || 'Overall Progress'}</h2>
                            <div class="progress-stats-grid">
                                <div class="progress-stat-card">
                                    <div class="stat-icon">📊</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${stats?.solved_concepts || 0}</div>
                                        <div class="stat-label">${t.problemsSolved || 'Problems Solved'}</div>
                                    </div>
                                </div>
                                <div class="progress-stat-card">
                                    <div class="stat-icon">⏱️</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${Math.floor((stats?.total_time || 0) / 3600)}h</div>
                                        <div class="stat-label">${t.timeSpent || 'Time Spent'}</div>
                                    </div>
                                </div>
                                <div class="progress-stat-card">
                                    <div class="stat-icon">🎯</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${Math.round((stats?.avg_mastery || 0) * 100)}%</div>
                                        <div class="stat-label">${t.avgMastery || 'Avg Mastery'}</div>
                                    </div>
                                </div>
                                <div class="progress-stat-card">
                                    <div class="stat-icon">🔥</div>
                                    <div class="stat-content">
                                        <div class="stat-value">${stats?.current_streak || 0}</div>
                                        <div class="stat-label">${t.currentStreak || 'Current Streak'}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Concept Breakdown -->
                        <section class="progress-section">
                            <h2>${t.conceptBreakdown || 'Concept Breakdown'}</h2>
                            ${progress.length === 0 ? `
                                <div class="empty-state">
                                    <div class="empty-icon">📚</div>
                                    <p>${t.noProgress || 'Start solving problems to track your progress'}</p>
                                    <a href="/ide" class="btn btn-primary" data-link>
                                        ${t.startCoding || 'Start Coding'}
                                    </a>
                                </div>
                            ` : `
                                <div class="concept-progress-list">
                                    ${progress.map(concept => this.renderConceptProgress(concept, t)).join('')}
                                </div>
                            `}
                        </section>

                        <!-- Learning Path -->
                        <section class="progress-section">
                            <h2>${t.learningPath || 'Learning Path'}</h2>
                            <div class="learning-path">
                                ${this.renderLearningPath(progress, t)}
                            </div>
                        </section>
                    </div>
                `}
            </div>
        `;
    }

    renderConceptProgress(concept, t) {
        const masteryPercent = Math.round(concept.mastery_score * 100);
        const masteryClass = masteryPercent >= 80 ? 'excellent' : 
                           masteryPercent >= 60 ? 'good' : 
                           masteryPercent >= 40 ? 'fair' : 'needs-work';

        return `
            <div class="concept-progress-item">
                <div class="concept-info">
                    <h3>${concept.concept}</h3>
                    <div class="concept-meta">
                        <span>${concept.attempts} ${t.attempts || 'attempts'}</span>
                        ${concept.solved ? `<span class="solved-badge">✅ ${t.solved || 'Solved'}</span>` : ''}
                    </div>
                </div>
                <div class="concept-mastery">
                    <div class="mastery-bar">
                        <div 
                            class="mastery-fill ${masteryClass}" 
                            style="width: ${masteryPercent}%"
                        ></div>
                    </div>
                    <div class="mastery-percent">${masteryPercent}%</div>
                </div>
            </div>
        `;
    }

    renderLearningPath(progress, t) {
        const concepts = ['Variables', 'Loops', 'Functions', 'Arrays', 'Objects', 'Classes'];
        const userProgress = new Map(progress.map(p => [p.concept.toLowerCase(), p]));

        return concepts.map((concept, index) => {
            const conceptLower = concept.toLowerCase();
            const userConcept = userProgress.get(conceptLower);
            const status = userConcept?.solved ? 'completed' : 
                          userConcept ? 'in-progress' : 'locked';

            return `
                <div class="path-step ${status}">
                    <div class="step-connector ${index > 0 ? 'visible' : ''}"></div>
                    <div class="step-circle">
                        ${status === 'completed' ? '✅' : 
                          status === 'in-progress' ? '🔄' : '🔒'}
                    </div>
                    <div class="step-content">
                        <h4>${concept}</h4>
                        ${userConcept ? `
                            <p>${Math.round(userConcept.mastery_score * 100)}% ${t.mastery || 'mastery'}</p>
                        ` : `
                            <p>${t.notStarted || 'Not started'}</p>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AchievementsPage,
        ProgressPage
    };
}
