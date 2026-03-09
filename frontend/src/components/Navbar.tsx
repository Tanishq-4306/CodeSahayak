import { useState, useEffect } from 'react';
import { Menu, X, Code2, ChevronDown } from 'lucide-react';
import { useTranslation, type LanguageCode } from '@/store';
import { useUIStore } from '@/store/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const { toggleMobileMenu, isMobileMenuOpen, openOnboarding } = useUIStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: t('features') },
    { href: '#students', label: t('forStudents') },
    { href: '#teachers', label: t('forTeachers') },
    { href: '#dashboard', label: t('dashboard') },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E86AB] to-[#FF6B35] flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1D2B]">
              CodeSahayak
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-[#5A6078] hover:text-[#2E86AB] font-medium transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2E86AB] transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F0F4FA] transition-colors">
                <span className="text-lg">{languages[currentLanguage].flag}</span>
                <span className="hidden sm:inline text-sm font-medium text-[#5A6078]">
                  {languages[currentLanguage].nativeName}
                </span>
                <ChevronDown className="w-4 h-4 text-[#5A6078]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.values(languages).map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as LanguageCode)}
                    className={`flex items-center gap-3 cursor-pointer ${
                      currentLanguage === lang.code ? 'bg-[#F0F4FA]' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1">{lang.nativeName}</span>
                    {currentLanguage === lang.code && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Get Started Button */}
            <button
              onClick={openOnboarding}
              className="hidden sm:block btn-primary text-sm"
            >
              {t('getStarted')}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-[#F0F4FA] transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1A1D2B]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1A1D2B]" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
