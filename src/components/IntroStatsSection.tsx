import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EN_CONTENT } from '../data/i18n';
import { STATS } from '../data/travelData';
import { AnimatedCounter, AnimatedHeadline, RevealBlock } from './MotionPrimitives';

export function IntroStatsSection() {
  const { lang, t } = useLanguage();

  return (
    <section
      id="intro"
      aria-labelledby="intro-heading"
      className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <RevealBlock>
            <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-4">
              {t.intro.eyebrow}
            </p>
            <AnimatedHeadline
              text={t.intro.heading}
              as="h2"
              mode="word"
              className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
            />
          </RevealBlock>
        </div>

        <div className="lg:col-span-7 space-y-5 text-base sm:text-[17px] leading-[1.75] text-[#0B2A33]/80 dark:text-[#EDF4F3]/80">
          <RevealBlock delay={0.1}>
            <p>{t.intro.p1}</p>
          </RevealBlock>
          <RevealBlock delay={0.2}>
            <p>{t.intro.p2}</p>
          </RevealBlock>
        </div>
      </div>

      {/* Dải 4 số liệu đếm tăng dần */}
      <div className="mt-16 pt-12 border-t border-[#0B2A33]/12 dark:border-white/12 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {STATS.map((stat, idx) => {
          const enStat = EN_CONTENT.stats[stat.id as keyof typeof EN_CONTENT.stats];
          const label = lang === 'en' && enStat ? enStat.label : stat.label;
          const detail = lang === 'en' && enStat ? enStat.detail : stat.detail;

          return (
            <RevealBlock key={stat.id} delay={0.08 * idx} yOffset={18}>
              <div className="space-y-2">
                <div className="font-serif-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#0B2A33] dark:text-white">
                  <AnimatedCounter
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    locale={lang === 'en' ? 'en-US' : 'vi-VN'}
                  />
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#1F8A70] dark:text-[#F2B84B]">
                  {label}
                </p>
                <p className="text-xs sm:text-sm leading-relaxed text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                  {detail}
                </p>
              </div>
            </RevealBlock>
          );
        })}
      </div>
    </section>
  );
}
