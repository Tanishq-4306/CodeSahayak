import { useEffect } from 'react';
import { X, Code2, GraduationCap, BookOpen, LayoutDashboard, MessageCircle } from 'lucide-react';
import { useTranslation, type LanguageCode } from '@/store';
import { useUIStore } from '@/store/uiStore';

export function MobileMenu() {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { isMobileMenuOpen, closeMobileMenu, openOnboarding } = useUIStore();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  const navItems = [
    { href: '#features', label: t('features'), icon: BookOpen },
    { href: '#students', label: t('forStudents'), icon: GraduationCap },
    { href: '#teachers', label: t('forTeachers'), icon: LayoutDashboard },
    { href: '#dashboard', label: t('dashboard'), icon: LayoutDashboard },
  ];

  const scrollToSection = (href: string) => {
    closeMobileMenu();
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleGetStarted = () => {
    closeMobileMenu();
    setTimeout(openOnboarding, 300);
  };

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeMobileMenu}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1A1D2B]/10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E86AB] to-[#FF6B35] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-[#1A1D2B]">CodeSahayak</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-[#F0F4FA] transition-colors"
            >
              <X className="w-6 h-6 text-[#1A1D2B]" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#5A6078] hover:bg-[#F0F4FA] hover:text-[#2E86AB] transition-colors text-left"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Language Selector */}
            <div className="mt-6 pt-6 border-t border-[#1A1D2B]/10">
              <p className="text-sm text-[#5A6078] mb-3 px-4">{t('selectLanguage')}</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as LanguageCode)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-[#2E86AB]/10 ring-2 ring-[#2E86AB]'
                        : 'hover:bg-[#F0F4FA]'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-xs font-medium text-[#1A1D2B]">
                      {lang.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-[#1A1D2B]/10 space-y-3">
            <button
              onClick={handleGetStarted}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {t('getStarted')}
            </button>
            <a
              href="https://wa.me/919999999999?text=CodeSahayak%20help"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {t('startOnWhatsApp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
