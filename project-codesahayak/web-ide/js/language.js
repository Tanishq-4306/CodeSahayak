// Language management system for CodeSahayak
// Handles UI translation and language switching

class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('codesahayak_language') || 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'hi', 'ta', 'bn', 'mr', 'te', 'gu', 'kn'];
        this.loadTranslations();
    }

    // Load translation files
    async loadTranslations() {
        try {
            for (const lang of this.supportedLanguages) {
                const response = await fetch(`locales/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                }
            }
            this.updateUI();
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to English if translations fail to load
            this.currentLanguage = 'en';
        }
    }

    // Get translated text
    t(key, fallback = key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        return translation || this.translations['en']?.[key] || fallback;
    }

    // Change language
    setLanguage(langCode) {
        if (this.supportedLanguages.includes(langCode)) {
            this.currentLanguage = langCode;
            localStorage.setItem('codesahayak_language', langCode);
            this.updateUI();
            this.updateLanguageButtons();
            
            // Trigger custom event for other components
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: langCode } 
            }));
        }
    }

    // Update all UI elements with data-i18n attribute
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update document title if present
        const titleKey = document.documentElement.getAttribute('data-title-i18n');
        if (titleKey) {
            document.title = this.t(titleKey);
        }

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    // Update language selector buttons
    updateLanguageButtons() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLanguage) {
                btn.classList.add('active');
            }
        });

        // Update dropdown selectors
        const langSelects = document.querySelectorAll('.lang-select, .tutor-lang-select');
        langSelects.forEach(select => {
            select.value = this.currentLanguage;
        });
    }

    // Get language display name
    getLanguageName(langCode) {
        const names = {
            'en': 'English',
            'hi': 'हिंदी',
            'ta': 'தமிழ்',
            'bn': 'বাংলা',
            'mr': 'मराठी',
            'te': 'తెలుగు',
            'gu': 'ગુજરાતી',
            'kn': 'ಕನ್ನಡ'
        };
        return names[langCode] || langCode;
    }

    // Format numbers according to locale
    formatNumber(number) {
        try {
            return new Intl.NumberFormat(this.getLocaleCode()).format(number);
        } catch (error) {
            return number.toString();
        }
    }

    // Get locale code for Intl APIs
    getLocaleCode() {
        const localeMap = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'bn': 'bn-IN',
            'mr': 'mr-IN',
            'te': 'te-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN'
        };
        return localeMap[this.currentLanguage] || 'en-IN';
    }

    // Initialize language switcher
    initLanguageSwitcher() {
        // Handle language buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const langCode = e.target.getAttribute('data-lang');
                this.setLanguage(langCode);
            }
        });

        // Handle language dropdowns
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('lang-select') || 
                e.target.classList.contains('tutor-lang-select')) {
                this.setLanguage(e.target.value);
            }
        });

        // Set initial active state
        this.updateLanguageButtons();
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Check if RTL language (for future Arabic/Urdu support)
    isRTL() {
        const rtlLanguages = ['ar', 'ur', 'fa'];
        return rtlLanguages.includes(this.currentLanguage);
    }
}

// Global language manager instance
const languageManager = new LanguageManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    languageManager.initLanguageSwitcher();
});

// Export for use in other modules
window.languageManager = languageManager;