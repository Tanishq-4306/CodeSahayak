import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Wifi, WifiOff, Check, ArrowLeft } from 'lucide-react';
import { useTranslation, type LanguageCode } from '@/store';
import { languages } from '@/store/languageStore';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function OnboardingSection() {
  const { t, currentLanguage, setLanguage } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const langButtonsRef = useRef<HTMLDivElement>(null);

  const [isOffline, setIsOffline] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Simulate download
  useEffect(() => {
    if (isOffline && isDownloading && downloadProgress < 100) {
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          const next = prev + Math.random() * 20;
          return next > 100 ? 100 : next;
        });
      }, 400);
      return () => clearInterval(interval);
    } else if (downloadProgress >= 100) {
      setIsDownloading(false);
    }
  }, [isOffline, isDownloading, downloadProgress]);

  const handleOfflineToggle = (enabled: boolean) => {
    setIsOffline(enabled);
    if (enabled) {
      setIsDownloading(true);
    } else {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // Map outline draw-on
      const mapPath = mapRef.current?.querySelector('path');
      if (mapPath) {
        const length = mapPath.getTotalLength();
        gsap.set(mapPath, { strokeDasharray: length, strokeDashoffset: length });
        scrollTl.to(mapPath, { strokeDashoffset: 0, ease: 'none' }, 0);
      }

      // Card entrance
      scrollTl.fromTo(
        cardRef.current,
        { y: '12vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'none' },
        0.05
      );

      // Language buttons stagger
      const buttons = langButtonsRef.current?.children || [];
      scrollTl.fromTo(
        buttons,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.02, ease: 'back.out(1.7)' },
        0.15
      );

      // SETTLE (30% - 70%): Static

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        cardRef.current,
        { scale: 1, y: 0, opacity: 1 },
        { scale: 0.98, y: '-6vh', opacity: 0.25, ease: 'power2.in' },
        0.7
      );

      if (mapPath) {
        scrollTl.to(mapPath, { opacity: 0.2, ease: 'power2.in' }, 0.7);
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    toast.success(`Welcome to CodeSahayak!`, {
      description: `Learning in ${languages[currentLanguage].nativeName}`,
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden bg-[#F6F7FB] flex items-center justify-center"
      data-settle-ratio="0.5"
    >
      {/* India Map Background */}
      <svg
        ref={mapRef}
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 800 900"
        fill="none"
      >
        <path
          d="M400 50 C450 50, 500 80, 520 120 C540 160, 550 200, 580 230 C610 260, 650 280, 680 320 C710 360, 720 400, 700 450 C680 500, 640 540, 620 580 C600 620, 610 660, 630 700 C650 740, 680 780, 670 820 C660 860, 620 880, 580 890 C540 900, 500 890, 460 870 C420 850, 380 820, 350 780 C320 740, 300 700, 280 660 C260 620, 240 580, 220 540 C200 500, 180 460, 160 420 C140 380, 120 340, 100 300 C80 260, 60 220, 50 180 C40 140, 50 100, 80 80 C110 60, 150 50, 200 45 C250 40, 300 40, 350 42 C380 43, 400 50, 400 50 Z"
          stroke="#2E86AB"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative w-[90%] max-w-4xl bg-white rounded-[22px] shadow-2xl overflow-hidden"
        style={{ opacity: 0 }}
      >
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2E86AB] to-[#FF6B35] flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1A1D2B]">
              {t('onboardingTitle')}
            </h2>
            <p className="text-[#5A6078] mt-2">{t('onboardingSubtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div>
              <h3 className="font-semibold text-[#1A1D2B] mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#2E86AB]" />
                {t('selectLanguage')}
              </h3>
              <div ref={langButtonsRef} className="grid grid-cols-3 gap-2">
                {Object.values(languages).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as LanguageCode)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-[#2E86AB]/10 ring-2 ring-[#2E86AB]'
                        : 'bg-[#F6F7FB] hover:bg-[#F0F4FA]'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs font-medium text-[#1A1D2B]">
                      {lang.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Mode */}
            <div>
              <h3 className="font-semibold text-[#1A1D2B] mb-3 flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-4 h-4 text-[#FF6B35]" />
                ) : (
                  <Wifi className="w-4 h-4 text-[#2E86AB]" />
                )}
                {t('enableOffline')}
              </h3>
              <div className="bg-[#F6F7FB] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-[#1A1D2B] text-sm">{t('downloadSize')}</p>
                    <p className="text-xs text-[#5A6078]">{t('problemsAvailable')}</p>
                  </div>
                  <button
                    onClick={() => handleOfflineToggle(!isOffline)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      isOffline ? 'bg-[#2E86AB]' : 'bg-[#5A6078]/30'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        isOffline ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {isOffline && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#5A6078]">
                        {downloadProgress >= 100 ? 'Ready!' : 'Downloading...'}
                      </span>
                      <span className="font-medium text-[#2E86AB]">
                        {Math.round(downloadProgress)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E86AB] rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
            <button
              onClick={handleGetStarted}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {t('getStarted')}
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
