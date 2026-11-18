import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, Star, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT, Language } from '../data/i18n';
import {
  DURATION_FILTERS,
  DurationFilter,
  TOUR_ADDONS,
  TOUR_CATEGORIES,
  TourCategory,
  TourItem,
} from '../data/travelData';
import {
  AnimatedHeadline,
  EditorialImage,
  MagneticButton,
  RevealBlock,
} from './MotionPrimitives';
import { SearchFilterValues } from './SearchBar';

interface ToursSectionProps {
  tours: TourItem[];
  filters: SearchFilterValues;
  onCategoryChange: (cat: TourCategory) => void;
  onDestinationChange: (destination: string) => void;
  onDurationChange: (dur: DurationFilter) => void;
  onResetFilters: () => void;
  onBookTour: (
    tour: TourItem,
    customSelection?: {
      packageId: string;
      packageLabel: string;
      addons: string[];
      totalPrice: number;
    }
  ) => void;
}

function formatPriceVND(price: number, lang: Language): string {
  return price.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') + '₫';
}

const INITIAL_VISIBLE_COUNT = 6;

export function ToursSection({
  tours,
  filters,
  onCategoryChange,
  onDestinationChange,
  onDurationChange,
  onResetFilters,
  onBookTour,
}: ToursSectionProps) {
  const [selectedTourDetail, setSelectedTourDetail] = useState<TourItem | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('local-standard');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [showAllTours, setShowAllTours] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();
  const { lang, t } = useLanguage();
  const { destinations, overriddenIds } = useSiteContent();

  const destNameMap = useMemo(() => {
    const map = new Map<string, string>();
    destinations.forEach((d) => {
      const en =
        lang === 'en' && !overriddenIds.has(d.id)
          ? EN_CONTENT.destinations[d.id]
          : undefined;
      map.set(d.name, en ? en.name : d.name);
    });
    return map;
  }, [lang, destinations, overriddenIds]);

  const openTourModal = (tour: TourItem) => {
    setSelectedTourDetail(tour);
    setSelectedPackageId(tour.packages[0]?.id || 'local-standard');
    setSelectedAddonIds([]);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const modalPricing = useMemo(() => {
    if (!selectedTourDetail) {
      return {
        total: 0,
        packageId: 'local-standard',
        packageLabel: '',
        addonLabels: [] as string[],
      };
    }
    const chosenPackage =
      selectedTourDetail.packages.find((p) => p.id === selectedPackageId) ||
      selectedTourDetail.packages[0];
    const enPkg =
      chosenPackage && !overriddenIds.has(selectedTourDetail.id)
        ? EN_CONTENT.packages[chosenPackage.id]
        : undefined;
    const packageLabel =
      lang === 'en' && enPkg ? enPkg.label : chosenPackage?.label || 'Gói Bản Địa';

    const chosenAddons = TOUR_ADDONS.filter((a) => selectedAddonIds.includes(a.id));
    const addonsSum = chosenAddons.reduce((sum, a) => sum + a.price, 0);

    return {
      total: selectedTourDetail.price + (chosenPackage?.priceDelta || 0) + addonsSum,
      packageId: chosenPackage?.id || 'local-standard',
      packageLabel,
      addonLabels: chosenAddons.map((a) =>
        lang === 'en' && EN_CONTENT.addons[a.id] ? EN_CONTENT.addons[a.id] : a.label
      ),
    };
  }, [selectedTourDetail, selectedPackageId, selectedAddonIds, lang, overriddenIds]);

  const hasActiveFilter =
    filters.destination !== 'Tất cả' ||
    filters.category !== 'Tất cả' ||
    filters.duration !== 'Tất cả' ||
    filters.date !== '';

  const getLocalizedTour = (tour: TourItem) => {
    const enTour =
      lang === 'en' && !overriddenIds.has(tour.id)
        ? EN_CONTENT.tours[tour.id]
        : undefined;
    return {
      title: enTour ? enTour.title : tour.title,
      description: enTour ? enTour.description : tour.description,
      departureInfo: enTour ? enTour.departureInfo : tour.departureInfo,
      groupSize: enTour ? enTour.groupSize : tour.groupSize,
      highlights: enTour ? enTour.highlights : tour.highlights,
      destinationName: destNameMap.get(tour.destination) || tour.destination,
      categoryLabel: t.categories[tour.category],
      durationLabel: t.durations[tour.duration],
    };
  };

  const visibleTours = useMemo(() => {
    if (hasActiveFilter || showAllTours || tours.length <= INITIAL_VISIBLE_COUNT) {
      return tours;
    }
    return tours.slice(0, INITIAL_VISIBLE_COUNT);
  }, [tours, hasActiveFilter, showAllTours]);

  const canToggleList = !hasActiveFilter && tours.length > INITIAL_VISIBLE_COUNT;

  return (
    <section
      id="tours"
      aria-labelledby="tours-heading"
      className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="lg:max-w-lg xl:max-w-xl min-w-0">
          <RevealBlock>
            <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
              {t.tours.eyebrow}
            </p>
            <AnimatedHeadline
              text={t.tours.heading}
              as="h2"
              mode="word"
              className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
            />
          </RevealBlock>
        </div>

        {/* Tab lọc theo loại hình */}
        <RevealBlock delay={0.1} className="shrink-0 max-w-full">
          <div
            role="tablist"
            aria-label={t.tours.eyebrow}
            className="inline-flex flex-nowrap items-center gap-1 p-1.5 rounded-xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 max-w-full overflow-x-auto no-scrollbar"
          >
            {TOUR_CATEGORIES.map((category) => {
              const active = filters.category === category;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
                    active
                      ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                      : 'text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white hover:bg-[#0B2A33]/5 dark:hover:bg-white/8'
                  }`}
                >
                  {t.categories[category]}
                </button>
              );
            })}
          </div>
        </RevealBlock>
      </div>

      {/* Thanh chọn nhanh điểm đến & thời lượng ngay phía trên danh sách tour */}
      <RevealBlock delay={0.12} className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.tours.quickOptions}</span>
          </span>

          <select
            aria-label={t.search.destination}
            value={filters.destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/12 text-xs font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
          >
            <option value="Tất cả">{t.tours.allLocations(destinations.length)}</option>
            {destinations.map((d) => {
              const displayName =
                lang === 'en' && !overriddenIds.has(d.id) && EN_CONTENT.destinations[d.id]
                  ? EN_CONTENT.destinations[d.id].name
                  : d.name;
              return (
                <option key={d.id} value={d.name}>
                  {displayName} ({t.zones[d.zone]})
                </option>
              );
            })}
          </select>

          <div
            role="group"
            aria-label={t.search.duration}
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/12"
          >
            {DURATION_FILTERS.map((dur) => {
              const active = filters.duration === dur;
              return (
                <button
                  key={dur}
                  type="button"
                  onClick={() => onDurationChange(dur)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#1F8A70] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                      : 'text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 hover:text-[#0B2A33] dark:hover:text-white'
                  }`}
                >
                  {dur === 'Tất cả' ? t.tours.anyDuration : t.durations[dur]}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F8A70] dark:text-[#F2B84B] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.tours.clearFilters(tours.length)}</span>
          </button>
        )}
      </RevealBlock>

      {/* Lưới thẻ tour */}
      {tours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleTours.map((tour, idx) => {
              const loc = getLocalizedTour(tour);
              return (
                <RevealBlock key={tour.id} delay={0.05 * (idx % 3)}>
                  <article className="group h-full flex flex-col bg-white dark:bg-[#0D313B] rounded-2xl overflow-hidden border border-[#0B2A33]/10 dark:border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0B2A33]/10 dark:hover:shadow-black/40">
                    <button
                      type="button"
                      onClick={() => openTourModal(tour)}
                      aria-label={`${t.tours.choosePackage}: ${loc.title}`}
                      className="relative aspect-[4/3] w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F2B84B]"
                    >
                      <EditorialImage
                        src={tour.image}
                        alt={tour.alt}
                        fallbackTitle={loc.title}
                        className="w-full h-full"
                        imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[#06181E]/75 via-[#06181E]/15 to-transparent"
                      />
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-white/95 font-medium">
                        <span>{loc.groupSize}</span>
                        <span className="underline underline-offset-4 decoration-white/60 group-hover:decoration-[#F2B84B]">
                          {t.tours.optionsTag(tour.packages.length)}
                        </span>
                      </div>
                    </button>

                    <div className="flex-1 p-5 sm:p-6 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mb-2.5">
                        <span>{loc.categoryLabel}</span>
                        <span aria-hidden="true" className="text-[#0B2A33]/30 dark:text-white/30">
                          ·
                        </span>
                        <span>{loc.destinationName}</span>
                        <span aria-hidden="true" className="text-[#0B2A33]/30 dark:text-white/30">
                          ·
                        </span>
                        <span>{loc.durationLabel}</span>
                      </div>

                      <h3 className="font-serif-display text-xl sm:text-[1.32rem] font-semibold leading-snug text-[#0B2A33] dark:text-white mb-2.5">
                        <button
                          type="button"
                          onClick={() => openTourModal(tour)}
                          className="text-left hover:text-[#1F8A70] dark:hover:text-[#F2B84B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] rounded"
                        >
                          {loc.title}
                        </button>
                      </h3>

                      <p className="text-sm leading-relaxed text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mb-5 flex-1">
                        {loc.description}
                      </p>

                      <div className="pt-4 border-t border-[#0B2A33]/10 dark:border-white/10 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mb-1 tabular-nums">
                            <Star
                              className="w-3.5 h-3.5 fill-[#F2B84B] text-[#F2B84B]"
                              aria-hidden="true"
                            />
                            <span className="font-semibold text-[#0B2A33] dark:text-white">
                              {lang === 'en'
                                ? tour.rating.toFixed(1)
                                : tour.rating.toFixed(1).replace('.', ',')}
                            </span>
                            <span>({tour.reviewCount})</span>
                          </div>
                          <div className="font-serif-display text-lg sm:text-xl font-semibold text-[#0B2A33] dark:text-white tabular-nums">
                            {formatPriceVND(tour.price, lang)}
                            <span className="font-sans text-xs font-normal text-[#0B2A33]/60 dark:text-[#EDF4F3]/60">
                              {' '}
                              {t.destinations.perGuest}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openTourModal(tour)}
                            className="px-3 py-2 rounded-full border border-[#0B2A33]/15 dark:border-white/20 text-xs font-medium text-[#0B2A33] dark:text-[#EDF4F3] hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors whitespace-nowrap"
                          >
                            {t.tours.choosePackage}
                          </button>
                          <MagneticButton
                            onClick={() => onBookTour(tour)}
                            className="px-4 py-2.5 rounded-full bg-[#0B2A33] text-white hover:bg-[#1F8A70] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
                          >
                            {t.tours.bookThisTour}
                          </MagneticButton>
                        </div>
                      </div>
                    </div>
                  </article>
                </RevealBlock>
              );
            })}
          </div>

          {canToggleList && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllTours((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#0D313B] border border-[#0B2A33]/15 dark:border-white/15 text-sm font-semibold text-[#0B2A33] dark:text-white hover:border-[#1F8A70] hover:text-[#1F8A70] dark:hover:border-[#F2B84B] dark:hover:text-[#F2B84B] transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
              >
                <span>
                  {showAllTours
                    ? t.tours.showLess
                    : t.tours.showMore(tours.length - INITIAL_VISIBLE_COUNT, tours.length)}
                </span>
                {showAllTours ? (
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10">
          <p className="font-serif-display text-2xl font-semibold text-[#0B2A33] dark:text-white mb-2">
            {t.tours.emptyTitle}
          </p>
          <p className="text-sm text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-6 max-w-md mx-auto">
            {t.tours.emptyDesc}
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-6 py-2.5 rounded-full bg-[#1F8A70] text-white text-sm font-semibold hover:bg-[#0B2A33] transition-colors"
          >
            {t.tours.showAllTours}
          </button>
        </div>
      )}

      {/* Modal xem điểm nhấn & tùy chọn gói lưu trú + dịch vụ đi kèm */}
      <AnimatePresence>
        {selectedTourDetail && (() => {
          const modalLoc = getLocalizedTour(selectedTourDetail);
          return (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-tour-title"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedTourDetail(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06181E]/75 backdrop-blur-sm"
            >
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F1F7F6] dark:bg-[#0B2A33] text-[#0B2A33] dark:text-[#EDF4F3] border border-[#0B2A33]/15 dark:border-white/15 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTourDetail(null)}
                  aria-label={t.tours.closeModal}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#06181E]/65 text-white flex items-center justify-center hover:bg-[#06181E] transition-colors focus-visible:outline-2 focus-visible:outline-[#F2B84B]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="aspect-[16/9] w-full">
                  <EditorialImage
                    src={selectedTourDetail.image}
                    alt={selectedTourDetail.alt}
                    fallbackTitle={modalLoc.title}
                    className="w-full h-full"
                  />
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mb-2">
                      <span>{modalLoc.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.destinationName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.durationLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.groupSize}</span>
                    </div>

                    <h3
                      id="modal-tour-title"
                      className="font-serif-display text-2xl sm:text-3xl font-semibold mb-3"
                    >
                      {modalLoc.title}
                    </h3>

                    <p className="text-sm sm:text-base leading-relaxed text-[#0B2A33]/80 dark:text-[#EDF4F3]/80">
                      {modalLoc.description}
                    </p>
                  </div>

                  {/* Điểm nhấn */}
                  <div className="pt-5 border-t border-[#0B2A33]/10 dark:border-white/10">
                    <p className="text-sm font-semibold mb-3">{t.tours.highlightsTitle}</p>
                    <ul className="space-y-2 text-sm text-[#0B2A33]/85 dark:text-[#EDF4F3]/85">
                      {modalLoc.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-[#1F8A70] dark:text-[#F2B84B] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                      {modalLoc.departureInfo}
                    </p>
                  </div>

                  {/* Chọn gói lưu trú & hình thức đi */}
                  <div className="pt-5 border-t border-[#0B2A33]/10 dark:border-white/10">
                    <p className="text-sm font-semibold mb-3">{t.tours.step1Title}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {selectedTourDetail.packages.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        const enPkg =
                          !overriddenIds.has(selectedTourDetail.id)
                            ? EN_CONTENT.packages[pkg.id]
                            : undefined;
                        const pkgLabel = lang === 'en' && enPkg ? enPkg.label : pkg.label;
                        const pkgSummary = lang === 'en' && enPkg ? enPkg.summary : pkg.summary;

                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-3.5 rounded-xl text-left border transition-colors ${
                              active
                                ? 'bg-[#0B2A33] text-white border-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:border-[#F2B84B]'
                                : 'bg-white dark:bg-[#06181E] border-[#0B2A33]/12 dark:border-white/12 hover:border-[#1F8A70]'
                            }`}
                          >
                            <div className="text-sm font-semibold mb-1">{pkgLabel}</div>
                            <div
                              className={`text-xs leading-snug mb-2 ${
                                active ? 'opacity-85' : 'text-[#0B2A33]/65 dark:text-[#EDF4F3]/65'
                              }`}
                            >
                              {pkgSummary}
                            </div>
                            <div className="text-xs font-semibold tabular-nums">
                              {pkg.priceDelta === 0
                                ? t.tours.standardPrice
                                : `+${formatPriceVND(pkg.priceDelta, lang)}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dịch vụ chọn thêm */}
                  <div className="pt-5 border-t border-[#0B2A33]/10 dark:border-white/10">
                    <p className="text-sm font-semibold mb-3">{t.tours.step2Title}</p>
                    <div className="space-y-2">
                      {TOUR_ADDONS.map((addon) => {
                        const checked = selectedAddonIds.includes(addon.id);
                        const addonLabel =
                          lang === 'en' && EN_CONTENT.addons[addon.id]
                            ? EN_CONTENT.addons[addon.id]
                            : addon.label;
                        return (
                          <label
                            key={addon.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#06181E] border border-[#0B2A33]/10 dark:border-white/10 cursor-pointer text-sm"
                          >
                            <span className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAddon(addon.id)}
                                className="w-4 h-4 accent-[#1F8A70] dark:accent-[#F2B84B] rounded"
                              />
                              <span>{addonLabel}</span>
                            </span>
                            <span className="text-xs font-semibold text-[#1F8A70] dark:text-[#F2B84B] tabular-nums whitespace-nowrap">
                              +{formatPriceVND(addon.price, lang)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thanh tổng giá & đặt tour */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#0B2A33]/10 dark:border-white/10">
                    <div>
                      <span className="block text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                        {t.tours.estimateLabel(modalPricing.packageLabel)}
                      </span>
                      <span className="font-serif-display text-2xl font-semibold tabular-nums">
                        {formatPriceVND(modalPricing.total, lang)} {t.destinations.perGuest}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const chosen = selectedTourDetail;
                        const selection = {
                          packageId: modalPricing.packageId,
                          packageLabel: modalPricing.packageLabel,
                          addons: modalPricing.addonLabels,
                          totalPrice: modalPricing.total,
                        };
                        setSelectedTourDetail(null);
                        onBookTour(chosen, selection);
                      }}
                      className="px-6 py-3 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white font-semibold text-sm transition-colors"
                    >
                      {t.tours.bookSelectedBtn}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
