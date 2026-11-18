import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import { TourItem } from '../data/travelData';
import { submitBookingInquiry } from '../lib/firebase';

interface TravelChatbotProps {
  onSelectTourForBooking: (tour: TourItem) => void;
}

interface BookingReceiptInChat {
  status: 'saved' | 'error';
  inquiryId?: string;
  fullName: string;
  phone: string;
  tourTitle: string;
  packageLabel: string;
  errorMessage?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  recommendedTours?: TourItem[];
  bookingReceipt?: BookingReceiptInChat;
}

interface ChatApiResponse {
  reply?: string;
  recommendedTourIds?: string[];
  bookingSubmission?: {
    fullName: string;
    phone: string;
    tourId: string;
    tourTitle: string;
    packageId: string;
    packageLabel: string;
    note: string;
  } | null;
  error?: string;
}

const LAST_BOOKING_STORAGE_KEY = 'mlt-last-booking';
const SUBMIT_COOLDOWN_MS = 12_000;

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const segments = line.split(/(\*\*[^*]+\*\*)/g);
    const renderedSegments = segments.map((seg, segIdx) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        return (
          <strong key={segIdx} className="font-semibold">
            {seg.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={segIdx}>{seg}</React.Fragment>;
    });

    return (
      <React.Fragment key={lineIdx}>
        {renderedSegments}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export function TravelChatbot({ onSelectTourForBooking }: TravelChatbotProps) {
  const { lang, t } = useLanguage();
  const { tours, destinations, experiences, contactInfo, overriddenIds } =
    useSiteContent();
  const shouldReduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
      });
    }
  }, [messages, isSending, isOpen, shouldReduceMotion]);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const catalogPayload = useMemo(() => {
    return {
      tours: tours.map((item) => {
        const enTour =
          lang === 'en' && !overriddenIds.has(item.id)
            ? EN_CONTENT.tours[item.id]
            : undefined;
        return {
          id: item.id,
          title: enTour ? enTour.title : item.title,
          destination: item.destination,
          zone: item.zone,
          category: item.category,
          duration: item.duration,
          price: item.price,
          groupSize: enTour ? enTour.groupSize : item.groupSize,
          departureInfo: enTour ? enTour.departureInfo : item.departureInfo,
          highlights: enTour ? enTour.highlights : item.highlights,
          packages: item.packages.map((pkg) => {
            const enPkg =
              lang === 'en' && !overriddenIds.has(item.id)
                ? EN_CONTENT.packages[pkg.id]
                : undefined;
            return {
              id: pkg.id,
              label: enPkg ? enPkg.label : pkg.label,
              summary: enPkg ? enPkg.summary : pkg.summary,
              priceDelta: pkg.priceDelta,
            };
          }),
        };
      }),
      destinations: destinations.map((d) => {
        const enDest =
          lang === 'en' && !overriddenIds.has(d.id)
            ? EN_CONTENT.destinations[d.id]
            : undefined;
        return {
          id: d.id,
          name: enDest ? enDest.name : d.name,
          region: enDest ? enDest.region : d.region,
          zone: d.zone,
          bestSeason: enDest ? enDest.bestSeason : d.bestSeason,
          tagline: enDest ? enDest.tagline : d.tagline,
        };
      }),
      experiences: experiences.map((e) => {
        const enExp =
          lang === 'en' && !overriddenIds.has(e.id)
            ? EN_CONTENT.experiences[e.id]
            : undefined;
        return {
          id: e.id,
          title: enExp ? enExp.title : e.title,
          location: enExp ? enExp.location : e.location,
          duration: enExp ? enExp.duration : e.duration,
        };
      }),
      contact: {
        hotline: contactInfo.hotline,
        phone: contactInfo.phone,
        email: contactInfo.email,
        workingHours: contactInfo.workingHours,
        address: contactInfo.address,
        hanoiOffice: contactInfo.hanoiOffice,
      },
    };
  }, [tours, destinations, experiences, contactInfo, lang, overriddenIds]);

  const tourById = useMemo(() => {
    return new Map(tours.map((item) => [item.id, item]));
  }, [tours]);

  const sendMessage = async (rawText: string, appendUserMessage = true) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = appendUserMessage ? [...messages, userMsg] : [...messages];
    if (appendUserMessage) {
      setMessages(nextHistory);
      setInput('');
    }
    setErrorMsg(null);
    setLastFailedPrompt(null);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          catalog: catalogPayload,
        }),
      });

      const data = (await response.json()) as ChatApiResponse;
      if (!response.ok) {
        throw new Error(data.error || t.chat.errorFallback);
      }

      const recommendedTours = (data.recommendedTourIds || [])
        .map((id) => tourById.get(id))
        .filter((item): item is TourItem => Boolean(item));

      let bookingReceipt: BookingReceiptInChat | undefined;

      if (data.bookingSubmission) {
        const sub = data.bookingSubmission;
        let canSubmit = true;
        try {
          const prevRaw = window.localStorage.getItem(LAST_BOOKING_STORAGE_KEY);
          if (prevRaw) {
            const parsed = JSON.parse(prevRaw) as { submittedAt?: number };
            if (
              typeof parsed.submittedAt === 'number' &&
              Date.now() - parsed.submittedAt < SUBMIT_COOLDOWN_MS
            ) {
              canSubmit = false;
            }
          }
        } catch {
          // Ignore storage read errors
        }

        if (!canSubmit) {
          bookingReceipt = {
            status: 'error',
            fullName: sub.fullName,
            phone: sub.phone,
            tourTitle: sub.tourTitle,
            packageLabel: sub.packageLabel,
            errorMessage: t.booking.cooldownError,
          };
        } else {
          try {
            const inquiryId = await submitBookingInquiry({
              fullName: sub.fullName,
              phone: sub.phone,
              tourId: sub.tourId,
              tourTitle: sub.tourTitle,
              packageId: sub.packageId,
              packageLabel: sub.packageLabel,
              note: sub.note || (lang === 'en' ? 'Booked via AI Concierge' : 'Đặt qua Trợ lý tư vấn'),
              lang,
            });

            try {
              window.localStorage.setItem(
                LAST_BOOKING_STORAGE_KEY,
                JSON.stringify({
                  inquiryId,
                  fullName: sub.fullName,
                  tourId: sub.tourId,
                  packageId: sub.packageId,
                  submittedAt: Date.now(),
                })
              );
            } catch {
              // Ignore storage quota errors
            }

            bookingReceipt = {
              status: 'saved',
              inquiryId,
              fullName: sub.fullName,
              phone: sub.phone,
              tourTitle: sub.tourTitle,
              packageLabel: sub.packageLabel,
            };
          } catch (saveErr) {
            bookingReceipt = {
              status: 'error',
              fullName: sub.fullName,
              phone: sub.phone,
              tourTitle: sub.tourTitle,
              packageLabel: sub.packageLabel,
              errorMessage:
                saveErr instanceof Error ? saveErr.message : t.booking.submitError,
            };
          }
        }
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || '',
        recommendedTours: recommendedTours.length > 0 ? recommendedTours : undefined,
        bookingReceipt,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.chat.errorFallback);
      setLastFailedPrompt(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input, true);
  };

  const handleReset = () => {
    setMessages([]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  const formatPrice = (price: number) =>
    price.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') + '₫';

  return (
    <>
      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label={t.chat.panelTitle}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-7 sm:w-[410px] h-[min(580px,78vh)] z-50 rounded-3xl bg-white dark:bg-[#0D313B] text-[#0B2A33] dark:text-[#EDF4F3] border border-[#0B2A33]/15 dark:border-white/15 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0B2A33] text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1F8A70] text-white flex items-center justify-center shrink-0">
                  <Compass className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif-display text-base font-semibold truncate">
                    {t.chat.panelTitle}
                  </h2>
                  <p className="text-[11px] text-[#EDF4F3]/75 truncate">
                    {t.chat.panelSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    aria-label={t.chat.resetAria}
                    title={t.chat.resetAria}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={t.chat.closeAria}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F1F7F6]/65 dark:bg-[#06181E]/60">
              {/* Welcome Bubble */}
              <div className="flex flex-col items-start gap-2.5">
                <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs">
                  {t.chat.welcome}
                </div>

                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {t.chat.quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void sendMessage(prompt, true)}
                        className="text-left px-3 py-2 rounded-xl bg-white dark:bg-[#0D313B] border border-[#1F8A70]/25 dark:border-[#F2B84B]/30 text-xs font-medium text-[#0B2A33] dark:text-[#EDF4F3] hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation History */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2.5 ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.text && (
                    <div
                      className={`max-w-[90%] px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-2xl rounded-tr-sm bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E] font-medium'
                          : 'rounded-2xl rounded-tl-sm bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 shadow-xs'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  )}

                  {/* Interactive Recommended Tour Cards */}
                  {msg.recommendedTours && msg.recommendedTours.length > 0 && (
                    <div className="w-full max-w-[94%] space-y-2.5">
                      {msg.recommendedTours.map((tour) => {
                        const enTour =
                          lang === 'en' && !overriddenIds.has(tour.id)
                            ? EN_CONTENT.tours[tour.id]
                            : undefined;
                        const title = enTour ? enTour.title : tour.title;
                        return (
                          <div
                            key={tour.id}
                            className="rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/12 p-3 flex flex-col gap-2.5 shadow-xs"
                          >
                            <div className="flex gap-3 items-start">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-[#0B2A33]/15 to-[#1F8A70]/25">
                                <img
                                  src={tour.image}
                                  alt={tour.alt}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-xs sm:text-[13px] leading-snug line-clamp-2">
                                  {title}
                                </h3>
                                <p className="text-[11px] text-[#0B2A33]/65 dark:text-[#EDF4F3]/65 mt-0.5">
                                  {tour.destination} · {t.durations[tour.duration]}
                                </p>
                                <p className="text-xs font-semibold text-[#1F8A70] dark:text-[#F2B84B] tabular-nums mt-1">
                                  {t.destinations.fromPrice} {formatPrice(tour.price)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  onSelectTourForBooking(tour);
                                }}
                                className="flex-1 h-8 px-3 rounded-lg border border-[#0B2A33]/15 dark:border-white/15 text-[11px] font-semibold hover:border-[#1F8A70] dark:hover:border-[#F2B84B] transition-colors whitespace-nowrap"
                              >
                                {t.chat.selectToBook}
                              </button>
                              <button
                                type="button"
                                disabled={isSending}
                                onClick={() =>
                                  void sendMessage(
                                    lang === 'en'
                                      ? `I want to reserve "${title}".`
                                      : `Mình muốn chốt giữ chỗ tour "${title}".`,
                                    true
                                  )
                                }
                                className="flex-1 h-8 px-3 rounded-lg bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors whitespace-nowrap disabled:opacity-50"
                              >
                                <span>{t.chat.askToClose}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Persisted Booking Receipt Card inside Chat */}
                  {msg.bookingReceipt && (
                    <div
                      className={`w-full max-w-[94%] rounded-2xl p-3.5 border text-xs space-y-1.5 ${
                        msg.bookingReceipt.status === 'saved'
                          ? 'bg-[#1F8A70]/12 dark:bg-[#1F8A70]/22 border-[#1F8A70]/35 text-[#0B2A33] dark:text-[#EDF4F3]'
                          : 'bg-[#C83E5B]/10 border-[#C83E5B]/30 text-[#C83E5B] dark:text-[#E8708A]'
                      }`}
                    >
                      {msg.bookingReceipt.status === 'saved' ? (
                        <>
                          <div className="flex items-center gap-2 font-semibold text-[#12624E] dark:text-[#6EE7B7]">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{t.chat.bookingConfirmedBadge}</span>
                          </div>
                          {msg.bookingReceipt.inquiryId && (
                            <p className="text-[11px] tabular-nums">
                              {t.chat.bookingRefLabel}{' '}
                              <span className="font-mono font-semibold">
                                #{msg.bookingReceipt.inquiryId}
                              </span>
                            </p>
                          )}
                          <p className="text-[11px] tabular-nums">
                            {t.chat.bookingGuestLabel}{' '}
                            <strong>{msg.bookingReceipt.fullName}</strong> ·{' '}
                            {msg.bookingReceipt.phone}
                          </p>
                          <p className="text-[11px]">
                            {t.chat.bookingTourLabel} {msg.bookingReceipt.tourTitle} (
                            {msg.bookingReceipt.packageLabel})
                          </p>
                          <p className="text-[11px] opacity-80 pt-0.5">
                            {t.chat.bookingWaitNote}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{msg.bookingReceipt.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-[#0B2A33]/70 dark:text-[#EDF4F3]/70 px-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F8A70] dark:text-[#F2B84B]" />
                  <span>{t.chat.thinking}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="rounded-xl bg-[#C83E5B]/10 border border-[#C83E5B]/25 p-3 text-xs text-[#C83E5B] dark:text-[#E8708A] space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                  {lastFailedPrompt && (
                    <button
                      type="button"
                      onClick={() => void sendMessage(lastFailedPrompt, false)}
                      className="px-3 py-1 rounded-lg bg-[#C83E5B] text-white text-[11px] font-semibold"
                    >
                      {t.chat.retryLabel}
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 bg-white dark:bg-[#0D313B] border-t border-[#0B2A33]/10 dark:border-white/10 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.inputPlaceholder}
                disabled={isSending}
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#F1F7F6] dark:bg-[#06181E] border border-[#0B2A33]/12 dark:border-white/12 text-xs sm:text-sm text-[#0B2A33] dark:text-white placeholder:text-[#0B2A33]/45 dark:placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#1F8A70] dark:focus:ring-[#F2B84B] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label={t.chat.sendAria}
                className="h-10 w-10 rounded-xl bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white flex items-center justify-center transition-colors disabled:opacity-45 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t.chat.launcherAria}
        aria-expanded={isOpen}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 h-12 px-4 sm:px-5 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:hover:bg-white text-white dark:text-[#06181E] shadow-xl shadow-[#0B2A33]/25 dark:shadow-black/50 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
      >
        {isOpen ? (
          <X className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
        )}
        <span className="whitespace-nowrap">{t.chat.launcherLabel}</span>
      </motion.button>
    </>
  );
}
