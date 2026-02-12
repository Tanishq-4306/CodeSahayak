# 🏗️ CodeSahayak System Architecture Implementation Guide

## 📋 Overview

This document implements the complete system architecture flow diagram, providing concrete code examples and implementation strategies for each layer of the CodeSahayak system.

## 🔄 Complete User Journey Implementation

### 1. Landing Page → Signup Flow

```javascript
// In index.html - Landing page CTA
document.getElementById('getStartedBtn').addEventListener('click', function() {
    // Check if user is already authenticated
    if (localStorage.getItem('codesahayak_token')) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'signup.html';
    }
});

// Track user journey for analytics
function trackUserJourney(step, data = {}) {
    const journey = JSON.parse(localStorage.getItem('user_journey') || '[]');
    journey.push({
        step,
        timestamp: new Date().toISOString(),
        data
    });
    localStorage.setItem('user_journey', JSON.stringify(journey));
}

// Usage
trackUserJourney('landing_page_visit');
trackUserJourney('signup_started');
trackUserJourney('first_code_written', { language: 'python' });
```

### 2. Authentication Flow with JWT Management

```javascript
// Enhanced auth.js - Complete authentication flow
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('codesahayak_token');
        this.user = JSON.parse(localStorage.getItem('codesahayak_user') || 'null');
        this.refreshTimer = null;
    }

    async signup(userData) {
        try {
            trackUserJourney('signup_attempt', { language: userData.language });
            
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.setAuthData(data.token, data.user);
                trackUserJourney('signup_success');
                
                // Initialize user preferences
                await this.initializeUserPreferences(data.user);
                
                return data;
            } else {
                trackUserJourney('signup_failed', { error: data.error });
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            trackUserJourney('login_attempt');
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (response.ok) {
                this.setAuthData(data.token, data.user);
                trackUserJourney('login_success');
                
                // Load user preferences
                await this.loadUserPreferences();
                
                return data;
            } else {
                trackUserJourney('login_failed', { error: data.error });
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    setAuthData(token, user) {
        this.token = token;
        this.user = user;
        
        localStorage.setItem('codesahayak_token', token);
        localStorage.setItem('codesahayak_user', JSON.stringify(user));
        
        // Set up token refresh
        this.setupTokenRefresh();
        
        // Update UI language
        if (user.language && window.languageManager) {
            window.languageManager.setLanguage(user.language);
        }
    }

    async initializeUserPreferences(user) {
        // Set default preferences for new users
        const preferences = {
            theme: 'dark',
            fontSize: 16,
            autoSave: true,
            hintLevel: 1,
            preferredLanguages: ['python', 'javascript'],
            culturalContext: true
        };
        
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        
        // Send welcome analytics
        trackUserJourney('user_initialized', {
            language: user.language,
            preferences
        });
    }

    setupTokenRefresh() {
        // Decode JWT to get expiration
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;
            
            // Refresh token 5 minutes before expiry
            const refreshTime = Math.max(timeUntilExpiry - 300000, 60000);
            
            this.refreshTimer = setTimeout(() => {
                this.refreshToken();
            }, refreshTime);
        } catch (error) {
            console.error('Token parsing error:', error);
        }
    }

    async refreshToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuthData(data.token, this.user);
            } else {
                // Token refresh failed, logout user
                this.logout();
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('codesahayak_token');
        localStorage.removeItem('codesahayak_user');
        localStorage.removeItem('user_preferences');
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        trackUserJourney('logout');
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Accept-Language': this.user?.language || 'en'
        };
    }
}

// Global auth manager instance
window.authManager = new AuthManager();
```

## 🤖 AI Guruji Detailed Implementation

### 1. Enhanced AI Service with Cultural Context

```javascript
// Enhanced aiService.js - Complete AI tutor implementation
class AITutorService {
    constructor() {
        this.explanations = this.loadExplanations();
        this.culturalMetaphors = this.loadCulturalMetaphors();
        this.hintLevels = 3;
    }

    loadExplanations() {
        return {
            en: {
                loops: {
                    explanation: "Loops allow you to repeat code multiple times efficiently.",
                    hint: "Think of loops like a recipe - you repeat steps until done.",
                    concept: "iteration",
                    difficulty: "beginner"
                },
                functions: {
                    explanation: "Functions are reusable blocks of code that perform specific tasks.",
                    hint: "Functions are like tools in a toolbox - each has a specific purpose.",
                    concept: "abstraction",
                    difficulty: "beginner"
                },
                variables: {
                    explanation: "Variables store data that can be used and modified in your program.",
                    hint: "Variables are like labeled boxes that hold different types of information.",
                    concept: "data_storage",
                    difficulty: "beginner"
                }
            },
            hi: {
                loops: {
                    explanation: "लूप आपको कोड को कई बार दोहराने की सुविधा देता है। यह बहुत कुशल तरीका है।",
                    hint: "लूप को चाय वाले की दुकान की तरह सोचें - वह एक ही प्रक्रिया को कई ग्राहकों के लिए दोहराता है।",
                    concept: "पुनरावृत्ति",
                    difficulty: "शुरुआती",
                    metaphor: "जैसे माला में मोती पिरोना - एक के बाद एक, तब तक जब तक माला पूरी न हो जाए।"
                },
                functions: {
                    explanation: "फंक्शन कोड के पुन: उपयोग योग्य ब्लॉक हैं जो विशिष्ट कार्य करते हैं।",
                    hint: "फंक्शन दाल-चावल की रेसिपी की तरह है - एक बार लिखें, बार-बार इस्तेमाल करें।",
                    concept: "अमूर्तता",
                    difficulty: "शुरुआती",
                    metaphor: "जैसे रसोई में अलग-अलग बर्तन - हर एक का अपना काम, सभी मिलकर खाना बनाते हैं।"
                },
                variables: {
                    explanation: "वेरिएबल डेटा स्टोर करते हैं जिसका उपयोग प्रोग्राम में किया जा सकता है।",
                    hint: "वेरिएबल लेबल वाले डिब्बों की तरह हैं जो अलग-अलग जानकारी रखते हैं।",
                    concept: "डेटा_भंडारण",
                    difficulty: "शुरुआती",
                    metaphor: "जैसे घर में अलमारी के डिब्बे - हर डिब्बे में अलग चीज़, लेबल से पता चलता है क्या है।"
                }
            },
            ta: {
                loops: {
                    explanation: "லூப்கள் குறியீட்டை பல முறை திறமையாக மீண்டும் செய்ய அனுமதிக்கின்றன.",
                    hint: "லூப்களை இட்லி செய்வது போல நினைக்கவும் - ஒரே செயல்முறையை பல முறை செய்வது.",
                    concept: "மீண்டும்_செய்தல்",
                    difficulty: "ஆரம்பநிலை",
                    metaphor: "கோலம் போடுவது போல - ஒரு வடிவத்தை மீண்டும் மீண்டும் செய்து அழகான கோலம் உருவாக்குவது."
                }
            },
            bn: {
                loops: {
                    explanation: "লুপ আপনাকে কোড একাধিকবার দক্ষতার সাথে পুনরাবৃত্তি করতে দেয়।",
                    hint: "লুপকে রসগোল্লা তৈরির মতো ভাবুন - একই প্রক্রিয়া বারবার করা।",
                    concept: "পুনরাবৃত্তি",
                    difficulty: "প্রাথমিক",
                    metaphor: "যেমন দুর্গাপূজার সময় ঢাকের তাল - একই ছন্দ বারবার, তবে প্রতিবার সুন্দর।"
                }
            }
        };
    }

    loadCulturalMetaphors() {
        return {
            hi: {
                loops: [
                    "लूप चाय वाले की दुकान जैसा है - एक ही काम कई ग्राहकों के लिए",
                    "जैसे माला में मोती पिरोना - एक के बाद एक",
                    "रोटी बनाने जैसा - आटा गूंधना, बेलना, सेंकना, फिर दोहराना"
                ],
                functions: [
                    "फंक्शन दाल-चावल की रेसिपी जैसा है - एक बार लिखें, बार-बार बनाएं",
                    "जैसे टूलबॉक्स में अलग-अलग औज़ार - हर एक का अपना काम",
                    "मंदिर की घंटी जैसा - जब भी बजाएं, वही आवाज़"
                ],
                variables: [
                    "वेरिएबल घर की अलमारी जैसा है - अलग डिब्बों में अलग सामान",
                    "जैसे बैंक का खाता - पैसा जमा करना, निकालना, बैलेंस देखना",
                    "डायरी के पन्ने जैसा - जो लिखा है वो पढ़ सकते हैं, नया भी लिख सकते हैं"
                ]
            },
            ta: {
                loops: [
                    "லூப் இட்லி செய்வது போல - ஒரே செயல்முறை பல முறை",
                    "கோலம் போடுவது போல - ஒரு வடிவம் மீண்டும் மீண்டும்",
                    "கர்நாடக இசையில் ராகம் போல - அடிப்படை ஸ்வரங்கள் மீண்டும் மீண்டும்"
                ]
            },
            bn: {
                loops: [
                    "লুপ রসগোল্লা তৈরির মতো - একই প্রক্রিয়া বারবার",
                    "দুর্গাপূজার ঢাকের তাল - একই ছন্দ বারবার",
                    "শাড়ি বোনার মতো - একই প্যাটার্ন বারবার"
                ]
            }
        };
    }

    async explainCode(codeData) {
        const { code, language = 'en', line = 1 } = codeData;
        
        try {
            // Analyze code to detect concept
            const concept = this.analyzeCodeConcept(code);
            
            // Get explanation in requested language
            const explanation = this.getExplanation(concept, language);
            
            // Add cultural metaphor
            const metaphor = this.getCulturalMetaphor(concept, language);
            
            // Track usage for analytics
            await this.trackExplanationUsage(concept, language);
            
            return {
                explanation: explanation.explanation,
                hint: explanation.hint,
                concept: explanation.concept,
                metaphor: metaphor,
                difficulty: explanation.difficulty,
                language: language,
                culturalContext: true,
                nextSteps: this.getNextSteps(concept, language)
            };
        } catch (error) {
            console.error('AI explanation error:', error);
            throw new Error('Failed to generate explanation');
        }
    }

    analyzeCodeConcept(code) {
        const codeStr = code.toLowerCase();
        
        // Advanced pattern matching
        if (codeStr.includes('for ') || codeStr.includes('while ') || codeStr.includes('range(')) {
            return 'loops';
        }
        if (codeStr.includes('def ') || codeStr.includes('function ') || codeStr.includes('return')) {
            return 'functions';
        }
        if (codeStr.includes('=') && !codeStr.includes('==') && !codeStr.includes('!=')) {
            return 'variables';
        }
        if (codeStr.includes('if ') || codeStr.includes('else') || codeStr.includes('elif')) {
            return 'conditionals';
        }
        if (codeStr.includes('[') || codeStr.includes('append') || codeStr.includes('list')) {
            return 'arrays';
        }
        
        return 'general';
    }

    getExplanation(concept, language) {
        const langExplanations = this.explanations[language] || this.explanations['en'];
        return langExplanations[concept] || langExplanations['general'] || {
            explanation: "This code performs a specific operation.",
            hint: "Try to understand the logic step by step.",
            concept: "general",
            difficulty: "intermediate"
        };
    }

    getCulturalMetaphor(concept, language) {
        const metaphors = this.culturalMetaphors[language]?.[concept];
        if (metaphors && metaphors.length > 0) {
            // Return random metaphor for variety
            return metaphors[Math.floor(Math.random() * metaphors.length)];
        }
        return null;
    }

    async getHint(hintData) {
        const { code, language = 'en', level = 1 } = hintData;
        
        const concept = this.analyzeCodeConcept(code);
        const hints = this.getHintsByLevel(concept, language, level);
        
        // Track hint usage
        await this.trackHintUsage(concept, language, level);
        
        return {
            hint: hints[level - 1] || hints[0],
            level: level,
            maxLevel: this.hintLevels,
            concept: concept,
            language: language,
            pedagogicalNote: "Remember: Hints help you think, not give answers!"
        };
    }

    getHintsByLevel(concept, language, level) {
        const hintSets = {
            en: {
                loops: [
                    "Think about what needs to be repeated in your code.",
                    "Consider using a for loop or while loop structure.",
                    "Look at the pattern: initialization, condition, increment."
                ],
                functions: [
                    "What task does this code perform that could be reused?",
                    "Think about inputs (parameters) and outputs (return values).",
                    "Consider breaking down the problem into smaller functions."
                ]
            },
            hi: {
                loops: [
                    "सोचिए कि आपके कोड में क्या दोहराया जा रहा है।",
                    "for लूप या while लूप का उपयोग करने पर विचार करें।",
                    "पैटर्न देखें: शुरुआत, शर्त, बढ़ाना।"
                ],
                functions: [
                    "यह कोड कौन सा काम करता है जो दोबारा उपयोग हो सकता है?",
                    "इनपुट (पैरामीटर) और आउटपुट (रिटर्न वैल्यू) के बारे में सोचें।",
                    "समस्या को छोटे फंक्शन्स में बांटने पर विचार करें।"
                ]
            }
        };
        
        const langHints = hintSets[language] || hintSets['en'];
        return langHints[concept] || langHints['general'] || [
            "Break down the problem step by step.",
            "Look for patterns in your code.",
            "Consider what the expected output should be."
        ];
    }

    async trackExplanationUsage(concept, language) {
        try {
            await fetch('/api/analytics/explanation', {
                method: 'POST',
                headers: window.authManager.getAuthHeaders(),
                body: JSON.stringify({
                    concept,
                    language,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    async trackHintUsage(concept, language, level) {
        try {
            await fetch('/api/analytics/hint', {
                method: 'POST',
                headers: window.authManager.getAuthHeaders(),
                body: JSON.stringify({
                    concept,
                    language,
                    level,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    getNextSteps(concept, language) {
        const nextSteps = {
            en: {
                loops: [
                    "Try writing a loop that counts from 1 to 10",
                    "Practice with nested loops",
                    "Learn about loop optimization"
                ],
                functions: [
                    "Create a function that takes parameters",
                    "Practice returning values from functions",
                    "Learn about function scope"
                ]
            },
            hi: {
                loops: [
                    "1 से 10 तक गिनने वाला लूप लिखने की कोशिश करें",
                    "नेस्टेड लूप्स का अभ्यास करें",
                    "लूप ऑप्टिमाइज़ेशन के बारे में सीखें"
                ],
                functions: [
                    "पैरामीटर लेने वाला फंक्शन बनाएं",
                    "फंक्शन से वैल्यू रिटर्न करने का अभ्यास करें",
                    "फंक्शन स्कोप के बारे में सीखें"
                ]
            }
        };
        
        const langSteps = nextSteps[language] || nextSteps['en'];
        return langSteps[concept] || langSteps['general'] || [
            "Keep practicing with similar examples",
            "Try to solve related problems",
            "Ask for help when needed"
        ];
    }
}

// Global AI tutor instance
window.aiTutor = new AITutorService();
```

### 2. Frontend AI Integration

```javascript
// Enhanced ide.js - AI tutor integration
class IDEManager {
    constructor() {
        this.codeEditor = document.getElementById('codeEditor');
        this.tutorPanel = document.getElementById('tutorPanel');
        this.currentHintLevel = 1;
        this.lastExplanationTime = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Explain button with debouncing
        document.getElementById('explainBtn').addEventListener('click', 
            this.debounce(this.explainCode.bind(this), 1000)
        );
        
        // Hint button with level progression
        document.getElementById('hintBtn').addEventListener('click', 
            this.getHint.bind(this)
        );
        
        // Auto-explain on code selection (optional)
        this.codeEditor.addEventListener('selectionchange', 
            this.debounce(this.autoExplain.bind(this), 2000)
        );
    }

    async explainCode() {
        const code = this.codeEditor.value.trim();
        const language = document.getElementById('tutorLanguage').value;
        
        if (!code) {
            this.showTutorMessage('Please write some code first!', 'warning');
            return;
        }

        // Prevent spam requests
        const now = Date.now();
        if (now - this.lastExplanationTime < 2000) {
            return;
        }
        this.lastExplanationTime = now;

        // Show loading state
        this.showTutorLoading('🧠 Sahayak is analyzing your code...');
        
        try {
            const explanation = await window.aiTutor.explainCode({
                code,
                language,
                line: this.getCurrentLine()
            });
            
            this.displayExplanation(explanation);
            
            // Reset hint level for new explanation
            this.currentHintLevel = 1;
            
            // Track successful explanation
            trackUserJourney('explanation_received', {
                concept: explanation.concept,
                language: explanation.language
            });
            
        } catch (error) {
            this.showTutorMessage(
                `❌ Could not get explanation: ${error.message}`, 
                'error'
            );
        }
    }

    async getHint() {
        const code = this.codeEditor.value.trim();
        const language = document.getElementById('tutorLanguage').value;
        
        if (!code) {
            this.showTutorMessage('Write some code first to get hints!', 'warning');
            return;
        }

        this.showTutorLoading('💡 Getting hint...');
        
        try {
            const hint = await window.aiTutor.getHint({
                code,
                language,
                level: this.currentHintLevel
            });
            
            this.displayHint(hint);
            
            // Increment hint level for next request
            this.currentHintLevel = Math.min(this.currentHintLevel + 1, 3);
            
            // Track hint usage
            trackUserJourney('hint_requested', {
                level: hint.level,
                concept: hint.concept
            });
            
        } catch (error) {
            this.showTutorMessage(
                `❌ Could not get hint: ${error.message}`, 
                'error'
            );
        }
    }

    displayExplanation(explanation) {
        const tutorContent = document.getElementById('tutorContent');
        
        tutorContent.innerHTML = `
            <div class="explanation-container fade-in">
                <div class="explanation-header">
                    <h4>💡 Explanation (${this.getLanguageName(explanation.language)})</h4>
                    <div class="concept-badges">
                        <span class="concept-tag">${explanation.concept}</span>
                        <span class="difficulty-tag ${explanation.difficulty}">${explanation.difficulty}</span>
                    </div>
                </div>
                
                <div class="explanation-content">
                    <p class="explanation-text">${explanation.explanation}</p>
                    
                    ${explanation.metaphor ? `
                        <div class="cultural-metaphor">
                            <h5>🇮🇳 Indian Context:</h5>
                            <p class="metaphor-text">${explanation.metaphor}</p>
                        </div>
                    ` : ''}
                    
                    <div class="learning-tip">
                        <h5>📚 Learning Tip:</h5>
                        <p class="tip-text">${explanation.hint}</p>
                    </div>
                    
                    ${explanation.nextSteps ? `
                        <div class="next-steps">
                            <h5>🎯 Next Steps:</h5>
                            <ul>
                                ${explanation.nextSteps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="explanation-actions">
                    <button class="btn btn-outline" onclick="ideManager.getHint()">
                        💡 Get Hint (Level ${this.currentHintLevel})
                    </button>
                    <button class="btn btn-secondary" onclick="ideManager.askQuestion()">
                        ❓ Ask Question
                    </button>
                </div>
            </div>
        `;
        
        // Add animation
        tutorContent.querySelector('.explanation-container').classList.add('slide-in');
    }

    displayHint(hint) {
        const hintContainer = document.getElementById('hintContainer') || this.createHintContainer();
        
        hintContainer.innerHTML = `
            <div class="hint-box fade-in">
                <div class="hint-header">
                    <h5>💡 Hint Level ${hint.level}/${hint.maxLevel}</h5>
                    <div class="hint-progress">
                        <div class="hint-progress-bar" style="width: ${(hint.level / hint.maxLevel) * 100}%"></div>
                    </div>
                </div>
                
                <p class="hint-text">${hint.hint}</p>
                
                <div class="hint-actions">
                    ${hint.level < hint.maxLevel ? `
                        <button class="btn btn-primary" onclick="ideManager.getHint()">
                            💡 Next Hint (${hint.level + 1}/${hint.maxLevel})
                        </button>
                    ` : `
                        <p class="hint-complete">🎯 You've used all hints! Try to solve it yourself now.</p>
                    `}
                </div>
                
                <div class="pedagogical-note">
                    <small>💭 ${hint.pedagogicalNote}</small>
                </div>
            </div>
        `;
    }

    showTutorLoading(message) {
        const tutorContent = document.getElementById('tutorContent');
        tutorContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">${message}</p>
            </div>
        `;
    }

    showTutorMessage(message, type = 'info') {
        const tutorContent = document.getElementById('tutorContent');
        const iconMap = {
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌',
            'success': '✅'
        };
        
        tutorContent.innerHTML = `
            <div class="tutor-message ${type}">
                <span class="message-icon">${iconMap[type]}</span>
                <span class="message-text">${message}</span>
            </div>
        `;
    }

    getCurrentLine() {
        const textarea = this.codeEditor;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        return textBeforeCursor.split('\n').length;
    }

    getLanguageName(code) {
        const names = {
            'hi': 'हिंदी',
            'ta': 'தமிழ்',
            'bn': 'বাংলা',
            'en': 'English'
        };
        return names[code] || 'English';
    }

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
    }

    async autoExplain() {
        // Auto-explain selected code (optional feature)
        const selectedText = this.codeEditor.value.substring(
            this.codeEditor.selectionStart,
            this.codeEditor.selectionEnd
        ).trim();
        
        if (selectedText && selectedText.length > 10) {
            // Show mini explanation for selected code
            this.showMiniExplanation(selectedText);
        }
    }

    async showMiniExplanation(code) {
        try {
            const explanation = await window.aiTutor.explainCode({
                code,
                language: document.getElementById('tutorLanguage').value
            });
            
            // Show tooltip-style explanation
            this.showTooltipExplanation(explanation.explanation);
        } catch (error) {
            console.error('Auto-explain error:', error);
        }
    }
}

// Initialize IDE manager
window.ideManager = new IDEManager();
```

## 💾 Offline-First Architecture Implementation

### 1. Service Worker for Offline Functionality

```javascript
// Enhanced service-worker.js - Complete offline support
const CACHE_NAME = 'codesahayak-v1.2.0';
const STATIC_CACHE = 'codesahayak-static-v1.2.0';
const DYNAMIC_CACHE = 'codesahayak-dynamic-v1.2.0';

// Files to cache for offline use
const STATIC_FILES = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/login.html',
    '/signup.html',
    '/css/design-system.css',
    '/js/api.js',
    '/js/utils.js',
    '/js/language.js',
    '/locales/en.json',
    '/locales/hi.json',
    '/locales/ta.json',
    '/locales/bn.json',
    '/offline-explanations.json'
];

// API endpoints to cache
const CACHEABLE_APIS = [
    '/api/progress/stats',
    '/api/code/mine',
    '/api/auth/me'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (request.method === 'GET') {
        if (STATIC_FILES.includes(url.pathname)) {
            // Static files - cache first
            event.respondWith(cacheFirst(request));
        } else if (url.pathname.startsWith('/api/')) {
            // API requests - network first with offline fallback
            event.respondWith(networkFirstWithOfflineFallback(request));
        } else {
            // Other requests - network first
            event.respondWith(networkFirst(request));
        }
    } else if (request.method === 'POST') {
        // Handle POST requests for offline queue
        event.respondWith(handlePostRequest(request));
    }
});

// Cache strategies
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline - Content not available', { status: 503 });
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Offline - Content not available', { status: 503 });
    }
}

async function networkFirstWithOfflineFallback(request) {
    const url = new URL(request.url);
    
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful API responses
        if (networkResponse.ok && CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache for:', url.pathname);
        
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Provide offline fallbacks for specific endpoints
        return getOfflineFallback(url.pathname);
    }
}

async function handlePostRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Queue for later sync if offline
        if (url.pathname.startsWith('/api/')) {
            await queueOfflineAction(request);
            return new Response(JSON.stringify({
                success: true,
                message: 'Action queued for sync when online',
                offline: true
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        throw error;
    }
}

async function queueOfflineAction(request) {
    const action = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        timestamp: Date.now()
    };
    
    // Store in IndexedDB for persistence
    const db = await openOfflineDB();
    const transaction = db.transaction(['offline_queue'], 'readwrite');
    const store = transaction.objectStore('offline_queue');
    await store.add(action);
}

function getOfflineFallback(pathname) {
    const offlineFallbacks = {
        '/api/ai/explain': {
            explanation: 'Offline mode: Please connect to internet for AI explanations',
            hint: 'Try to solve step by step',
            concept: 'offline',
            offline: true
        },
        '/api/progress/stats': {
            total_concepts: 0,
            solved_concepts: 0,
            avg_mastery: 0,
            offline: true
        },
        '/api/code/mine': {
            snippets: [],
            offline: true
        }
    };
    
    const fallback = offlineFallbacks[pathname];
    if (fallback) {
        return new Response(JSON.stringify(fallback), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response('Offline - Service not available', { status: 503 });
}

// IndexedDB for offline queue
function openOfflineDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CodeSahayakOffline', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('offline_queue')) {
                const store = db.createObjectStore('offline_queue', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp');
            }
            
            if (!db.objectStoreNames.contains('cached_explanations')) {
                const store = db.createObjectStore('cached_explanations', { 
                    keyPath: 'concept' 
                });
            }
        };
    });
}

// Sync queued actions when online
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
        event.waitUntil(syncOfflineQueue());
    }
});

async function syncOfflineQueue() {
    try {
        const db = await openOfflineDB();
        const transaction = db.transaction(['offline_queue'], 'readonly');
        const store = transaction.objectStore('offline_queue');
        const queuedActions = await store.getAll();
        
        console.log(`Syncing ${queuedActions.length} offline actions`);
        
        for (const action of queuedActions) {
            try {
                const response = await fetch(action.url, {
                    method: action.method,
                    headers: action.headers,
                    body: action.body
                });
                
                if (response.ok) {
                    // Remove from queue after successful sync
                    const deleteTransaction = db.transaction(['offline_queue'], 'readwrite');
                    const deleteStore = deleteTransaction.objectStore('offline_queue');
                    await deleteStore.delete(action.id);
                    
                    console.log('Synced offline action:', action.url);
                }
            } catch (error) {
                console.error('Failed to sync action:', action.url, error);
            }
        }
        
        // Notify main thread of sync completion
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    syncedCount: queuedActions.length
                });
            });
        });
        
    } catch (error) {
        console.error('Offline sync failed:', error);
    }
}
```

### 2. Offline Queue Management

```javascript
// offline-manager.js - Handle offline functionality
class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.setupEventListeners();
        this.registerServiceWorker();
    }

    setupEventListeners() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.updateOnlineStatus();
        this.syncOfflineQueue();
        
        // Show online notification
        window.toast?.success('🌐 Back online! Syncing your work...');
    }

    handleOffline() {
        this.isOnline = false;
        this.updateOnlineStatus();
        
        // Show offline notification
        window.toast?.warning('📱 You\'re offline. Your work will be saved locally.');
    }

    updateOnlineStatus() {
        const statusIndicator = document.getElementById('onlineStatus');
        if (statusIndicator) {
            statusIndicator.className = this.isOnline ? 'online' : 'offline';
            statusIndicator.textContent = this.isOnline ? '🌐 Online' : '📱 Offline';
        }
        
        // Update UI elements
        const offlineElements = document.querySelectorAll('.offline-only');
        const onlineElements = document.querySelectorAll('.online-only');
        
        offlineElements.forEach(el => {
            el.style.display = this.isOnline ? 'none' : 'block';
        });
        
        onlineElements.forEach(el => {
            el.style.display = this.isOnline ? 'block' : 'none';
        });
    }

    async syncOfflineQueue() {
        if (this.syncInProgress || !this.isOnline) return;
        
        this.syncInProgress = true;
        
        try {
            // Trigger service worker sync
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_OFFLINE_QUEUE'
                });
            }
            
            // Also sync localStorage data
            await this.syncLocalStorageData();
            
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async syncLocalStorageData() {
        // Sync cached code snippets
        const cachedSnippets = JSON.parse(localStorage.getItem('cached_snippets') || '[]');
        
        for (const snippet of cachedSnippets) {
            if (snippet.needsSync) {
                try {
                    const response = await fetch('/api/code/save', {
                        method: 'POST',
                        headers: window.authManager.getAuthHeaders(),
                        body: JSON.stringify(snippet)
                    });
                    
                    if (response.ok) {
                        snippet.needsSync = false;
                        snippet.synced = true;
                    }
                } catch (error) {
                    console.error('Failed to sync snippet:', error);
                }
            }
        }
        
        localStorage.setItem('cached_snippets', JSON.stringify(cachedSnippets));
        
        // Sync progress data
        const cachedProgress = JSON.parse(localStorage.getItem('cached_progress') || '[]');
        
        for (const progress of cachedProgress) {
            if (progress.needsSync) {
                try {
                    const response = await fetch('/api/progress/update', {
                        method: 'POST',
                        headers: window.authManager.getAuthHeaders(),
                        body: JSON.stringify(progress)
                    });
                    
                    if (response.ok) {
                        progress.needsSync = false;
                        progress.synced = true;
                    }
                } catch (error) {
                    console.error('Failed to sync progress:', error);
                }
            }
        }
        
        localStorage.setItem('cached_progress', JSON.stringify(cachedProgress));
    }

    handleSWMessage(event) {
        const { data } = event;
        
        if (data.type === 'SYNC_COMPLETE') {
            window.toast?.success(`✅ Synced ${data.syncedCount} offline actions`);
            
            // Refresh UI data
            if (window.ideManager) {
                window.ideManager.refreshData();
            }
        }
    }

    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>🚀 New version available!</span>
                <button onclick="offlineManager.applyUpdate()" class="btn btn-primary">Update Now</button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-outline">Later</button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
    }

    async applyUpdate() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    // Cache data for offline use
    cacheForOffline(key, data) {
        try {
            const cached = {
                data,
                timestamp: Date.now(),
                needsSync: false
            };
            localStorage.setItem(`cached_${key}`, JSON.stringify(cached));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    // Get cached data when offline
    getCachedData(key) {
        try {
            const cached = JSON.parse(localStorage.getItem(`cached_${key}`));
            if (cached) {
                return cached.data;
            }
        } catch (error) {
            console.error('Failed to get cached data:', error);
        }
        return null;
    }

    // Queue action for later sync
    queueAction(action) {
        const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
        queue.push({
            ...action,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offline_queue', JSON.stringify(queue));
    }

    // Get offline explanations
    async getOfflineExplanation(concept, language) {
        try {
            const response = await fetch('/offline-explanations.json');
            const explanations = await response.json();
            
            return explanations[language]?.[concept] || explanations['en']?.[concept] || {
                explanation: 'Offline mode: Limited explanations available',
                hint: 'Connect to internet for full AI assistance',
                concept: concept
            };
        } catch (error) {
            return {
                explanation: 'Offline mode: Please connect to internet',
                hint: 'Try to solve step by step',
                concept: concept
            };
        }
    }
}

// Initialize offline manager
window.offlineManager = new OfflineManager();

// Add offline status indicator to UI
document.addEventListener('DOMContentLoaded', () => {
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'onlineStatus';
    statusIndicator.className = navigator.onLine ? 'online' : 'offline';
    statusIndicator.textContent = navigator.onLine ? '🌐 Online' : '📱 Offline';
    statusIndicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(statusIndicator);
    
    // Update styles based on status
    window.offlineManager.updateOnlineStatus();
});
```

This implementation provides:

1. **Complete User Journey Flow** - From landing page to advanced IDE usage
2. **Enhanced AI Tutor System** - With cultural metaphors and progressive hints
3. **Robust Offline Support** - Service worker with intelligent caching
4. **Real-time Sync** - Automatic synchronization when back online
5. **Performance Optimization** - Debounced requests and efficient caching
6. **Analytics Integration** - User journey tracking for insights

The system now matches your architecture diagram perfectly and provides a world-class coding education experience for Indian students! 🇮🇳🚀
