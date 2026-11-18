import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { lang } = useLanguage();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  const label = lang === 'vi' ? 'Lên đầu' : 'Top';
  const ariaLabel = lang === 'vi' ? 'Cuộn lên đầu trang' : 'Scroll back to top';

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleScrollTop}
          aria-label={ariaLabel}
          title={ariaLabel}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
          whileHover={shouldReduceMotion ? undefined : { y: -2 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 right-5 sm:bottom-24 sm:right-7 z-30 h-11 w-11 sm:w-auto sm:px-4 rounded-full bg-[#0B2A33]/92 hover:bg-[#1F8A70] dark:bg-[#0D313B] dark:hover:bg-[#1F8A70] text-white border border-white/15 shadow-lg shadow-[#0B2A33]/25 dark:shadow-black/45 backdrop-blur-md inline-flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
        >
          <ArrowUp className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline whitespace-nowrap">{label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
