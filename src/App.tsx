import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingFormSection } from './components/BookingFormSection';
import { BookingProcessSection } from './components/BookingProcessSection';
import { DestinationsSection } from './components/DestinationsSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExperiencesSection } from './components/ExperiencesSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { IntroStatsSection } from './components/IntroStatsSection';
import { JournalSection } from './components/JournalSection';
import { ScrollProgressBar } from './components/MotionPrimitives';
import { Navbar } from './components/Navbar';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { SearchBar, SearchFilterValues } from './components/SearchBar';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ToursSection } from './components/ToursSection';
import { TravelChatbot } from './components/TravelChatbot';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SiteContentProvider, useSiteContent } from './context/SiteContentContext';
import { EN_CONTENT } from './data/i18n';
import {
  DEFAULT_TOUR_PACKAGES,
  DurationFilter,
  ExperienceItem,
  TourCategory,
  TourItem,
} from './data/travelData';

const INITIAL_FILTERS: SearchFilterValues = {
  destination: 'Tất cả',
  category: 'Tất cả',
  duration: 'Tất cả',
  date: '',
  guests: '2 khách',
};

function AppContent() {
  const { lang } = useLanguage();
  const { tours, overriddenIds } = useSiteContent();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = window.localStorage.getItem('mlt-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  const [viewMode, setViewMode] = useState<'home' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'home';
    return window.location.hash === '#/admin' || window.location.hash === '#admin'
      ? 'admin'
      : 'home';
  });
  const [filters, setFilters] = useState<SearchFilterValues>(INITIAL_FILTERS);
  const [selectedTourId, setSelectedTourId] = useState<string>(tours[0]?.id || 'custom-private');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    DEFAULT_TOUR_PACKAGES[0].id
  );
  const [prefilledNote, setPrefilledNote] = useState<string>('');
  const bookingNameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const syncHash = () => {
      const isAdminHash =
        window.location.hash === '#/admin' || window.location.hash === '#admin';
      setViewMode(isAdminHash ? 'admin' : 'home');
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      window.localStorage.setItem('mlt-theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('mlt-theme', 'light');
    }
  }, [isDark]);

  const openAdminPortal = () => {
    window.location.hash = '#/admin';
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeAdminPortal = () => {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search
    );
    setViewMode('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Lọc danh sách tour theo điểm đến, loại hình & thời lượng
  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchDestination =
        filters.destination === 'Tất cả' || tour.destination === filters.destination;
      const matchCategory =
        filters.category === 'Tất cả' || tour.category === filters.category;
      const matchDuration =
        filters.duration === 'Tất cả' || tour.duration === filters.duration;
      return matchDestination && matchCategory && matchDuration;
    });
  }, [tours, filters.destination, filters.category, filters.duration]);

  const handleSearchSubmit = () => {
    scrollToSection('tours');
  };

  const handleSelectDestination = (destinationName: string) => {
    setFilters((prev) => ({
      ...prev,
      destination: destinationName,
      category: 'Tất cả',
      duration: 'Tất cả',
    }));
    scrollToSection('tours');
  };

  const handleCategoryChange = (category: TourCategory) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleDestinationChange = (destination: string) => {
    setFilters((prev) => ({ ...prev, destination }));
  };

  const handleDurationChange = (duration: DurationFilter) => {
    setFilters((prev) => ({ ...prev, duration }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleBookTour = (
    tour: TourItem,
    customSelection?: {
      packageId: string;
      packageLabel: string;
      addons: string[];
      totalPrice: number;
    }
  ) => {
    setSelectedTourId(tour.id);
    if (customSelection) {
      setSelectedPackageId(customSelection.packageId);
    }

    const notes: string[] = [];
    if (filters.date) {
      notes.push(
        lang === 'en'
          ? `Preferred date: ${filters.date}`
          : `Ngày dự kiến: ${filters.date}`
      );
    }
    if (filters.guests) {
      const guestValues = [
        '1 khách',
        '2 khách',
        '3–5 khách',
        '6+ khách (nhóm riêng)',
      ];
      const guestIdx = guestValues.indexOf(filters.guests);
      const localizedGuests =
        guestIdx >= 0
          ? (lang === 'en'
              ? ['1 guest', '2 guests', '3–5 guests', '6+ guests (private)'][guestIdx]
              : filters.guests)
          : filters.guests;
      notes.push(
        lang === 'en'
          ? `Group size: ${localizedGuests}`
          : `Số khách dự kiến: ${localizedGuests}`
      );
    }
    if (customSelection) {
      notes.push(
        lang === 'en'
          ? `Selected tier: ${customSelection.packageLabel}`
          : `Gói đã chọn: ${customSelection.packageLabel}`
      );
      if (customSelection.addons.length > 0) {
        notes.push(
          lang === 'en'
            ? `Add-ons: ${customSelection.addons.join(', ')}`
            : `Chọn thêm: ${customSelection.addons.join(', ')}`
        );
      }
      const priceText = customSelection.totalPrice.toLocaleString(
        lang === 'en' ? 'en-US' : 'vi-VN'
      );
      notes.push(
        lang === 'en'
          ? `Estimate: ${priceText}₫/guest`
          : `Tạm tính: ${priceText}₫/khách`
      );
    }
    if (notes.length > 0) {
      setPrefilledNote(notes.join(' · '));
    }

    scrollToSection('booking');
    window.setTimeout(() => {
      bookingNameInputRef.current?.focus({ preventScroll: true });
    }, 650);
  };

  const handleSelectExperience = (exp: ExperienceItem) => {
    setSelectedTourId('custom-private');
    const enExp =
      lang === 'en' && !overriddenIds.has(exp.id)
        ? EN_CONTENT.experiences[exp.id]
        : undefined;
    const title = enExp ? enExp.title : exp.title;
    const location = enExp ? enExp.location : exp.location;
    const duration = enExp ? enExp.duration : exp.duration;

    setPrefilledNote(
      lang === 'en'
        ? `Interested in experience: ${title} (${location} · ${duration}).`
        : `Quan tâm trải nghiệm: ${title} (${location} · ${duration}).`
    );
    scrollToSection('booking');
    window.setTimeout(() => {
      bookingNameInputRef.current?.focus({ preventScroll: true });
    }, 650);
  };

  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onBackHome={closeAdminPortal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F7F6] text-[#0B2A33] dark:bg-[#06181E] dark:text-[#EDF4F3] transition-colors duration-300">
      <ScrollProgressBar />

      <Navbar
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onNavigate={scrollToSection}
        onOpenAdmin={openAdminPortal}
      />

      <main>
        <HeroSection onExploreClick={() => scrollToSection('tours')} />

        <SearchBar
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSearchSubmit}
        />

        <IntroStatsSection />

        <DestinationsSection onSelectDestination={handleSelectDestination} />

        <ToursSection
          tours={filteredTours}
          filters={filters}
          onCategoryChange={handleCategoryChange}
          onDestinationChange={handleDestinationChange}
          onDurationChange={handleDurationChange}
          onResetFilters={handleResetFilters}
          onBookTour={handleBookTour}
        />

        <ExperiencesSection onSelectExperience={handleSelectExperience} />

        <BookingProcessSection />

        <TestimonialsSection />

        <JournalSection onExploreDestination={handleSelectDestination} />

        <BookingFormSection
          selectedTourId={selectedTourId}
          selectedPackageId={selectedPackageId}
          prefilledNote={prefilledNote}
          nameInputRef={bookingNameInputRef}
        />

        <FaqSection />
      </main>

      <Footer onOpenAdmin={openAdminPortal} />

      <ScrollToTopButton />

      <TravelChatbot onSelectTourForBooking={(tour) => handleBookTour(tour)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <LanguageProvider>
          <SiteContentProvider>
            <AppContent />
          </SiteContentProvider>
        </LanguageProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
