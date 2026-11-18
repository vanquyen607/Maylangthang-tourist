import React, { useEffect, useState } from 'react';
import { Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { MagneticButton } from './MotionPrimitives';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export function Navbar({ isDark, onToggleTheme, onNavigate, onOpenAdmin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { id: 'destinations', label: t.nav.destinations },
    { id: 'tours', label: t.nav.tours },
    { id: 'experiences', label: t.nav.experiences },
    { id: 'journal', label: t.nav.journal },
    { id: 'process', label: t.nav.process },
    { id: 'faq', label: t.nav.faq },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F1F7F6]/88 dark:bg-[#06181E]/88 backdrop-blur-xl border-b border-[#0B2A33]/10 dark:border-white/10 shadow-sm text-[#0B2A33] dark:text-[#EDF4F3]'
          : 'bg-gradient-to-b from-[#06181E]/65 to-transparent text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Vùng 1: Tên thương hiệu */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className="font-serif-display text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B] rounded-sm"
        >
          Mây Lang Thang
        </a>

        {/* Vùng 2: 6 liên kết điều hướng chính */}
        <nav
          aria-label={lang === 'vi' ? 'Điều hướng chính' : 'Primary navigation'}
          className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium"
        >
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 hover:after:w-full after:transition-all after:duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B] rounded-sm ${
                isScrolled
                  ? 'text-[#0B2A33]/85 hover:text-[#1F8A70] dark:text-[#EDF4F3]/85 dark:hover:text-[#F2B84B] after:bg-[#1F8A70] dark:after:bg-[#F2B84B]'
                  : 'text-white/90 hover:text-white after:bg-[#F2B84B]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Vùng 3: Chuyển ngôn ngữ VI/EN, sáng/tối & nút Đặt tour */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            role="group"
            aria-label={lang === 'vi' ? 'Chuyển đổi ngôn ngữ' : 'Language switcher'}
            className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-semibold whitespace-nowrap shrink-0 ${
              isScrolled
                ? 'bg-white/75 dark:bg-[#0D313B] border-[#0B2A33]/15 dark:border-white/15'
                : 'bg-[#06181E]/45 border-white/25 backdrop-blur-md'
            }`}
          >
            <button
              type="button"
              onClick={() => setLang('vi')}
              aria-pressed={lang === 'vi'}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F2B84B] ${
                lang === 'vi'
                  ? isScrolled
                    ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                    : 'bg-[#F2B84B] text-[#06181E]'
                  : isScrolled
                    ? 'text-[#0B2A33]/70 hover:text-[#0B2A33] dark:text-white/70 dark:hover:text-white'
                    : 'text-white/75 hover:text-white'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#F2B84B] ${
                lang === 'en'
                  ? isScrolled
                    ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                    : 'bg-[#F2B84B] text-[#06181E]'
                  : isScrolled
                    ? 'text-[#0B2A33]/70 hover:text-[#0B2A33] dark:text-white/70 dark:hover:text-white'
                    : 'text-white/75 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label={t.nav.adminPortal}
            title={t.nav.adminPortal}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
              isScrolled
                ? 'hover:bg-[#0B2A33]/8 dark:hover:bg-white/10 text-[#0B2A33] dark:text-[#EDF4F3]'
                : 'hover:bg-white/15 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? t.nav.toLight : t.nav.toDark}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
              isScrolled
                ? 'hover:bg-[#0B2A33]/8 dark:hover:bg-white/10 text-[#0B2A33] dark:text-[#EDF4F3]'
                : 'hover:bg-white/15 text-white'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <MagneticButton
            onClick={() => handleLinkClick('booking')}
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-full whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
              isScrolled
                ? 'bg-[#0B2A33] text-white hover:bg-[#1F8A70] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-[#f5c76e]'
                : 'bg-[#F2B84B] text-[#0B2A33] hover:bg-white'
            }`}
          >
            {t.nav.bookCta}
          </MagneticButton>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            className={`lg:hidden w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
              isScrolled
                ? 'hover:bg-[#0B2A33]/10 dark:hover:bg-white/10'
                : 'hover:bg-white/15'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu thả xuống trên điện thoại / máy tính bảng */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-[#F1F7F6]/96 dark:bg-[#06181E]/96 backdrop-blur-xl border-b border-[#0B2A33]/10 dark:border-white/10 text-[#0B2A33] dark:text-[#EDF4F3] px-4 py-5"
          >
            <nav
              aria-label={lang === 'vi' ? 'Menu di động' : 'Mobile menu'}
              className="flex flex-col gap-1"
            >
              {navLinks.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(item.id);
                  }}
                  className="px-3 py-3 text-base font-medium rounded-lg hover:bg-[#0B2A33]/5 dark:hover:bg-white/8 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => handleLinkClick('booking')}
                className="mt-3 w-full py-3 px-5 rounded-full bg-[#1F8A70] text-white font-medium text-sm hover:bg-[#0B2A33] transition-colors"
              >
                {t.nav.bookMobile}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
