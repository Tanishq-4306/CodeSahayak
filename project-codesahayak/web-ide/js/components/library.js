/**
 * Library and Settings Components for CodeSahayak
 */

// ============================================================================
// LIBRARY PAGE
// ============================================================================

class LibraryPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            snippets: [],
            loading: true,
            searchQuery: '',
            filterLanguage: 'all',
            sortBy: 'recent'
        };
    }

    async afterMount() {
        await this.loadSnippets();
    }

    async loadSnippets() {
        try {
            const snippets = await api.getMyCode();
            this.setState({ snippets, loading: false });
        } catch (error) {
            console.error('Failed to load snippets:', error);
            this.setState({ loading: false });
        }
    }

    render() {
        const { snippets, loading, searchQuery, filterLanguage, sortBy } = this.state;
        const t = window.translations?.[appState.getState('language')]?.library || {};

        const filteredSnippets = this.filterAndSortSnippets(snippets, searchQuery, filterLanguage, sortBy);

        return `
            <div class="library-page">
                <div class="library-header">
                    <h1>${t.title || 'My Code Library'}</h1>
                    <a href="/ide" class="btn btn-primary" data-link>
                        <span>➕</span>
                        ${t.newCode || 'New Code'}
                    </a>
                </div>

                <div class="library-filters">
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="searchInput"
                            class="form-input"
                            placeholder="${t.search || 'Search code...'}"
                            value="${searchQuery}"
                        />
                    </div>

                    <select id="languageFilter" class="form-select">
                        <option value="all">${t.allLanguages || 'All Languages'}</option>
                        <option value="python" ${filterLanguage === 'python' ? 'selected' : ''}>Python</option>
                        <option value="javascript" ${filterLanguage === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        <option value="java" ${filterLanguage === 'java' ? 'selected' : ''}>Java</option>
                        <option value="cpp" ${filterLanguage === 'cpp' ? 'selected' : ''}>C++</option>
                        <option value="c" ${filterLanguage === 'c' ? 'selected' : ''}>C</option>
                    </select>

                    <select id="sortSelect" class="form-select">
                        <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>${t.mostRecent || 'Most Recent'}</option>
                        <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>${t.oldest || 'Oldest'}</option>
                        <option value="name" ${sortBy === 'name' ? 'selected' : ''}>${t.name || 'Name'}</option>
                    </select>
                </div>

                <div class="library-content">
                    ${loading ? `
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <p>${t.loading || 'Loading your code...'}</p>
                        </div>
                    ` : filteredSnippets.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">📝</div>
                            <h3>${t.noCode || 'No code snippets yet'}</h3>
                            <p>${t.startCoding || 'Start coding to build your library'}</p>
                            <a href="/ide" class="btn btn-primary" data-link>
                                ${t.writeCode || 'Write Your First Code'}
                            </a>
                        </div>
                    ` : `
                        <div class="snippets-grid">
                            ${filteredSnippets.map(snippet => this.renderSnippet(snippet)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderSnippet(snippet) {
        const t = window.translations?.[appState.getState('language')]?.library || {};
        const languageIcons = {
            python: '🐍',
            javascript: '📜',
            java: '☕',
            cpp: '⚡',
            c: '🔧'
        };

        return `
            <div class="snippet-card" data-id="${snippet.id}">
                <div class="snippet-header">
                    <div class="snippet-language">
                        <span class="language-icon">${languageIcons[snippet.language] || '📝'}</span>
                        <span class="language-name">${snippet.language}</span>
                    </div>
                    <div class="snippet-actions">
                        <button class="btn-icon" onclick="app.openSnippet('${snippet.id}')" title="${t.open || 'Open'}">
                            📂
                        </button>
                        <button class="btn-icon" onclick="app.deleteSnippet('${snippet.id}')" title="${t.delete || 'Delete'}">
                            🗑️
                        </button>
                    </div>
                </div>
                <h3 class="snippet-title">${snippet.title || t.untitled || 'Untitled'}</h3>
                <div class="snippet-meta">
                    <span class="snippet-date">${utils.timeAgo(snippet.created_at)}</span>
                    ${snippet.tags ? `
                        <div class="snippet-tags">
                            ${snippet.tags.split(',').slice(0, 3).map(tag => 
                                `<span class="tag">${tag.trim()}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    filterAndSortSnippets(snippets, query, language, sort) {
        let filtered = [...snippets];

        // Filter by search query
        if (query) {
            filtered = filtered.filter(s => 
                s.title?.toLowerCase().includes(query.toLowerCase()) ||
                s.code?.toLowerCase().includes(query.toLowerCase()) ||
                s.tags?.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Filter by language
        if (language !== 'all') {
            filtered = filtered.filter(s => s.language === language);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sort === 'recent') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sort === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sort === 'name') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return 0;
        });

        return filtered;
    }

    afterUpdate() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const languageFilter = document.getElementById('languageFilter');
        const sortSelect = document.getElementById('sortSelect');

        if (searchInput) {
            searchInput.oninput = utils.debounce((e) => {
                this.setState({ searchQuery: e.target.value });
            }, 300);
        }

        if (languageFilter) {
            languageFilter.onchange = (e) => {
                this.setState({ filterLanguage: e.target.value });
            };
        }

        if (sortSelect) {
            sortSelect.onchange = (e) => {
                this.setState({ sortBy: e.target.value });
            };
        }
    }
}

// ============================================================================
// SETTINGS PAGE
// ============================================================================

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: appState.getState('user') || {},
            activeTab: 'profile',
            loading: false,
            success: null,
            error: null
        };
    }

    render() {
        const { user, activeTab, loading, success, error } = this.state;
        const t = window.translations?.[appState.getState('language')]?.settings || {};

        return `
            <div class="settings-page">
                <div class="settings-header">
                    <h1>${t.title || 'Settings'}</h1>
                </div>

                ${success ? `
                    <div class="alert alert-success">
                        <span>✅ ${success}</span>
                    </div>
                ` : ''}

                ${error ? `
                    <div class="alert alert-error">
                        <span>❌ ${error}</span>
                    </div>
                ` : ''}

                <div class="settings-container">
                    <div class="settings-sidebar">
                        <button 
                            class="settings-tab ${activeTab === 'profile' ? 'active' : ''}"
                            onclick="app.switchSettingsTab('profile')"
                        >
                            <span>👤</span>
                            ${t.profile || 'Profile'}
                        </button>
                        <button 
                            class="settings-tab ${activeTab === 'language' ? 'active' : ''}"
                            onclick="app.switchSettingsTab('language')"
                        >
                            <span>🌍</span>
                            ${t.language || 'Language'}
                        </button>
                        <button 
                            class="settings-tab ${activeTab === 'security' ? 'active' : ''}"
                            onclick="app.switchSettingsTab('security')"
                        >
                            <span>🔒</span>
                            ${t.security || 'Security'}
                        </button>
                        <button 
                            class="settings-tab ${activeTab === 'preferences' ? 'active' : ''}"
                            onclick="app.switchSettingsTab('preferences')"
                        >
                            <span>⚙️</span>
                            ${t.preferences || 'Preferences'}
                        </button>
                        <button 
                            class="settings-tab ${activeTab === 'data' ? 'active' : ''}"
                            onclick="app.switchSettingsTab('data')"
                        >
                            <span>📊</span>
                            ${t.data || 'Data & Privacy'}
                        </button>
                    </div>

                    <div class="settings-content">
                        ${this.renderTabContent(activeTab, user, loading, t)}
                    </div>
                </div>
            </div>
        `;
    }

    renderTabContent(tab, user, loading, t) {
        switch (tab) {
            case 'profile':
                return this.renderProfileTab(user, loading, t);
            case 'language':
                return this.renderLanguageTab(user, loading, t);
            case 'security':
                return this.renderSecurityTab(loading, t);
            case 'preferences':
                return this.renderPreferencesTab(user, loading, t);
            case 'data':
                return this.renderDataTab(loading, t);
            default:
                return '';
        }
    }

    renderProfileTab(user, loading, t) {
        return `
            <div class="settings-section">
                <h2>${t.profileSettings || 'Profile Settings'}</h2>
                <form id="profileForm" class="settings-form">
                    <div class="form-group">
                        <label>${t.name || 'Name'}</label>
                        <input 
                            type="text" 
                            id="profileName"
                            class="form-input"
                            value="${user.name || ''}"
                            ${loading ? 'disabled' : ''}
                        />
                    </div>

                    <div class="form-group">
                        <label>${t.email || 'Email'}</label>
                        <input 
                            type="email" 
                            class="form-input"
                            value="${user.email || ''}"
                            disabled
                        />
                        <small>${t.emailNote || 'Email cannot be changed'}</small>
                    </div>

                    <div class="form-group">
                        <label>${t.college || 'College/Institution'}</label>
                        <input 
                            type="text" 
                            id="profileCollege"
                            class="form-input"
                            value="${user.college || ''}"
                            ${loading ? 'disabled' : ''}
                        />
                    </div>

                    <div class="form-group">
                        <label>${t.year || 'Year of Study'}</label>
                        <select 
                            id="profileYear"
                            class="form-select"
                            ${loading ? 'disabled' : ''}
                        >
                            <option value="">-</option>
                            <option value="1" ${user.yearOfStudy === 1 ? 'selected' : ''}>1st Year</option>
                            <option value="2" ${user.yearOfStudy === 2 ? 'selected' : ''}>2nd Year</option>
                            <option value="3" ${user.yearOfStudy === 3 ? 'selected' : ''}>3rd Year</option>
                            <option value="4" ${user.yearOfStudy === 4 ? 'selected' : ''}>4th Year</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        ${loading ? 'disabled' : ''}
                    >
                        ${loading ? `<span class="spinner"></span> ${t.saving || 'Saving...'}` : t.saveChanges || 'Save Changes'}
                    </button>
                </form>
            </div>
        `;
    }

    renderLanguageTab(user, loading, t) {
        return `
            <div class="settings-section">
                <h2>${t.languageSettings || 'Language Settings'}</h2>
                <form id="languageForm" class="settings-form">
                    <div class="form-group">
                        <label>${t.interfaceLanguage || 'Interface Language'}</label>
                        <select 
                            id="interfaceLanguage"
                            class="form-select"
                            ${loading ? 'disabled' : ''}
                        >
                            <option value="en" ${user.language === 'en' ? 'selected' : ''}>English</option>
                            <option value="hi" ${user.language === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
                            <option value="ta" ${user.language === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                            <option value="bn" ${user.language === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
                            <option value="mr" ${user.language === 'mr' ? 'selected' : ''}>मराठी (Marathi)</option>
                            <option value="te" ${user.language === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
                            <option value="gu" ${user.language === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
                            <option value="kn" ${user.language === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
                        </select>
                        <small>${t.languageNote || 'This will change the language of the entire interface'}</small>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        ${loading ? 'disabled' : ''}
                    >
                        ${loading ? `<span class="spinner"></span> ${t.saving || 'Saving...'}` : t.saveChanges || 'Save Changes'}
                    </button>
                </form>
            </div>
        `;
    }

    renderSecurityTab(loading, t) {
        return `
            <div class="settings-section">
                <h2>${t.securitySettings || 'Security Settings'}</h2>
                <form id="passwordForm" class="settings-form">
                    <div class="form-group">
                        <label>${t.currentPassword || 'Current Password'}</label>
                        <input 
                            type="password" 
                            id="currentPassword"
                            class="form-input"
                            ${loading ? 'disabled' : ''}
                        />
                    </div>

                    <div class="form-group">
                        <label>${t.newPassword || 'New Password'}</label>
                        <input 
                            type="password" 
                            id="newPassword"
                            class="form-input"
                            ${loading ? 'disabled' : ''}
                        />
                        <small>${t.passwordRequirement || 'At least 6 characters'}</small>
                    </div>

                    <div class="form-group">
                        <label>${t.confirmPassword || 'Confirm New Password'}</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            class="form-input"
                            ${loading ? 'disabled' : ''}
                        />
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        ${loading ? 'disabled' : ''}
                    >
                        ${loading ? `<span class="spinner"></span> ${t.changing || 'Changing...'}` : t.changePassword || 'Change Password'}
                    </button>
                </form>
            </div>
        `;
    }

    renderPreferencesTab(user, loading, t) {
        const preferences = user.preferences || {};
        
        return `
            <div class="settings-section">
                <h2>${t.preferences || 'Preferences'}</h2>
                <form id="preferencesForm" class="settings-form">
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="emailNotifications"
                                ${preferences.emailNotifications !== false ? 'checked' : ''}
                                ${loading ? 'disabled' : ''}
                            />
                            <span>${t.emailNotifications || 'Email notifications'}</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="soundEffects"
                                ${preferences.soundEffects !== false ? 'checked' : ''}
                                ${loading ? 'disabled' : ''}
                            />
                            <span>${t.soundEffects || 'Sound effects'}</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="autoSave"
                                ${preferences.autoSave !== false ? 'checked' : ''}
                                ${loading ? 'disabled' : ''}
                            />
                            <span>${t.autoSave || 'Auto-save code'}</span>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        ${loading ? 'disabled' : ''}
                    >
                        ${loading ? `<span class="spinner"></span> ${t.saving || 'Saving...'}` : t.saveChanges || 'Save Changes'}
                    </button>
                </form>
            </div>
        `;
    }

    renderDataTab(loading, t) {
        return `
            <div class="settings-section">
                <h2>${t.dataPrivacy || 'Data & Privacy'}</h2>
                
                <div class="data-actions">
                    <div class="data-action-card">
                        <h3>${t.exportData || 'Export Your Data'}</h3>
                        <p>${t.exportDataDesc || 'Download all your code, progress, and account data'}</p>
                        <button 
                            class="btn btn-secondary"
                            onclick="app.exportUserData()"
                            ${loading ? 'disabled' : ''}
                        >
                            ${t.export || 'Export Data'}
                        </button>
                    </div>

                    <div class="data-action-card danger">
                        <h3>${t.deleteAccount || 'Delete Account'}</h3>
                        <p>${t.deleteAccountDesc || 'Permanently delete your account and all associated data'}</p>
                        <button 
                            class="btn btn-danger"
                            onclick="app.confirmDeleteAccount()"
                            ${loading ? 'disabled' : ''}
                        >
                            ${t.delete || 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    afterMount() {
        this.attachEventListeners();
    }

    afterUpdate() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const profileForm = document.getElementById('profileForm');
        const languageForm = document.getElementById('languageForm');
        const passwordForm = document.getElementById('passwordForm');
        const preferencesForm = document.getElementById('preferencesForm');

        if (profileForm) {
            profileForm.onsubmit = (e) => this.handleProfileSubmit(e);
        }

        if (languageForm) {
            languageForm.onsubmit = (e) => this.handleLanguageSubmit(e);
        }

        if (passwordForm) {
            passwordForm.onsubmit = (e) => this.handlePasswordSubmit(e);
        }

        if (preferencesForm) {
            preferencesForm.onsubmit = (e) => this.handlePreferencesSubmit(e);
        }
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true, error: null, success: null });

        try {
            const name = document.getElementById('profileName').value;
            const college = document.getElementById('profileCollege').value;
            const yearOfStudy = document.getElementById('profileYear').value;

            await api.updateProfile({ name, college, yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : null });
            
            const user = await api.getProfile();
            appState.setUser(user);

            this.setState({ 
                loading: false, 
                success: 'Profile updated successfully',
                user 
            });
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || 'Failed to update profile' 
            });
        }
    }

    async handleLanguageSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true, error: null, success: null });

        try {
            const language = document.getElementById('interfaceLanguage').value;
            await api.updateProfile({ language });
            
            appState.setState({ language });
            await app.switchLanguage(language);

            this.setState({ 
                loading: false, 
                success: 'Language updated successfully'
            });
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || 'Failed to update language' 
            });
        }
    }

    async handlePasswordSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true, error: null, success: null });

        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            await api.changePassword({ currentPassword, newPassword });

            this.setState({ 
                loading: false, 
                success: 'Password changed successfully'
            });

            // Clear form
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || error.message || 'Failed to change password' 
            });
        }
    }

    async handlePreferencesSubmit(e) {
        e.preventDefault();
        this.setState({ loading: true, error: null, success: null });

        try {
            const preferences = {
                emailNotifications: document.getElementById('emailNotifications').checked,
                soundEffects: document.getElementById('soundEffects').checked,
                autoSave: document.getElementById('autoSave').checked
            };

            await api.updateProfile({ preferences });

            this.setState({ 
                loading: false, 
                success: 'Preferences updated successfully'
            });
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || 'Failed to update preferences' 
            });
        }
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LibraryPage,
        SettingsPage
    };
}
