import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { EN_CONTENT } from '../data/i18n';
import { PROCESS_STEPS } from '../data/travelData';
import { AnimatedHeadline, RevealBlock } from './MotionPrimitives';

export function BookingProcessSection() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { lang, t } = useLanguage();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 72%', 'end 68%'],
  });

  const lineScaleY = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="py-16 md:py-22 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Cột tiêu đề dính nhẹ bên trái trên màn hình lớn */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <RevealBlock>
            <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
              {t.process.eyebrow}
            </p>
            <AnimatedHeadline
              text={t.process.heading}
              as="h2"
              mode="word"
              className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance] mb-5"
            />
            <p className="text-base leading-relaxed text-[#0B2A33]/75 dark:text-[#EDF4F3]/75">
              {t.process.subtitle}
            </p>
          </RevealBlock>
        </div>

        {/* Timeline dọc với đường kẻ tự lấp đầy theo thao tác cuộn */}
        <div ref={timelineRef} className="lg:col-span-7 relative pl-8 sm:pl-12">
          {/* Đường nền xám mảnh */}
          <div
            aria-hidden="true"
            className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-[#0B2A33]/12 dark:bg-white/12 rounded-full"
          />

          {/* Đường kẻ tiến trình tự lấp đầy khi cuộn */}
          <motion.div
            aria-hidden="true"
            style={
              shouldReduceMotion
                ? { scaleY: 1 }
                : { scaleY: lineScaleY }
            }
            className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] origin-top bg-gradient-to-b from-[#1F8A70] via-[#F2B84B] to-[#E8708A] rounded-full will-change-transform"
          />

          <ol className="space-y-10 md:space-y-12">
            {PROCESS_STEPS.map((item, idx) => {
              const enStep = EN_CONTENT.process[idx];
              const title = lang === 'en' && enStep ? enStep.title : item.title;
              const description = lang === 'en' && enStep ? enStep.description : item.description;
              const note = lang === 'en' && enStep ? enStep.note : item.note;

              return (
                <li key={item.step} className="relative">
                  {/* Điểm mốc trên trục timeline */}
                  <span
                    aria-hidden="true"
                    className="absolute -left-8 sm:-left-12 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F1F7F6] dark:bg-[#06181E] border-2 border-[#1F8A70] dark:border-[#F2B84B] flex items-center justify-center text-[11px] sm:text-xs font-semibold text-[#0B2A33] dark:text-[#F2B84B] tabular-nums"
                  >
                    {item.step}
                  </span>

                  <RevealBlock delay={0.07 * idx}>
                    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10">
                      <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#0B2A33] dark:text-white mb-2.5">
                        {title}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-[#0B2A33]/78 dark:text-[#EDF4F3]/78 mb-3">
                        {description}
                      </p>
                      <p className="text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B]">
                        {note}
                      </p>
                    </div>
                  </RevealBlock>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
