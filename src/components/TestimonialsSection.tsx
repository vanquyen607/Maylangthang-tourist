import React from 'react';
import { Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EN_CONTENT } from '../data/i18n';
import { TESTIMONIALS } from '../data/travelData';
import { AnimatedHeadline, RevealBlock } from './MotionPrimitives';

export function TestimonialsSection() {
  const { lang, t } = useLanguage();

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="py-16 md:py-24 border-t border-[#0B2A33]/8 dark:border-white/8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <RevealBlock>
            <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
              {t.testimonials.eyebrow}
            </p>
            <AnimatedHeadline
              text={t.testimonials.heading}
              as="h2"
              mode="word"
              className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
            />
          </RevealBlock>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((item, idx) => {
            const enItem = EN_CONTENT.testimonials[item.id];
            const city = lang === 'en' && enItem ? enItem.city : item.city;
            const tourName = lang === 'en' && enItem ? enItem.tourName : item.tourName;
            const travelDate = lang === 'en' && enItem ? enItem.travelDate : item.travelDate;
            const quote = lang === 'en' && enItem ? enItem.quote : item.quote;

            return (
              <RevealBlock key={item.id} delay={0.08 * idx}>
                <figure className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10">
                  <div>
                    <Quote
                      className="w-6 h-6 text-[#E8708A] mb-4 opacity-85"
                      aria-hidden="true"
                    />
                    <blockquote className="text-sm sm:text-[15px] leading-[1.75] text-[#0B2A33]/85 dark:text-[#EDF4F3]/85 mb-6">
                      “{quote}”
                    </blockquote>
                  </div>

                  <figcaption className="pt-5 border-t border-[#0B2A33]/10 dark:border-white/10">
                    <p className="font-serif-display text-lg font-semibold text-[#0B2A33] dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 mt-0.5">
                      {city} <span aria-hidden="true">·</span> {travelDate}
                    </p>
                    <p className="text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mt-1.5">
                      {t.testimonials.traveledLabel} {tourName}
                    </p>
                  </figcaption>
                </figure>
              </RevealBlock>
            );
          })}
        </div>
      </div>
    </section>
  );
}
