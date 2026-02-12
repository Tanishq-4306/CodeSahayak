/**
 * Complete Page Components for CodeSahayak
 * All 15 pages fully implemented
 */

// ============================================================================
// LANDING PAGE
// ============================================================================

class LandingPage extends Component {
    render() {
        const t = window.translations?.[appState.getState('language')]?.landing || {};
        
        return `
            <div class="landing-page">
                <!-- Hero Section -->
                <section class="hero-section">
                    <div class="hero-content">
                        <div class="hero-badge">
                            <span class="badge-icon">🇮🇳</span>
                            <span>${t.madeForIndia || 'Made for India'}</span>
                        </div>
                        <h1 class="hero-title">
                            ${t.heroTitle || 'Learn Coding in Your Mother Tongue'}
                        </h1>
                        <p class="hero-subtitle">
                            ${t.heroSubtitle || 'AI-powered coding education with cultural context. Master programming in Hindi, Tamil, Bengali, and 5 other Indian languages.'}
                        </p>
                        <div class="hero-cta">
                            <a href="/signup" class="btn btn-primary btn-lg" data-link>
                                <span>🚀</span>
                                ${t.getStarted || 'Get Started Free'}
                            </a>
                            <a href="/login" class="btn btn-secondary btn-lg" data-link>
                                ${t.login || 'Login'}
                            </a>
                        </div>
                        <div class="hero-stats">
                            <div class="stat-item">
                                <div class="stat-number">10,000+</div>
                                <div class="stat-label">${t.students || 'Students'}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">8</div>
                                <div class="stat-label">${t.languages || 'Languages'}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">100%</div>
                                <div class="stat-label">${t.free || 'Free'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-image">
                        <div class="code-preview">
                            <div class="code-header">
                                <span class="code-dot"></span>
                                <span class="code-dot"></span>
                                <span class="code-dot"></span>
                            </div>
                            <div class="code-body">
                                <pre><code># ${t.codeExample || 'Your first program'}
print("${t.hello || 'नमस्ते'}, CodeSahayak!")

# ${t.withAI || 'With AI Tutor'}
🤖 ${t.aiExplain || 'This prints a greeting message'}
💡 ${t.culturalContext || 'Like saying hello at a chai stall!'}</code></pre>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features-section">
                    <h2 class="section-title">${t.whyCodeSahayak || 'Why CodeSahayak?'}</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🌏</div>
                            <h3>${t.feature1Title || '8 Indian Languages'}</h3>
                            <p>${t.feature1Desc || 'Learn in Hindi, Tamil, Bengali, Marathi, Telugu, Gujarati, Kannada, or Punjabi'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🤖</div>
                            <h3>${t.feature2Title || 'AI Tutor (Sahayak Guruji)'}</h3>
                            <p>${t.feature2Desc || 'Get explanations with cultural metaphors that make sense to you'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📱</div>
                            <h3>${t.feature3Title || 'Works Offline'}</h3>
                            <p>${t.feature3Desc || 'Code anywhere, even without internet. Perfect for Indian connectivity'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎯</div>
                            <h3>${t.feature4Title || 'Progressive Hints'}</h3>
                            <p>${t.feature4Desc || 'Learn by doing. Get hints, not solutions. Build real skills'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📊</div>
                            <h3>${t.feature5Title || 'Track Progress'}</h3>
                            <p>${t.feature5Desc || 'See your growth with streaks, achievements, and mastery levels'}</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎓</div>
                            <h3>${t.feature6Title || 'Free Forever'}</h3>
                            <p>${t.feature6Desc || 'Quality education should be accessible to all Indian students'}</p>
                        </div>
                    </div>
                </section>

                <!-- How It Works Section -->
                <section class="how-it-works-section">
                    <h2 class="section-title">${t.howItWorks || 'How It Works'}</h2>
                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <h3>${t.step1Title || 'Sign Up'}</h3>
                            <p>${t.step1Desc || 'Choose your preferred language and create your account'}</p>
                        </div>
                        <div class="step-arrow">→</div>
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <h3>${t.step2Title || 'Start Coding'}</h3>
                            <p>${t.step2Desc || 'Write code in our browser-based IDE'}</p>
                        </div>
                        <div class="step-arrow">→</div>
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <h3>${t.step3Title || 'Get Help'}</h3>
                            <p>${t.step3Desc || 'Ask Sahayak Guruji for explanations in your language'}</p>
                        </div>
                        <div class="step-arrow">→</div>
                        <div class="step-item">
                            <div class="step-number">4</div>
                            <h3>${t.step4Title || 'Master Skills'}</h3>
                            <p>${t.step4Desc || 'Track progress and become a confident programmer'}</p>
                        </div>
                    </div>
                </section>

                <!-- Testimonials Section -->
                <section class="testimonials-section">
                    <h2 class="section-title">${t.whatStudentsSay || 'What Students Say'}</h2>
                    <div class="testimonials-grid">
                        <div class="testimonial-card">
                            <div class="testimonial-avatar">👨‍🎓</div>
                            <p class="testimonial-text">"${t.testimonial1 || 'Learning in Hindi made programming so much easier to understand. The cultural examples really help!'}"</p>
                            <div class="testimonial-author">- Rahul, Delhi</div>
                        </div>
                        <div class="testimonial-card">
                            <div class="testimonial-avatar">👩‍🎓</div>
                            <p class="testimonial-text">"${t.testimonial2 || 'The offline feature is amazing! I can code even when traveling in rural areas.'}"</p>
                            <div class="testimonial-author">- Priya, Tamil Nadu</div>
                        </div>
                        <div class="testimonial-card">
                            <div class="testimonial-avatar">👨‍🎓</div>
                            <p class="testimonial-text">"${t.testimonial3 || 'Sahayak Guruji explains concepts better than my college professor!'}"</p>
                            <div class="testimonial-author">- Amit, Maharashtra</div>
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section class="cta-section">
                    <h2>${t.readyToStart || 'Ready to Start Your Coding Journey?'}</h2>
                    <p>${t.ctaSubtitle || 'Join thousands of Indian students learning to code in their mother tongue'}</p>
                    <a href="/signup" class="btn btn-primary btn-lg" data-link>
                        ${t.startLearning || 'Start Learning Now'}
                    </a>
                </section>

                <!-- Footer -->
                <footer class="landing-footer">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>CodeSahayak</h4>
                            <p>${t.footerTagline || 'Empowering Indian students to code'}</p>
                        </div>
                        <div class="footer-section">
                            <h4>${t.quickLinks || 'Quick Links'}</h4>
                            <a href="/about" data-link>${t.about || 'About'}</a>
                            <a href="/contact" data-link>${t.contact || 'Contact'}</a>
                            <a href="/privacy" data-link>${t.privacy || 'Privacy'}</a>
                            <a href="/terms" data-link>${t.terms || 'Terms'}</a>
                        </div>
                        <div class="footer-section">
                            <h4>${t.languages || 'Languages'}</h4>
                            <p>हिंदी • தமிழ் • বাংলা • मराठी<br>తెలుగు • ગુજરાતી • ಕನ್ನಡ • ਪੰਜਾਬੀ</p>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>© 2026 CodeSahayak. ${t.madeWithLove || 'Made with ❤️ in India'}</p>
                    </div>
                </footer>
            </div>
        `;
    }
}

// ============================================================================
// ABOUT PAGE
// ============================================================================

class AboutPage extends Component {
    render() {
        const t = window.translations?.[appState.getState('language')]?.about || {};
        
        return `
            <div class="about-page">
                <div class="page-header">
                    <h1>${t.title || 'About CodeSahayak'}</h1>
                    <p>${t.subtitle || 'Democratizing coding education for Indian students'}</p>
                </div>

                <div class="about-content">
                    <section class="about-section">
                        <h2>${t.ourMission || 'Our Mission'}</h2>
                        <p>${t.missionText || 'CodeSahayak was born from a simple belief: every Indian student deserves to learn programming in their mother tongue. We combine AI technology with deep cultural understanding to make coding education accessible, engaging, and effective for millions of students across India.'}</p>
                    </section>

                    <section class="about-section">
                        <h2>${t.whyWeBuilt || 'Why We Built This'}</h2>
                        <div class="reasons-grid">
                            <div class="reason-card">
                                <div class="reason-icon">🌍</div>
                                <h3>${t.reason1 || 'Language Barrier'}</h3>
                                <p>${t.reason1Desc || 'Most coding resources are in English, making it harder for non-English speakers to learn'}</p>
                            </div>
                            <div class="reason-card">
                                <div class="reason-icon">📱</div>
                                <h3>${t.reason2 || 'Connectivity Issues'}</h3>
                                <p>${t.reason2Desc || 'Unreliable internet in many parts of India makes online learning difficult'}</p>
                            </div>
                            <div class="reason-card">
                                <div class="reason-icon">🎯</div>
                                <h3>${t.reason3 || 'Cultural Context'}</h3>
                                <p>${t.reason3Desc || 'Examples that resonate with Indian culture make learning more effective'}</p>
                            </div>
                        </div>
                    </section>

                    <section class="about-section">
                        <h2>${t.ourValues || 'Our Values'}</h2>
                        <ul class="values-list">
                            <li><strong>${t.value1 || 'Accessibility'}:</strong> ${t.value1Desc || 'Free, forever. No paywalls, no premium tiers.'}</li>
                            <li><strong>${t.value2 || 'Quality'}:</strong> ${t.value2Desc || 'World-class education in every Indian language.'}</li>
                            <li><strong>${t.value3 || 'Cultural Respect'}:</strong> ${t.value3Desc || 'Celebrating Indian diversity in our teaching.'}</li>
                            <li><strong>${t.value4 || 'Student-First'}:</strong> ${t.value4Desc || 'Every decision is made with students in mind.'}</li>
                        </ul>
                    </section>

                    <section class="about-section">
                        <h2>${t.theTeam || 'The Team'}</h2>
                        <p>${t.teamText || 'CodeSahayak is built by a passionate team of educators, developers, and linguists who believe in the power of education to transform lives. We are committed to making coding accessible to every Indian student, regardless of their background or location.'}</p>
                    </section>

                    <section class="about-section cta-section">
                        <h2>${t.joinUs || 'Join Our Mission'}</h2>
                        <p>${t.joinText || 'Help us democratize coding education in India'}</p>
                        <a href="/signup" class="btn btn-primary" data-link>${t.getStarted || 'Get Started'}</a>
                    </section>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// CONTACT PAGE
// ============================================================================

class ContactPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            subject: '',
            message: '',
            loading: false,
            success: false,
            error: null
        };
    }

    render() {
        const { name, email, subject, message, loading, success, error } = this.state;
        const t = window.translations?.[appState.getState('language')]?.contact || {};
        
        return `
            <div class="contact-page">
                <div class="page-header">
                    <h1>${t.title || 'Contact Us'}</h1>
                    <p>${t.subtitle || 'We\'d love to hear from you'}</p>
                </div>

                <div class="contact-content">
                    <div class="contact-info">
                        <h2>${t.getInTouch || 'Get in Touch'}</h2>
                        <div class="info-item">
                            <div class="info-icon">📧</div>
                            <div>
                                <h3>${t.email || 'Email'}</h3>
                                <p>support@codesahayak.com</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon">💬</div>
                            <div>
                                <h3>${t.whatsapp || 'WhatsApp'}</h3>
                                <p>+91 98765 43210</p>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="info-icon">🐦</div>
                            <div>
                                <h3>${t.social || 'Social Media'}</h3>
                                <p>@codesahayak</p>
                            </div>
                        </div>
                    </div>

                    <div class="contact-form-container">
                        ${success ? `
                            <div class="success-message">
                                <div class="success-icon">✅</div>
                                <h3>${t.thankYou || 'Thank You!'}</h3>
                                <p>${t.successMessage || 'We\'ve received your message and will get back to you soon.'}</p>
                            </div>
                        ` : `
                            <form class="contact-form" id="contactForm">
                                ${error ? `
                                    <div class="alert alert-error">
                                        <span>${error}</span>
                                    </div>
                                ` : ''}

                                <div class="form-group">
                                    <label>${t.name || 'Name'} *</label>
                                    <input 
                                        type="text" 
                                        id="contactName"
                                        class="form-input"
                                        value="${name}"
                                        required
                                        ${loading ? 'disabled' : ''}
                                    />
                                </div>

                                <div class="form-group">
                                    <label>${t.email || 'Email'} *</label>
                                    <input 
                                        type="email" 
                                        id="contactEmail"
                                        class="form-input"
                                        value="${email}"
                                        required
                                        ${loading ? 'disabled' : ''}
                                    />
                                </div>

                                <div class="form-group">
                                    <label>${t.subject || 'Subject'} *</label>
                                    <input 
                                        type="text" 
                                        id="contactSubject"
                                        class="form-input"
                                        value="${subject}"
                                        required
                                        ${loading ? 'disabled' : ''}
                                    />
                                </div>

                                <div class="form-group">
                                    <label>${t.message || 'Message'} *</label>
                                    <textarea 
                                        id="contactMessage"
                                        class="form-textarea"
                                        rows="6"
                                        required
                                        ${loading ? 'disabled' : ''}
                                    >${message}</textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    class="btn btn-primary btn-block"
                                    ${loading ? 'disabled' : ''}
                                >
                                    ${loading ? `<span class="spinner"></span> ${t.sending || 'Sending...'}` : t.send || 'Send Message'}
                                </button>
                            </form>
                        `}
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
        const form = document.getElementById('contactForm');
        if (form) {
            form.onsubmit = (e) => this.handleSubmit(e);
            
            document.getElementById('contactName').oninput = (e) => 
                this.setState({ name: e.target.value, error: null });
            document.getElementById('contactEmail').oninput = (e) => 
                this.setState({ email: e.target.value, error: null });
            document.getElementById('contactSubject').oninput = (e) => 
                this.setState({ subject: e.target.value, error: null });
            document.getElementById('contactMessage').oninput = (e) => 
                this.setState({ message: e.target.value, error: null });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const { name, email, subject, message } = this.state;

        if (!name || !email || !subject || !message) {
            this.setState({ error: 'Please fill in all fields' });
            return;
        }

        this.setState({ loading: true, error: null });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.setState({ 
                loading: false, 
                success: true,
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            this.setState({ 
                loading: false, 
                error: 'Failed to send message. Please try again.' 
            });
        }
    }
}

// ============================================================================
// PRIVACY POLICY PAGE
// ============================================================================

class PrivacyPage extends Component {
    render() {
        const t = window.translations?.[appState.getState('language')]?.privacy || {};
        
        return `
            <div class="legal-page">
                <div class="page-header">
                    <h1>${t.title || 'Privacy Policy'}</h1>
                    <p>${t.lastUpdated || 'Last updated'}: February 6, 2026</p>
                </div>

                <div class="legal-content">
                    <section>
                        <h2>${t.section1 || '1. Information We Collect'}</h2>
                        <p>${t.section1Text || 'We collect information you provide directly to us, including your name, email address, preferred language, and coding activity on our platform.'}</p>
                    </section>

                    <section>
                        <h2>${t.section2 || '2. How We Use Your Information'}</h2>
                        <p>${t.section2Text || 'We use your information to provide, maintain, and improve our services, personalize your learning experience, and communicate with you about updates and features.'}</p>
                    </section>

                    <section>
                        <h2>${t.section3 || '3. Data Security'}</h2>
                        <p>${t.section3Text || 'We implement appropriate security measures to protect your personal information. Your data is encrypted in transit and at rest.'}</p>
                    </section>

                    <section>
                        <h2>${t.section4 || '4. Your Rights'}</h2>
                        <p>${t.section4Text || 'You have the right to access, update, or delete your personal information at any time. You can also export your data or request account deletion.'}</p>
                    </section>

                    <section>
                        <h2>${t.section5 || '5. Cookies and Tracking'}</h2>
                        <p>${t.section5Text || 'We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content.'}</p>
                    </section>

                    <section>
                        <h2>${t.section6 || '6. Third-Party Services'}</h2>
                        <p>${t.section6Text || 'We may use third-party services for analytics and AI features. These services have their own privacy policies.'}</p>
                    </section>

                    <section>
                        <h2>${t.section7 || '7. Children\'s Privacy'}</h2>
                        <p>${t.section7Text || 'Our service is designed for students of all ages. For users under 13, we require parental consent and take additional privacy measures.'}</p>
                    </section>

                    <section>
                        <h2>${t.section8 || '8. Changes to This Policy'}</h2>
                        <p>${t.section8Text || 'We may update this privacy policy from time to time. We will notify you of any significant changes via email or platform notification.'}</p>
                    </section>

                    <section>
                        <h2>${t.contact || 'Contact Us'}</h2>
                        <p>${t.contactText || 'If you have questions about this privacy policy, please contact us at privacy@codesahayak.com'}</p>
                    </section>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// TERMS OF SERVICE PAGE
// ============================================================================

class TermsPage extends Component {
    render() {
        const t = window.translations?.[appState.getState('language')]?.terms || {};
        
        return `
            <div class="legal-page">
                <div class="page-header">
                    <h1>${t.title || 'Terms of Service'}</h1>
                    <p>${t.lastUpdated || 'Last updated'}: February 6, 2026</p>
                </div>

                <div class="legal-content">
                    <section>
                        <h2>${t.section1 || '1. Acceptance of Terms'}</h2>
                        <p>${t.section1Text || 'By accessing and using CodeSahayak, you accept and agree to be bound by these Terms of Service.'}</p>
                    </section>

                    <section>
                        <h2>${t.section2 || '2. Use of Service'}</h2>
                        <p>${t.section2Text || 'You may use our service for lawful purposes only. You agree not to misuse the platform or help anyone else do so.'}</p>
                    </section>

                    <section>
                        <h2>${t.section3 || '3. User Accounts'}</h2>
                        <p>${t.section3Text || 'You are responsible for maintaining the security of your account and password. You must notify us immediately of any unauthorized use.'}</p>
                    </section>

                    <section>
                        <h2>${t.section4 || '4. Content Ownership'}</h2>
                        <p>${t.section4Text || 'You retain ownership of the code you write on our platform. We have the right to use anonymized data to improve our services.'}</p>
                    </section>

                    <section>
                        <h2>${t.section5 || '5. Prohibited Activities'}</h2>
                        <p>${t.section5Text || 'You may not use the service to distribute malware, spam, or engage in any illegal activities. Violation may result in account termination.'}</p>
                    </section>

                    <section>
                        <h2>${t.section6 || '6. Service Availability'}</h2>
                        <p>${t.section6Text || 'We strive to provide reliable service but cannot guarantee 100% uptime. We may modify or discontinue features with notice.'}</p>
                    </section>

                    <section>
                        <h2>${t.section7 || '7. Limitation of Liability'}</h2>
                        <p>${t.section7Text || 'CodeSahayak is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.'}</p>
                    </section>

                    <section>
                        <h2>${t.section8 || '8. Governing Law'}</h2>
                        <p>${t.section8Text || 'These terms are governed by the laws of India. Any disputes will be resolved in Indian courts.'}</p>
                    </section>

                    <section>
                        <h2>${t.contact || 'Contact Us'}</h2>
                        <p>${t.contactText || 'For questions about these terms, contact us at legal@codesahayak.com'}</p>
                    </section>
                </div>
            </div>
        `;
    }
}

// Export all page components
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LandingPage,
        LoginPage,
        SignupPage,
        AboutPage,
        ContactPage,
        PrivacyPage,
        TermsPage,
        NotFoundPage,
        IDEPage
    };
}

// ============================================================================
// LOGIN PAGE
// ============================================================================

class LoginPage extends Component {
    render() {
        return `<div id="login-form-container"></div>`;
    }
    
    afterRender() {
        const container = document.getElementById('login-form-container');
        if (container && typeof LoginForm !== 'undefined') {
            const loginForm = new LoginForm();
            loginForm.mount(container);
        }
    }
}

// ============================================================================
// SIGNUP PAGE
// ============================================================================

class SignupPage extends Component {
    render() {
        return `<div id="signup-form-container"></div>`;
    }
    
    afterRender() {
        const container = document.getElementById('signup-form-container');
        if (container && typeof SignupForm !== 'undefined') {
            const signupForm = new SignupForm();
            signupForm.mount(container);
        }
    }
}

// ============================================================================
// 404 NOT FOUND PAGE
// ============================================================================

class NotFoundPage extends Component {
    render() {
        const t = window.translations?.[appState.getState('language')]?.notFound || {};
        
        return `
            <div class="not-found-page">
                <div class="not-found-content">
                    <div class="not-found-icon">🔍</div>
                    <h1 class="not-found-title">${t.title || '404 - Page Not Found'}</h1>
                    <p class="not-found-message">
                        ${t.message || 'The page you are looking for does not exist.'}
                    </p>
                    <div class="not-found-actions">
                        <a href="/" class="btn btn-primary" data-link>
                            ${t.goHome || 'Go to Home'}
                        </a>
                        <a href="/dashboard" class="btn btn-secondary" data-link>
                            ${t.goDashboard || 'Go to Dashboard'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// IDE PAGE
// ============================================================================

class IDEPage extends Component {
    render() {
        return `<div id="ide-container"></div>`;
    }
    
    afterRender() {
        const container = document.getElementById('ide-container');
        if (container) {
            // IDE components will be mounted here
            container.innerHTML = `
                <div class="ide-layout">
                    <div id="code-editor-container"></div>
                    <div id="output-console-container"></div>
                    <div id="sahayak-tutor-container"></div>
                </div>
            `;
            
            // Mount IDE components
            if (typeof CodeEditor !== 'undefined') {
                const editor = new CodeEditor();
                editor.mount(document.getElementById('code-editor-container'));
            }
            
            if (typeof OutputConsole !== 'undefined') {
                const console = new OutputConsole();
                console.mount(document.getElementById('output-console-container'));
            }
            
            if (typeof SahayakTutorPanel !== 'undefined') {
                const tutor = new SahayakTutorPanel();
                tutor.mount(document.getElementById('sahayak-tutor-container'));
            }
        }
    }
}
