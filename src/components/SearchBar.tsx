import React from 'react';
import { Calendar, Clock, Compass, MapPin, Search, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import {
  DURATION_FILTERS,
  DurationFilter,
  TOUR_CATEGORIES,
  TourCategory,
} from '../data/travelData';
import { MagneticButton, RevealBlock } from './MotionPrimitives';

export interface SearchFilterValues {
  destination: string;
  category: TourCategory;
  duration: DurationFilter;
  date: string;
  guests: string;
}

const CANONICAL_GUEST_VALUES = [
  '1 khách',
  '2 khách',
  '3–5 khách',
  '6+ khách (nhóm riêng)',
];

interface SearchBarProps {
  filters: SearchFilterValues;
  onChange: (next: SearchFilterValues) => void;
  onSubmit: () => void;
}

export function SearchBar({ filters, onChange, onSubmit }: SearchBarProps) {
  const { lang, t } = useLanguage();
  const { destinations, overriddenIds } = useSiteContent();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section
      id="search-bar"
      aria-label={t.search.submit}
      className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-14"
    >
      <RevealBlock yOffset={16}>
        <form
          onSubmit={handleFormSubmit}
          className="bg-white dark:bg-[#0D313B] rounded-2xl shadow-xl shadow-[#0B2A33]/10 dark:shadow-black/40 border border-[#0B2A33]/10 dark:border-white/10 p-4 sm:p-5 lg:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            {/* Điểm đến */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-destination"
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                <span>{t.search.destination}</span>
              </label>
              <select
                id="filter-destination"
                value={filters.destination}
                onChange={(e) => onChange({ ...filters, destination: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
              >
                <option value="Tất cả">
                  {t.search.allDestinations(destinations.length)}
                </option>
                {destinations.map((dest) => {
                  const displayName =
                    lang === 'en' && !overriddenIds.has(dest.id)
                      ? EN_CONTENT.destinations[dest.id]?.name || dest.name
                      : dest.name;
                  return (
                    <option key={dest.id} value={dest.name}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Kiểu chuyến đi */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-category"
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                <span>{t.search.category}</span>
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) =>
                  onChange({ ...filters, category: e.target.value as TourCategory })
                }
                className="w-full h-11 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
              >
                {TOUR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'Tất cả' ? t.search.allCategories : t.categories[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Thời lượng */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-duration"
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                <span>{t.search.duration}</span>
              </label>
              <select
                id="filter-duration"
                value={filters.duration}
                onChange={(e) =>
                  onChange({ ...filters, duration: e.target.value as DurationFilter })
                }
                className="w-full h-11 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
              >
                {DURATION_FILTERS.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur === 'Tất cả' ? t.search.allDurations : t.durations[dur]}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày khởi hành */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-date"
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                <span>{t.search.date}</span>
              </label>
              <input
                id="filter-date"
                type="date"
                min={today}
                value={filters.date}
                onChange={(e) => onChange({ ...filters, date: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
              />
            </div>

            {/* Số khách */}
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-guests"
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 mb-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#1F8A70] dark:text-[#F2B84B]" />
                <span>{t.search.guests}</span>
              </label>
              <select
                id="filter-guests"
                value={filters.guests}
                onChange={(e) => onChange({ ...filters, guests: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-[#EDF4F3] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
              >
                {CANONICAL_GUEST_VALUES.map((val, idx) => (
                  <option key={val} value={val}>
                    {t.search.guestOptions[idx] || val}
                  </option>
                ))}
              </select>
            </div>

            {/* Nút Tìm tour */}
            <div className="sm:col-span-2 lg:col-span-2">
              <MagneticButton
                type="submit"
                className="w-full h-11 px-4 rounded-xl bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-[#f6c96c] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
              >
                <Search className="w-4 h-4" />
                <span>{t.search.submit}</span>
              </MagneticButton>
            </div>
          </div>
        </form>
      </RevealBlock>
    </section>
  );
}
