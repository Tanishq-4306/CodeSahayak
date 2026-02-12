/**
 * Authentication Components for CodeSahayak
 * Login, Signup, Password Reset, and Profile Management
 */

// ============================================================================
// LOGIN COMPONENT
// ============================================================================

class LoginForm extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            email: '',
            password: '',
            rememberMe: false,
            loading: false,
            error: null,
            showPassword: false
        };
    }

    render() {
        const { email, password, rememberMe, loading, error, showPassword } = this.state;
        const translations = window.translations || {};
        const t = translations[appState.getState('language')] || translations.en || {};

        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">🤖</div>
                        <h1 class="auth-title">${t.login || 'Login'}</h1>
                        <p class="auth-subtitle">${t.welcomeBack || 'Welcome back to CodeSahayak'}</p>
                    </div>

                    ${error ? `
                        <div class="alert alert-error">
                            <span class="alert-icon">❌</span>
                            <span class="alert-message">${error}</span>
                        </div>
                    ` : ''}

                    <form class="auth-form" id="loginForm">
                        <div class="form-group">
                            <label for="email" class="form-label">
                                ${t.email || 'Email'}
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                class="form-input"
                                value="${email}"
                                placeholder="${t.emailPlaceholder || 'your@email.com'}"
                                required
                                ${loading ? 'disabled' : ''}
                            />
                        </div>

                        <div class="form-group">
                            <label for="password" class="form-label">
                                ${t.password || 'Password'}
                            </label>
                            <div class="input-with-icon">
                                <input 
                                    type="${showPassword ? 'text' : 'password'}" 
                                    id="password" 
                                    class="form-input"
                                    value="${password}"
                                    placeholder="${t.passwordPlaceholder || '••••••••'}"
                                    required
                                    ${loading ? 'disabled' : ''}
                                />
                                <button 
                                    type="button" 
                                    class="input-icon-btn"
                                    id="togglePassword"
                                    ${loading ? 'disabled' : ''}
                                >
                                    ${showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <div class="form-row">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    id="rememberMe"
                                    ${rememberMe ? 'checked' : ''}
                                    ${loading ? 'disabled' : ''}
                                />
                                <span>${t.rememberMe || 'Remember me'}</span>
                            </label>
                            <a href="/forgot-password" class="link" data-link>
                                ${t.forgotPassword || 'Forgot password?'}
                            </a>
                        </div>

                        <button 
                            type="submit" 
                            class="btn btn-primary btn-block"
                            ${loading ? 'disabled' : ''}
                        >
                            ${loading ? `
                                <span class="spinner"></span>
                                ${t.loggingIn || 'Logging in...'}
                            ` : t.login || 'Login'}
                        </button>
                    </form>

                    <div class="auth-footer">
                        <p>${t.noAccount || "Don't have an account?"} 
                            <a href="/signup" class="link" data-link>
                                ${t.signUp || 'Sign up'}
                            </a>
                        </p>
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
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const togglePasswordBtn = document.getElementById('togglePassword');

        if (form) {
            form.onsubmit = (e) => this.handleSubmit(e);
        }

        if (emailInput) {
            emailInput.oninput = (e) => this.setState({ email: e.target.value, error: null });
        }

        if (passwordInput) {
            passwordInput.oninput = (e) => this.setState({ password: e.target.value, error: null });
        }

        if (rememberMeCheckbox) {
            rememberMeCheckbox.onchange = (e) => this.setState({ rememberMe: e.target.checked });
        }

        if (togglePasswordBtn) {
            togglePasswordBtn.onclick = () => this.setState({ showPassword: !this.state.showPassword });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const { email, password, rememberMe } = this.state;

        // Validation
        if (!email || !password) {
            this.setState({ error: 'Please fill in all fields' });
            return;
        }

        this.setState({ loading: true, error: null });

        try {
            const response = await api.login({ email, password });
            
            // Update global state
            appState.setUser(response.user);
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('codesahayak_remember', 'true');
            }

            // Emit login event
            eventBus.emit('user:login', response.user);

            // Navigate to dashboard
            router.navigate('/dashboard');
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || 'Login failed. Please try again.' 
            });
        }
    }
}

// ============================================================================
// SIGNUP COMPONENT
// ============================================================================

class SignupForm extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            language: appState.getState('language') || 'en',
            college: '',
            yearOfStudy: '',
            acceptTerms: false,
            loading: false,
            error: null,
            showPassword: false,
            passwordStrength: 0
        };
    }

    render() {
        const { name, email, password, confirmPassword, language, college, yearOfStudy, 
                acceptTerms, loading, error, showPassword, passwordStrength } = this.state;
        const translations = window.translations || {};
        const t = translations[appState.getState('language')] || translations.en || {};

        const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#ef4444', '#f59e0b', '#10b981', '#059669'];

        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <div class="auth-logo">🤖</div>
                        <h1 class="auth-title">${t.signUp || 'Sign Up'}</h1>
                        <p class="auth-subtitle">${t.joinCodeSahayak || 'Join CodeSahayak and start learning'}</p>
                    </div>

                    ${error ? `
                        <div class="alert alert-error">
                            <span class="alert-icon">❌</span>
                            <span class="alert-message">${error}</span>
                        </div>
                    ` : ''}

                    <form class="auth-form" id="signupForm">
                        <div class="form-group">
                            <label for="name" class="form-label">
                                ${t.fullName || 'Full Name'} *
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                class="form-input"
                                value="${name}"
                                placeholder="${t.namePlaceholder || 'Your full name'}"
                                required
                                ${loading ? 'disabled' : ''}
                            />
                        </div>

                        <div class="form-group">
                            <label for="email" class="form-label">
                                ${t.email || 'Email'} *
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                class="form-input"
                                value="${email}"
                                placeholder="${t.emailPlaceholder || 'your@email.com'}"
                                required
                                ${loading ? 'disabled' : ''}
                            />
                        </div>

                        <div class="form-group">
                            <label for="password" class="form-label">
                                ${t.password || 'Password'} *
                            </label>
                            <div class="input-with-icon">
                                <input 
                                    type="${showPassword ? 'text' : 'password'}" 
                                    id="password" 
                                    class="form-input"
                                    value="${password}"
                                    placeholder="${t.passwordPlaceholder || 'At least 6 characters'}"
                                    required
                                    ${loading ? 'disabled' : ''}
                                />
                                <button 
                                    type="button" 
                                    class="input-icon-btn"
                                    id="togglePassword"
                                    ${loading ? 'disabled' : ''}
                                >
                                    ${showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            ${password ? `
                                <div class="password-strength">
                                    <div class="password-strength-bar">
                                        <div 
                                            class="password-strength-fill" 
                                            style="width: ${(passwordStrength + 1) * 25}%; background: ${strengthColors[passwordStrength]}"
                                        ></div>
                                    </div>
                                    <span class="password-strength-label" style="color: ${strengthColors[passwordStrength]}">
                                        ${strengthLabels[passwordStrength]}
                                    </span>
                                </div>
                            ` : ''}
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword" class="form-label">
                                ${t.confirmPassword || 'Confirm Password'} *
                            </label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                class="form-input"
                                value="${confirmPassword}"
                                placeholder="${t.confirmPasswordPlaceholder || 'Re-enter password'}"
                                required
                                ${loading ? 'disabled' : ''}
                            />
                        </div>

                        <div class="form-group">
                            <label for="language" class="form-label">
                                ${t.preferredLanguage || 'Preferred Language'} *
                            </label>
                            <select 
                                id="language" 
                                class="form-select"
                                ${loading ? 'disabled' : ''}
                            >
                                <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
                                <option value="hi" ${language === 'hi' ? 'selected' : ''}>हिंदी (Hindi)</option>
                                <option value="ta" ${language === 'ta' ? 'selected' : ''}>தமிழ் (Tamil)</option>
                                <option value="bn" ${language === 'bn' ? 'selected' : ''}>বাংলা (Bengali)</option>
                                <option value="mr" ${language === 'mr' ? 'selected' : ''}>मराठी (Marathi)</option>
                                <option value="te" ${language === 'te' ? 'selected' : ''}>తెలుగు (Telugu)</option>
                                <option value="gu" ${language === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
                                <option value="kn" ${language === 'kn' ? 'selected' : ''}>ಕನ್ನಡ (Kannada)</option>
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="college" class="form-label">
                                    ${t.college || 'College/Institution'}
                                </label>
                                <input 
                                    type="text" 
                                    id="college" 
                                    class="form-input"
                                    value="${college}"
                                    placeholder="${t.collegePlaceholder || 'Optional'}"
                                    ${loading ? 'disabled' : ''}
                                />
                            </div>

                            <div class="form-group">
                                <label for="yearOfStudy" class="form-label">
                                    ${t.year || 'Year'}
                                </label>
                                <select 
                                    id="yearOfStudy" 
                                    class="form-select"
                                    ${loading ? 'disabled' : ''}
                                >
                                    <option value="">-</option>
                                    <option value="1" ${yearOfStudy === '1' ? 'selected' : ''}>1st Year</option>
                                    <option value="2" ${yearOfStudy === '2' ? 'selected' : ''}>2nd Year</option>
                                    <option value="3" ${yearOfStudy === '3' ? 'selected' : ''}>3rd Year</option>
                                    <option value="4" ${yearOfStudy === '4' ? 'selected' : ''}>4th Year</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    id="acceptTerms"
                                    ${acceptTerms ? 'checked' : ''}
                                    ${loading ? 'disabled' : ''}
                                    required
                                />
                                <span>
                                    ${t.iAccept || 'I accept the'} 
                                    <a href="/terms" class="link" data-link>${t.terms || 'Terms of Service'}</a>
                                    ${t.and || 'and'}
                                    <a href="/privacy" class="link" data-link>${t.privacy || 'Privacy Policy'}</a>
                                </span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            class="btn btn-primary btn-block"
                            ${loading ? 'disabled' : ''}
                        >
                            ${loading ? `
                                <span class="spinner"></span>
                                ${t.creatingAccount || 'Creating account...'}
                            ` : t.signUp || 'Sign Up'}
                        </button>
                    </form>

                    <div class="auth-footer">
                        <p>${t.haveAccount || 'Already have an account?'} 
                            <a href="/login" class="link" data-link>
                                ${t.login || 'Login'}
                            </a>
                        </p>
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
        const form = document.getElementById('signupForm');
        const inputs = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            language: document.getElementById('language'),
            college: document.getElementById('college'),
            yearOfStudy: document.getElementById('yearOfStudy'),
            acceptTerms: document.getElementById('acceptTerms'),
            togglePassword: document.getElementById('togglePassword')
        };

        if (form) {
            form.onsubmit = (e) => this.handleSubmit(e);
        }

        if (inputs.name) {
            inputs.name.oninput = (e) => this.setState({ name: e.target.value, error: null });
        }

        if (inputs.email) {
            inputs.email.oninput = (e) => this.setState({ email: e.target.value, error: null });
        }

        if (inputs.password) {
            inputs.password.oninput = (e) => {
                const password = e.target.value;
                this.setState({ 
                    password, 
                    error: null,
                    passwordStrength: this.calculatePasswordStrength(password)
                });
            };
        }

        if (inputs.confirmPassword) {
            inputs.confirmPassword.oninput = (e) => this.setState({ confirmPassword: e.target.value, error: null });
        }

        if (inputs.language) {
            inputs.language.onchange = (e) => this.setState({ language: e.target.value });
        }

        if (inputs.college) {
            inputs.college.oninput = (e) => this.setState({ college: e.target.value });
        }

        if (inputs.yearOfStudy) {
            inputs.yearOfStudy.onchange = (e) => this.setState({ yearOfStudy: e.target.value });
        }

        if (inputs.acceptTerms) {
            inputs.acceptTerms.onchange = (e) => this.setState({ acceptTerms: e.target.checked });
        }

        if (inputs.togglePassword) {
            inputs.togglePassword.onclick = () => this.setState({ showPassword: !this.state.showPassword });
        }
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password) && /[^a-zA-Z\d]/.test(password)) strength++;
        return Math.min(strength, 3);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const { name, email, password, confirmPassword, language, college, yearOfStudy, acceptTerms } = this.state;

        // Validation
        if (!name || name.trim().length < 2) {
            this.setState({ error: 'Name must be at least 2 characters' });
            return;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            this.setState({ error: 'Please enter a valid email' });
            return;
        }

        if (!password || password.length < 6) {
            this.setState({ error: 'Password must be at least 6 characters' });
            return;
        }

        if (password !== confirmPassword) {
            this.setState({ error: 'Passwords do not match' });
            return;
        }

        if (!acceptTerms) {
            this.setState({ error: 'Please accept the terms and conditions' });
            return;
        }

        this.setState({ loading: true, error: null });

        try {
            const response = await api.signup({
                name: name.trim(),
                email: email.trim(),
                password,
                language,
                college: college.trim() || null,
                yearOfStudy: yearOfStudy || null
            });
            
            // Update global state
            appState.setUser(response.user);
            
            // Emit signup event
            eventBus.emit('user:signup', response.user);

            // Navigate to onboarding or dashboard
            router.navigate('/dashboard');
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: error.error || 'Signup failed. Please try again.' 
            });
        }
    }
}

// Export components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoginForm, SignupForm };
}
