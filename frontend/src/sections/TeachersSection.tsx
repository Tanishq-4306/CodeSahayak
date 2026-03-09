import { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ArrowRight, School, BarChart3, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/store';

gsap.registerPlugin(ScrollTrigger);

export function TeachersSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Card animation
      gsap.fromTo(
        cardRef.current,
        { x: '-8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 45%',
            scrub: 0.4,
          },
        }
      );

      // Text animation
      gsap.fromTo(
        textRef.current,
        { x: '8vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 40%',
            scrub: 0.4,
          },
        }
      );

      // Card UI elements stagger
      const uiElements = cardRef.current?.querySelectorAll('.ui-item') || [];
      gsap.fromTo(
        uiElements,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'top 35%',
            scrub: 0.4,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const bullets = [
    t('teachersBullet1'),
    t('teachersBullet2'),
    t('teachersBullet3'),
  ];

  return (
    <section
      ref={sectionRef}
      id="teachers"
      className="relative py-20 lg:py-28 bg-[#F0F4FA]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Lab Report Card */}
          <div ref={cardRef} className="card order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2E86AB]/10 flex items-center justify-center">
                <School className="w-5 h-5 text-[#2E86AB]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1D2B]">{t('labReport')}</h3>
                <p className="text-sm text-[#5A6078]">CS301 - Data Structures</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* University Selector */}
              <div className="ui-item">
                <label className="block text-sm text-[#5A6078] mb-1">{t('university')}</label>
                <div className="flex items-center justify-between p-3 bg-[#F6F7FB] rounded-lg">
                  <span className="text-[#1A1D2B]">Visvesvaraya Technological University</span>
                  <ChevronDown className="w-4 h-4 text-[#5A6078]" />
                </div>
              </div>

              {/* Syllabus Code */}
              <div className="ui-item">
                <label className="block text-sm text-[#5A6078] mb-1">{t('syllabusCode')}</label>
                <div className="p-3 bg-[#F6F7FB] rounded-lg">
                  <span className="text-[#1A1D2B] font-mono">CS301 - Data Structures</span>
                </div>
              </div>

              {/* Students List */}
              <div className="ui-item">
                <label className="block text-sm text-[#5A6078] mb-2">{t('students')}</label>
                <div className="space-y-2">
                  {[
                    { name: 'Rahul Sharma', completed: true, score: 85 },
                    { name: 'Priya Patel', completed: true, score: 92 },
                    { name: 'Amit Kumar', completed: false, score: 0 },
                  ].map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-[#F6F7FB] rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#2E86AB]/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-[#2E86AB]">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-[#1A1D2B]">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.completed ? (
                          <>
                            <span className="text-sm font-medium text-[#2E86AB]">
                              {student.score}%
                            </span>
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-[#5A6078]">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics Preview */}
              <div className="ui-item flex items-center gap-3 p-3 bg-[#2E86AB]/5 rounded-lg">
                <BarChart3 className="w-5 h-5 text-[#2E86AB]" />
                <div>
                  <p className="text-sm font-medium text-[#1A1D2B]">Class Average: 78%</p>
                  <p className="text-xs text-[#5A6078]">3 students need help with recursion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div ref={textRef} className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1D2B] mb-6">
              {t('teachersTitle')}
            </h2>

            <ul className="space-y-4 mb-8">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#2E86AB]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-[#2E86AB]" />
                  </div>
                  <span className="text-[#5A6078]">{bullet}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center gap-2"
            >
              {t('seeDashboard')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
