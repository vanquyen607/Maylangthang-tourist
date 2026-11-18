import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import {
  DestinationItem,
  REGION_ZONES,
  RegionZone,
} from '../data/travelData';
import { AnimatedHeadline, EditorialImage, RevealBlock } from './MotionPrimitives';
import { VietnamMap } from './VietnamMap';

interface DestinationsSectionProps {
  onSelectDestination: (destinationName: string) => void;
}

export function DestinationsSection({ onSelectDestination }: DestinationsSectionProps) {
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const [selectedZone, setSelectedZone] = useState<RegionZone>('Tất cả');
  const { lang, t } = useLanguage();
  const { destinations, overriddenIds } = useSiteContent();

  const filteredDestinations = useMemo(() => {
    if (selectedZone === 'Tất cả') return destinations;
    return destinations.filter((d) => d.zone === selectedZone);
  }, [selectedZone, destinations]);

  const scrollByCard = (direction: 'prev' | 'next') => {
    if (!scrollTrackRef.current) return;
    const distance = direction === 'next' ? 360 : -360;
    scrollTrackRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handleZoneChange = (zone: RegionZone) => {
    setSelectedZone(zone);
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="destinations"
      aria-labelledby="destinations-heading"
      className="py-16 md:py-24 border-t border-[#0B2A33]/8 dark:border-white/8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="lg:max-w-lg xl:max-w-xl min-w-0">
            <RevealBlock>
              <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
                {t.destinations.eyebrow}
              </p>
              <AnimatedHeadline
                text={t.destinations.heading}
                as="h2"
                mode="word"
                className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
              />
            </RevealBlock>
          </div>

          {/* Bộ lọc theo vùng miền + nút cuộn trái/phải */}
          <RevealBlock
            delay={0.1}
            className="flex items-center justify-between sm:justify-end gap-3 shrink-0 max-w-full"
          >
            <div
              role="tablist"
              aria-label={t.destinations.eyebrow}
              className="inline-flex flex-nowrap items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 max-w-full overflow-x-auto no-scrollbar"
            >
              {REGION_ZONES.map((zone) => {
                const active = selectedZone === zone;
                return (
                  <button
                    key={zone}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => handleZoneChange(zone)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
                      active
                        ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                        : 'text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white'
                    }`}
                  >
                    {t.zones[zone]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => scrollByCard('prev')}
                aria-label={t.destinations.prevAria}
                className="w-10 h-10 rounded-full border border-[#0B2A33]/20 dark:border-white/20 flex items-center justify-center text-[#0B2A33] dark:text-[#EDF4F3] hover:bg-[#0B2A33] hover:text-white dark:hover:bg-[#F2B84B] dark:hover:text-[#06181E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard('next')}
                aria-label={t.destinations.nextAria}
                className="w-10 h-10 rounded-full border border-[#0B2A33]/20 dark:border-white/20 flex items-center justify-center text-[#0B2A33] dark:text-[#EDF4F3] hover:bg-[#0B2A33] hover:text-white dark:hover:bg-[#F2B84B] dark:hover:text-[#06181E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </RevealBlock>
        </div>

        {/* Dải thẻ cuộn ngang */}
        <div
          ref={scrollTrackRef}
          role="region"
          aria-label={t.destinations.eyebrow}
          tabIndex={0}
          className="flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 focus-visible:outline-2 focus-visible:outline-[#F2B84B] rounded-xl"
        >
          {filteredDestinations.map((dest: DestinationItem, idx: number) => {
            const enDest =
              lang === 'en' && !overriddenIds.has(dest.id)
                ? EN_CONTENT.destinations[dest.id]
                : undefined;
            const displayName = enDest ? enDest.name : dest.name;
            const displayRegion = enDest ? enDest.region : dest.region;
            const displayTagline = enDest ? enDest.tagline : dest.tagline;

            return (
              <RevealBlock
                key={dest.id}
                delay={0.04 * idx}
                yOffset={20}
                className="snap-start shrink-0 w-[76vw] sm:w-[46vw] md:w-[31vw] lg:w-[270px] xl:w-[288px]"
              >
                <button
                  type="button"
                  onClick={() => onSelectDestination(dest.name)}
                  aria-label={`${t.destinations.viewToursAt(displayName)} (${displayRegion})`}
                  className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-xl hover:shadow-[#0B2A33]/15 dark:hover:shadow-black/50 transition-all duration-500 ease-out hover:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B]"
                >
                  <EditorialImage
                    src={dest.image}
                    alt={dest.alt}
                    fallbackTitle={displayName}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#06181E]/92 via-[#06181E]/30 to-transparent"
                  />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                    <p className="text-xs font-medium tracking-wide text-[#F2B84B] mb-1">
                      {displayRegion}
                    </p>
                    <h3 className="font-serif-display text-2xl sm:text-[1.7rem] font-semibold leading-tight mb-1.5">
                      {displayName}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/82 line-clamp-2 leading-relaxed">
                      {displayTagline}
                    </p>
                  </div>
                </button>
              </RevealBlock>
            );
          })}
        </div>

        {/* Bản đồ tương tác Việt Nam bằng D3 & SVG */}
        <VietnamMap
          selectedZone={selectedZone}
          onZoneChange={handleZoneChange}
          onSelectDestination={onSelectDestination}
        />
      </div>
    </section>
  );
}
