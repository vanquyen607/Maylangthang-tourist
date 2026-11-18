import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import {
  JOURNAL_CATEGORIES,
  JournalArticle,
  JournalCategory,
} from '../data/travelData';
import {
  AnimatedHeadline,
  EditorialImage,
  MagneticButton,
  RevealBlock,
} from './MotionPrimitives';

interface JournalSectionProps {
  onExploreDestination: (destinationName: string) => void;
}

export function JournalSection({ onExploreDestination }: JournalSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<JournalCategory>('Tất cả');
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { lang, t } = useLanguage();
  const { journalArticles, overriddenIds } = useSiteContent();

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'Tất cả') return journalArticles;
    return journalArticles.filter((article) => article.category === selectedCategory);
  }, [selectedCategory, journalArticles]);

  const getLocalizedArticle = (article: JournalArticle) => {
    const enArt =
      lang === 'en' && !overriddenIds.has(article.id)
        ? EN_CONTENT.journal[article.id]
        : undefined;
    return {
      categoryLabel: t.journalCategories[article.category],
      destinationDisplay: enArt ? enArt.destination : article.destination,
      title: enArt ? enArt.title : article.title,
      excerpt: enArt ? enArt.excerpt : article.excerpt,
      authorName: enArt ? enArt.authorName : article.authorName,
      authorRole: enArt ? enArt.authorRole : article.authorRole,
      publishedDate: enArt ? enArt.publishedDate : article.publishedDate,
      readTime: enArt ? enArt.readTime : article.readTime,
      pullQuote: enArt ? enArt.pullQuote : article.pullQuote,
      paragraphs: enArt ? enArt.paragraphs : article.paragraphs,
    };
  };

  return (
    <section
      id="journal"
      aria-labelledby="journal-heading"
      className="py-16 md:py-22 border-t border-[#0B2A33]/8 dark:border-white/8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề tạp chí & tab lọc chủ đề */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="lg:max-w-md xl:max-w-lg min-w-0">
            <RevealBlock>
              <p className="text-xs tracking-[0.16em] uppercase font-semibold text-[#1F8A70] dark:text-[#F2B84B] mb-3">
                {t.journal.eyebrow}
              </p>
              <AnimatedHeadline
                text={t.journal.heading}
                as="h2"
                mode="word"
                className="font-serif-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-[1.15] font-semibold text-[#0B2A33] dark:text-[#EDF4F3] [text-wrap:balance]"
              />
            </RevealBlock>
          </div>

          <RevealBlock delay={0.1} className="shrink-0 max-w-full">
            <div
              role="tablist"
              aria-label={t.journal.eyebrow}
              className="inline-flex flex-nowrap items-center gap-1 p-1.5 rounded-xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 max-w-full overflow-x-auto no-scrollbar"
            >
              {JOURNAL_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] ${
                      active
                        ? 'bg-[#0B2A33] text-white dark:bg-[#F2B84B] dark:text-[#06181E]'
                        : 'text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 hover:text-[#0B2A33] dark:hover:text-white hover:bg-[#0B2A33]/5 dark:hover:bg-white/8'
                    }`}
                  >
                    {t.journalCategories[cat]}
                  </button>
                );
              })}
            </div>
          </RevealBlock>
        </div>

        {/* Lưới thẻ bài viết phong cách tạp chí */}
        <div
          className={`grid grid-cols-1 gap-7 ${
            filteredArticles.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredArticles.map((article, idx) => {
            const loc = getLocalizedArticle(article);
            return (
              <RevealBlock key={article.id} delay={0.06 * (idx % 3)}>
                <article className="group h-full flex flex-col bg-white dark:bg-[#0D313B] rounded-2xl overflow-hidden border border-[#0B2A33]/10 dark:border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0B2A33]/10 dark:hover:shadow-black/40">
                  <button
                    type="button"
                    onClick={() => setActiveArticle(article)}
                    aria-label={`${t.journal.readFull}: ${loc.title}`}
                    className="relative aspect-[16/10] w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F2B84B]"
                  >
                    <EditorialImage
                      src={article.image}
                      alt={article.alt}
                      fallbackTitle={loc.title}
                      className="w-full h-full"
                      imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#06181E]/70 via-[#06181E]/10 to-transparent"
                    />
                    <span className="absolute bottom-3.5 left-4 text-xs font-medium text-[#F2B84B]">
                      {loc.publishedDate}
                    </span>
                  </button>

                  <div className="flex-1 p-6 flex flex-col">
                    {/* Metadata thuần chữ, phân tách bằng dấu chấm giữa */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mb-2.5">
                      <span>{loc.categoryLabel}</span>
                      <span aria-hidden="true" className="text-[#0B2A33]/30 dark:text-white/30">
                        ·
                      </span>
                      <span>{loc.destinationDisplay}</span>
                      <span aria-hidden="true" className="text-[#0B2A33]/30 dark:text-white/30">
                        ·
                      </span>
                      <span>{loc.readTime}</span>
                    </div>

                    <h3 className="font-serif-display text-xl sm:text-[1.35rem] font-semibold leading-snug text-[#0B2A33] dark:text-white mb-3">
                      <button
                        type="button"
                        onClick={() => setActiveArticle(article)}
                        className="text-left hover:text-[#1F8A70] dark:hover:text-[#F2B84B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] rounded"
                      >
                        {loc.title}
                      </button>
                    </h3>

                    <p className="text-sm leading-[1.7] text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 mb-6 flex-1">
                      {loc.excerpt}
                    </p>

                    <div className="pt-4 border-t border-[#0B2A33]/10 dark:border-white/10 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0B2A33] dark:text-white truncate">
                          {loc.authorName}
                        </p>
                        <p className="text-[11px] text-[#0B2A33]/60 dark:text-[#EDF4F3]/60 truncate">
                          {loc.authorRole}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveArticle(article)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1F8A70] dark:text-[#F2B84B] hover:text-[#0B2A33] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B] rounded"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t.journal.readFull}</span>
                      </button>
                    </div>
                  </div>
                </article>
              </RevealBlock>
            );
          })}
        </div>
      </div>

      {/* Modal đọc bài tạp chí */}
      <AnimatePresence>
        {activeArticle && (() => {
          const modalLoc = getLocalizedArticle(activeArticle);
          return (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="journal-modal-title"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06181E]/80 backdrop-blur-sm"
            >
              <motion.article
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#F1F7F6] dark:bg-[#0B2A33] text-[#0B2A33] dark:text-[#EDF4F3] border border-[#0B2A33]/15 dark:border-white/15 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  aria-label={t.journal.closeArticle}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#06181E]/70 text-white flex items-center justify-center hover:bg-[#06181E] transition-colors focus-visible:outline-2 focus-visible:outline-[#F2B84B]"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="aspect-[16/9] w-full">
                  <EditorialImage
                    src={activeArticle.image}
                    alt={activeArticle.alt}
                    fallbackTitle={modalLoc.title}
                    className="w-full h-full"
                  />
                </div>

                <div className="p-6 sm:p-10 space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#1F8A70] dark:text-[#F2B84B] mb-3">
                      <span>{modalLoc.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.destinationDisplay}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.publishedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modalLoc.readTime}</span>
                    </div>

                    <h3
                      id="journal-modal-title"
                      className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-4 [text-wrap:balance]"
                    >
                      {modalLoc.title}
                    </h3>

                    <div className="text-xs sm:text-sm text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                      {t.journal.writtenBy}{' '}
                      <strong className="font-semibold text-[#0B2A33] dark:text-white">
                        {modalLoc.authorName}
                      </strong>{' '}
                      <span aria-hidden="true">·</span> {modalLoc.authorRole}
                    </div>
                  </div>

                  {/* Câu trích dẫn điểm nhấn phong cách tạp chí */}
                  <blockquote className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/10 dark:border-white/10 font-serif-display italic text-lg sm:text-xl leading-relaxed text-[#0B2A33] dark:text-[#F2B84B]">
                    “{modalLoc.pullQuote}”
                  </blockquote>

                  {/* Nội dung bài viết nhiều đoạn */}
                  <div className="space-y-4 text-sm sm:text-base leading-[1.85] text-[#0B2A33]/85 dark:text-[#EDF4F3]/85">
                    {modalLoc.paragraphs.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-[#0B2A33]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-[#0B2A33]/70 dark:text-[#EDF4F3]/70">
                      {t.journal.ctaQuestion(modalLoc.destinationDisplay)}
                    </p>
                    <MagneticButton
                      onClick={() => {
                        const canonicalDest = activeArticle.destination;
                        setActiveArticle(null);
                        onExploreDestination(canonicalDest);
                      }}
                      className="px-6 py-3 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{t.journal.ctaButton(modalLoc.destinationDisplay)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                </div>
              </motion.article>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
