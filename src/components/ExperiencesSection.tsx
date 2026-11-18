import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import { ExperienceItem } from '../data/travelData';
import { AnimatedHeadline, EditorialImage, RevealBlock } from './MotionPrimitives';

interface ExperiencesSectionProps {
  onSelectExperience: (exp: ExperienceItem) => void;
}

export function ExperiencesSection({ onSelectExperience }: ExperiencesSectionProps) {
  const { lang, t } = useLanguage();
  const { experiences, overriddenIds } = useSiteContent();

  return (
    <section
      id="experiences"
      aria-labelledby="experiences-heading"
      className="py-16 md:py-22 bg-[#0B2A33] text-[#F1F7F6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-12 md:mb-14">
          <div className="lg:col-span-7">
            <RevealBlock>
              <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#F2B84B] mb-3">
                {t.experiences.eyebrow}
              </p>
              <AnimatedHeadline
                text={t.experiences.heading}
                as="h2"
                mode="word"
                className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-white [text-wrap:balance]"
              />
            </RevealBlock>
          </div>
          <div className="lg:col-span-5">
            <RevealBlock delay={0.1}>
              <p className="text-sm sm:text-base leading-relaxed text-[#F1F7F6]/78">
                {t.experiences.subtitle}
              </p>
            </RevealBlock>
          </div>
        </div>

        {/* Lưới trải nghiệm trên nền xanh đậm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, idx) => {
            const enExp =
              lang === 'en' && !overriddenIds.has(exp.id)
                ? EN_CONTENT.experiences[exp.id]
                : undefined;
            const title = enExp ? enExp.title : exp.title;
            const location = enExp ? enExp.location : exp.location;
            const duration = enExp ? enExp.duration : exp.duration;
            const description = enExp ? enExp.description : exp.description;

            return (
              <RevealBlock key={exp.id} delay={0.05 * (idx % 3)}>
                <article className="group h-full flex flex-col rounded-2xl overflow-hidden bg-[#0F3540] border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#F2B84B]/45">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <EditorialImage
                      src={exp.image}
                      alt={exp.alt}
                      fallbackTitle={title}
                      className="w-full h-full"
                      imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0F3540] via-[#0F3540]/20 to-transparent"
                    />
                    <span className="absolute top-4 left-4 font-serif-display text-lg font-semibold text-[#F2B84B] drop-shadow">
                      {exp.index}
                    </span>
                  </div>

                  <div className="flex-1 p-5 sm:p-6 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-[#F2B84B] font-medium mb-2">
                      <span>{location}</span>
                      <span aria-hidden="true" className="text-white/35">
                        ·
                      </span>
                      <span>{duration}</span>
                    </div>

                    <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-white mb-2.5">
                      {title}
                    </h3>

                    <p className="text-sm leading-relaxed text-[#F1F7F6]/78 mb-5 flex-1">
                      {description}
                    </p>

                    <button
                      type="button"
                      onClick={() => onSelectExperience(exp)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#F2B84B] hover:text-white transition-colors self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B] rounded"
                    >
                      <span>{t.experiences.addToBooking}</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </article>
              </RevealBlock>
            );
          })}
        </div>
      </div>
    </section>
  );
}
