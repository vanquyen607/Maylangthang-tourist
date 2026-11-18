import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, PhoneCall, Send, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import { DEFAULT_TOUR_PACKAGES } from '../data/travelData';
import { submitBookingInquiry } from '../lib/firebase';
import { AnimatedHeadline, MagneticButton, RevealBlock } from './MotionPrimitives';

interface BookingFormSectionProps {
  selectedTourId: string;
  selectedPackageId: string;
  prefilledNote: string;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  tour?: string;
  submit?: string;
}

interface SubmittedReceipt {
  inquiryId: string;
  fullName: string;
  tourId: string;
  packageId: string;
  submittedAt: number;
}

const VALID_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;
const LAST_BOOKING_STORAGE_KEY = 'mlt-last-booking';
const SUBMIT_COOLDOWN_MS = 12_000;

export function BookingFormSection({
  selectedTourId,
  selectedPackageId,
  prefilledNote,
  nameInputRef,
}: BookingFormSectionProps) {
  const { lang, t } = useLanguage();
  const { tours, destinations, contactInfo, overriddenIds, siteSettingsInFirestore } =
    useSiteContent();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [tourId, setTourId] = useState(selectedTourId || tours[0]?.id || 'custom-private');
  const [packageId, setPackageId] = useState(
    selectedPackageId || DEFAULT_TOUR_PACKAGES[0].id
  );
  const [note, setNote] = useState(prefilledNote || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<SubmittedReceipt | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(LAST_BOOKING_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SubmittedReceipt;
      if (parsed?.inquiryId && parsed?.fullName && parsed?.tourId && parsed?.packageId) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const shouldReduceMotion = useReducedMotion();

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

  useEffect(() => {
    if (selectedTourId) {
      setTourId(selectedTourId);
    }
  }, [selectedTourId]);

  useEffect(() => {
    if (selectedPackageId) {
      setPackageId(selectedPackageId);
    }
  }, [selectedPackageId]);

  useEffect(() => {
    if (prefilledNote) {
      setNote(prefilledNote.slice(0, 1000));
    }
  }, [prefilledNote]);

  useEffect(() => {
    if (!showToast) return;
    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [showToast]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = fullName.trim();
    const cleanedPhone = phone.replace(/[\s.-]/g, '');

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      nextErrors.fullName = t.booking.fullNameError;
    }

    if (!VALID_PHONE_REGEX.test(cleanedPhone)) {
      nextErrors.phone = t.booking.phoneError;
    }

    if (!tourId) {
      nextErrors.tour = t.booking.tourLabel;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resolveTourTitle = (id: string) => {
    if (id === 'custom-private') return t.booking.customTourOption;
    const found = tours.find((item) => item.id === id) || tours[0];
    if (!found) return t.booking.customTourOption;
    const enTour =
      lang === 'en' && !overriddenIds.has(found.id)
        ? EN_CONTENT.tours[found.id]
        : undefined;
    return enTour ? enTour.title : found.title;
  };

  const resolvePackageLabel = (id: string) => {
    const found =
      DEFAULT_TOUR_PACKAGES.find((p) => p.id === id) || DEFAULT_TOUR_PACKAGES[0];
    const enPkg = EN_CONTENT.packages[found.id];
    return lang === 'en' && enPkg ? enPkg.label : found.label;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    if (
      submittedSnapshot &&
      Date.now() - submittedSnapshot.submittedAt < SUBMIT_COOLDOWN_MS
    ) {
      setErrors({ submit: t.booking.cooldownError });
      return;
    }

    const trimmedName = fullName.trim().slice(0, 120);
    const cleanedPhone = phone.replace(/[\s.-]/g, '').slice(0, 20);
    const resolvedTourTitle = resolveTourTitle(tourId);
    const resolvedPkgLabel = resolvePackageLabel(packageId);

    setIsSubmitting(true);
    setErrors({});

    try {
      const inquiryId = await submitBookingInquiry({
        fullName: trimmedName,
        phone: cleanedPhone,
        tourId,
        tourTitle: resolvedTourTitle,
        packageId,
        packageLabel: resolvedPkgLabel,
        note: note.trim().slice(0, 1000),
        lang,
      });

      const receipt: SubmittedReceipt = {
        inquiryId,
        fullName: trimmedName,
        tourId,
        packageId,
        submittedAt: Date.now(),
      };

      setSubmittedSnapshot(receipt);
      try {
        window.localStorage.setItem(LAST_BOOKING_STORAGE_KEY, JSON.stringify(receipt));
      } catch {
        // Ignore storage quota errors
      }
      setShowToast(true);
      setFullName('');
      setPhone('');
      setNote('');
      setErrors({});
    } catch {
      setErrors({ submit: t.booking.submitError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissReceipt = () => {
    setSubmittedSnapshot(null);
    try {
      window.localStorage.removeItem(LAST_BOOKING_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <section
      id="booking"
      aria-labelledby="booking-heading"
      className="py-16 md:py-22 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl bg-[#0B2A33] text-[#F1F7F6] overflow-hidden border border-[#0B2A33]/10 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Cột thông tin liên hệ & cam kết */}
          <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#0B2A33] to-[#113D49]">
            <div>
              <RevealBlock>
                <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#F2B84B] mb-3">
                  {t.booking.eyebrow}
                </p>
                <AnimatedHeadline
                  text={t.booking.heading}
                  as="h2"
                  mode="word"
                  className="font-serif-display text-3xl sm:text-4xl leading-[1.15] font-semibold text-white [text-wrap:balance] mb-5"
                />
                <p className="text-sm sm:text-base leading-relaxed text-[#F1F7F6]/80 mb-8">
                  {t.booking.subtitle}
                </p>
              </RevealBlock>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/15 text-sm">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-[#F2B84B] shrink-0" aria-hidden="true" />
                <span>
                  {t.booking.hotlineLabel}{' '}
                  <strong className="font-semibold text-white tabular-nums">
                    {contactInfo.hotline}
                  </strong>
                </span>
              </div>
              <p className="text-xs text-[#F1F7F6]/68">
                {lang === 'en' && !siteSettingsInFirestore
                  ? 'Mon – Sun: 08:00 – 20:00 (GMT+7)'
                  : contactInfo.workingHours}
              </p>
            </div>
          </div>

          {/* Cột form đặt tour (không yêu cầu khách đăng nhập) */}
          <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 bg-white dark:bg-[#0D313B] text-[#0B2A33] dark:text-[#EDF4F3]">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Họ và tên */}
                <div>
                  <label htmlFor="booking-fullname" className="block text-sm font-medium mb-1.5">
                    {t.booking.fullNameLabel} <span className="text-[#E8708A]">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="booking-fullname"
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder={t.booking.fullNamePlaceholder}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'error-fullname' : undefined}
                    className="w-full h-12 px-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-sm text-[#0B2A33] dark:text-white placeholder:text-[#0B2A33]/45 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                  />
                  {errors.fullName && (
                    <p
                      id="error-fullname"
                      className="mt-1.5 text-xs font-medium text-[#C83E5B] dark:text-[#E8708A]"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div>
                  <label htmlFor="booking-phone" className="block text-sm font-medium mb-1.5">
                    {t.booking.phoneLabel} <span className="text-[#E8708A]">*</span>
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    maxLength={20}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder={t.booking.phonePlaceholder}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'error-phone' : undefined}
                    className="w-full h-12 px-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-sm text-[#0B2A33] dark:text-white placeholder:text-[#0B2A33]/45 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B] tabular-nums"
                  />
                  {errors.phone && (
                    <p
                      id="error-phone"
                      className="mt-1.5 text-xs font-medium text-[#C83E5B] dark:text-[#E8708A]"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                {/* Chọn tour */}
                <div className="sm:col-span-7">
                  <label htmlFor="booking-tour" className="block text-sm font-medium mb-1.5">
                    {t.booking.tourLabel} <span className="text-[#E8708A]">*</span>
                  </label>
                  <select
                    id="booking-tour"
                    value={tourId}
                    onChange={(e) => setTourId(e.target.value)}
                    aria-invalid={Boolean(errors.tour)}
                    className="w-full h-12 px-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                  >
                    {tours.map((item) => {
                      const enTour =
                        lang === 'en' && !overriddenIds.has(item.id)
                          ? EN_CONTENT.tours[item.id]
                          : undefined;
                      const title = enTour ? enTour.title : item.title;
                      const destLabel = destNameMap.get(item.destination) || item.destination;
                      return (
                        <option key={item.id} value={item.id}>
                          {destLabel} — {title} ({t.durations[item.duration]})
                        </option>
                      );
                    })}
                    <option value="custom-private">{t.booking.customTourOption}</option>
                  </select>
                </div>

                {/* Chọn gói lưu trú */}
                <div className="sm:col-span-5">
                  <label htmlFor="booking-package" className="block text-sm font-medium mb-1.5">
                    {t.booking.packageLabel}
                  </label>
                  <select
                    id="booking-package"
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-sm font-medium text-[#0B2A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B]"
                  >
                    {DEFAULT_TOUR_PACKAGES.map((pkg) => {
                      const enPkg = EN_CONTENT.packages[pkg.id];
                      const label = lang === 'en' && enPkg ? enPkg.label : pkg.label;
                      return (
                        <option key={pkg.id} value={pkg.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label htmlFor="booking-note" className="block text-sm font-medium mb-1.5">
                  {t.booking.noteLabel}
                </label>
                <textarea
                  id="booking-note"
                  rows={4}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.booking.notePlaceholder}
                  className="w-full p-4 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/15 dark:border-white/15 text-sm text-[#0B2A33] dark:text-white placeholder:text-[#0B2A33]/45 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B] resize-y"
                />
              </div>

              {errors.submit && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[#C83E5B] dark:text-[#E8708A]"
                >
                  {errors.submit}
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#0B2A33]/65 dark:text-[#EDF4F3]/65">
                  {t.booking.privacyNote}
                </p>

                <MagneticButton
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-white disabled:opacity-65 disabled:cursor-not-allowed text-white font-semibold text-sm inline-flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
                >
                  <span>{isSubmitting ? t.booking.submittingBtn : t.booking.submitBtn}</span>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </MagneticButton>
              </div>
            </form>

            {submittedSnapshot && (
              <div
                aria-live="polite"
                className="mt-6 p-4 rounded-xl bg-[#1F8A70]/10 dark:bg-[#1F8A70]/25 border border-[#1F8A70]/30 text-sm flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-[#1F8A70] dark:text-[#F2B84B] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0B2A33] dark:text-white">
                    {t.booking.confirmedTitle(
                      submittedSnapshot.fullName,
                      resolveTourTitle(submittedSnapshot.tourId),
                      resolvePackageLabel(submittedSnapshot.packageId)
                    )}
                  </p>
                  <p className="text-xs text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mt-1">
                    {t.booking.confirmedSub}
                  </p>
                  <p className="text-[11px] font-mono text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 mt-1.5">
                    {t.booking.referenceCodeLabel} {submittedSnapshot.inquiryId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismissReceipt}
                  aria-label={t.booking.dismissReceipt}
                  className="p-1 rounded-lg text-[#0B2A33]/50 dark:text-white/50 hover:text-[#0B2A33] dark:hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thông báo trượt lên sau khi gửi form */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 rounded-2xl bg-[#0B2A33] text-white border border-[#F2B84B]/40 shadow-2xl p-4 sm:p-5 flex items-start gap-3.5"
          >
            <CheckCircle2 className="w-5 h-5 text-[#F2B84B] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-sm leading-snug">
              <p className="font-semibold text-white">{t.booking.toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              aria-label={t.booking.closeToast}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F2B84B]"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
