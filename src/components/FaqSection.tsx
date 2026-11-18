import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { EN_CONTENT } from '../data/i18n';
import { FAQS } from '../data/travelData';
import { AnimatedHeadline, RevealBlock } from './MotionPrimitives';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);
  const shouldReduceMotion = useReducedMotion();
  const { lang, t } = useLanguage();

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-16 md:py-24 border-t border-[#0B2A33]/8 dark:border-white/8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <RevealBlock>
          <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
            {t.faq.eyebrow}
          </p>
          <AnimatedHeadline
            text={t.faq.heading}
            as="h2"
            mode="word"
            className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
          />
        </RevealBlock>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openId === faq.id;
          const enFaq = EN_CONTENT.faqs[faq.id];
          const question = lang === 'en' && enFaq ? enFaq.question : faq.question;
          const answer = lang === 'en' && enFaq ? enFaq.answer : faq.answer;

          return (
            <RevealBlock key={faq.id} delay={0.05 * idx}>
              <div className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleToggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${faq.id}`}
                  id={`faq-trigger-${faq.id}`}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-[#0B2A33]/[0.02] dark:hover:bg-white/[0.03] transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F2B84B]"
                >
                  <span className="font-serif-display text-lg sm:text-xl font-semibold text-[#0B2A33] dark:text-white">
                    {question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-5 h-5 shrink-0 text-[#1F8A70] dark:text-[#F2B84B] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${faq.id}`}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base leading-[1.75] text-[#0B2A33]/78 dark:text-[#EDF4F3]/78 border-t border-[#0B2A33]/6 dark:border-white/8">
                        {answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </RevealBlock>
          );
        })}
      </div>
    </section>
  );
}
