import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Film, Pause, Play } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../context/SiteContentContext';
import { EN_CONTENT } from '../data/i18n';
import { AnimatedHeadline, MagneticButton } from './MotionPrimitives';

interface HeroSectionProps {
  onExploreClick: () => void;
}

const SLIDE_DURATION_MS = 7500;
const CROSSFADE_DURATION_MS = 1800;

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { lang, t } = useLanguage();
  const { heroData, siteSettingsInFirestore } = useSiteContent();

  const [isPlaying, setIsPlaying] = useState<boolean>(() => !shouldReduceMotion);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const hasCustomVideo = Boolean(heroData.videoUrl) && !videoFailed;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax nhiều lớp: video nền, lớp mây sương, dãy núi tiền cảnh và nội dung chữ
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);
  const cloudsY = useTransform(scrollYProgress, [0, 1], ['0%', '34%']);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsPlaying(false);
    }
  }, [shouldReduceMotion]);

  // Điều khiển phát/tạm dừng nếu có custom video MP4/WebM
  useEffect(() => {
    if (!hasCustomVideo || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // Trình duyệt có thể chặn autoplay nếu chưa muted; video đã đặt muted nên luôn an toàn
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, hasCustomVideo]);

  // Tổng hợp thước phim nền 60fps từ bộ ảnh videoSlides + hiệu ứng pan/zoom, chuyển cảnh & sương trôi
  useEffect(() => {
    if (hasCustomVideo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const slides = heroData.videoSlides;
    if (!slides || slides.length === 0) return;

    let cancelled = false;
    const loadedImages: (HTMLImageElement | null)[] = slides.map(() => null);

    slides.forEach((slide, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!cancelled) {
          loadedImages[idx] = img;
        }
      };
      img.src = slide.src;
    });

    const mistParticles = Array.from({ length: 18 }, (_, i) => ({
      x: (i * 0.137) % 1,
      y: 0.22 + ((i * 0.29) % 0.68),
      radius: 0.14 + (i % 5) * 0.045,
      speed: 0.008 + (i % 4) * 0.0035,
      opacity: 0.035 + (i % 3) * 0.018,
    }));

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.floor(rect.width * dpr));
      const targetH = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let rafId = 0;
    let lastTimestamp = performance.now();
    let elapsedMs = 0;
    let lastReportedIndex = 0;

    const drawCoverImage = (
      img: HTMLImageElement,
      alpha: number,
      zoom: number,
      panX: number,
      panY: number
    ) => {
      if (alpha <= 0.001 || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;

      let drawW = cw;
      let drawH = ch;
      if (imgRatio > canvasRatio) {
        drawH = ch * zoom;
        drawW = drawH * imgRatio;
      } else {
        drawW = cw * zoom;
        drawH = drawW / imgRatio;
      }

      const extraW = Math.max(0, drawW - cw);
      const extraH = Math.max(0, drawH - ch);
      const dx = -extraW * (0.5 + panX);
      const dy = -extraH * (0.5 + panY);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, drawW, drawH);
      ctx.restore();
    };

    const renderFrame = (now: number) => {
      if (cancelled) return;
      const delta = Math.min(now - lastTimestamp, 100);
      lastTimestamp = now;

      if (isPlaying) {
        elapsedMs += delta;
      }

      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const totalCycle = slides.length * SLIDE_DURATION_MS;
      const cycleTime = elapsedMs % totalCycle;
      const currentIdx = Math.floor(cycleTime / SLIDE_DURATION_MS);
      const nextIdx = (currentIdx + 1) % slides.length;
      const slideProgress = (cycleTime % SLIDE_DURATION_MS) / SLIDE_DURATION_MS;
      const timeRemaining = SLIDE_DURATION_MS - (cycleTime % SLIDE_DURATION_MS);

      if (currentIdx !== lastReportedIndex) {
        lastReportedIndex = currentIdx;
        setActiveSlideIndex(currentIdx);
      }

      const crossfadeAlpha =
        timeRemaining < CROSSFADE_DURATION_MS
          ? 1 - timeRemaining / CROSSFADE_DURATION_MS
          : 0;

      const currentImg = loadedImages[currentIdx] || loadedImages[0];
      const nextImg = loadedImages[nextIdx] || loadedImages[0];

      // Cảnh hiện tại trượt máy nhẹ nhàng (drone pan & zoom)
      if (currentImg) {
        const dir = currentIdx % 2 === 0 ? 1 : -1;
        const zoom = 1.06 + slideProgress * 0.08;
        const panX = dir * (-0.28 + slideProgress * 0.56);
        const panY = -0.14 + Math.sin(slideProgress * Math.PI) * 0.2;
        drawCoverImage(currentImg, 1 - crossfadeAlpha, zoom, panX, panY);
      }

      // Cảnh kế tiếp hòa tan êm ái
      if (nextImg && crossfadeAlpha > 0.005) {
        const nextDir = nextIdx % 2 === 0 ? 1 : -1;
        drawCoverImage(nextImg, crossfadeAlpha, 1.06, nextDir * -0.28, -0.14);
      }

      // Hạt sương trôi & ánh nắng sớm tạo chiều sâu điện ảnh
      const timeSec = elapsedMs * 0.001;
      for (const p of mistParticles) {
        const px = ((p.x + timeSec * p.speed) % 1.3 - 0.15) * cw;
        const py = p.y * ch + Math.sin(timeSec * 0.4 + p.x * 10) * (ch * 0.025);
        const rad = p.radius * Math.max(cw, ch);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, rad);
        grad.addColorStop(0, `rgba(241, 247, 246, ${p.opacity})`);
        grad.addColorStop(0.55, `rgba(242, 184, 75, ${p.opacity * 0.35})`);
        grad.addColorStop(1, 'rgba(241, 247, 246, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isPlaying || !currentImg) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hasCustomVideo, isPlaying]);

  const useEnDefault = lang === 'en' && !siteSettingsInFirestore;
  const eyebrow = useEnDefault ? EN_CONTENT.hero.eyebrow : heroData.eyebrow;
  const headline = useEnDefault ? EN_CONTENT.hero.headline : heroData.headline;
  const subtitle = useEnDefault ? EN_CONTENT.hero.subtitle : heroData.subtitle;
  const ctaLabel = useEnDefault ? EN_CONTENT.hero.ctaLabel : heroData.ctaLabel;
  const altText = useEnDefault ? EN_CONTENT.hero.alt : heroData.alt;
  const currentSlide = heroData.videoSlides[activeSlideIndex] || heroData.videoSlides[0];
  const slideCaption = hasCustomVideo
    ? t.hero.videoCaption
    : lang === 'en'
      ? currentSlide.captionEn
      : currentSlide.captionVi;

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[92vh] md:min-h-[96vh] flex items-center justify-center overflow-hidden bg-[#06181E] text-white"
    >
      {/* Lớp 1: Video nền (MP4/WebM nếu có, hoặc thước phim nền Canvas 60fps mượt mà) */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src={heroData.image}
          alt={altText}
          loading="eager"
          fetchPriority="high"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />

        {hasCustomVideo ? (
          <video
            ref={videoRef}
            src={heroData.videoUrl}
            poster={heroData.image}
            autoPlay={!shouldReduceMotion}
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block"
          />
        )}

        {/* Lớp phủ chuyển sắc đảm bảo độ tương phản chữ >= 4.5:1 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06181E]/62 via-[#06181E]/34 to-[#06181E]/86" />
      </motion.div>

      {/* Lớp 2: Dải mây sương mờ trôi theo tốc độ trung bình */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: cloudsY }}
        className="absolute inset-x-0 bottom-[14%] pointer-events-none opacity-45 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mistLayer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1F7F6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F1F7F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 160C180 110 340 190 540 150C740 110 920 60 1140 120C1280 158 1380 130 1440 105V260H0V160Z"
            fill="url(#mistLayer)"
          />
        </svg>
      </motion.div>

      {/* Lớp 3: Dải núi trùng điệp tiền cảnh tạo chiều sâu */}
      <motion.div
        aria-hidden="true"
        style={shouldReduceMotion ? undefined : { y: ridgeY }}
        className="absolute inset-x-0 bottom-0 pointer-events-none opacity-65 will-change-transform"
      >
        <svg
          viewBox="0 0 1440 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24 md:h-36"
          preserveAspectRatio="none"
        >
          <path
            d="M0 135L140 95L310 125L490 70L680 115L860 55L1060 110L1260 65L1440 100V180H0V135Z"
            fill="#06181E"
            fillOpacity="0.55"
          />
        </svg>
      </motion.div>

      {/* Lớp 4: Nội dung biên tập chính */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center"
      >
        <motion.p
          key={`eyebrow-${lang}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs sm:text-sm tracking-[0.16em] uppercase text-[#F2B84B] font-medium mb-5"
        >
          {eyebrow}
        </motion.p>

        <AnimatedHeadline
          key={`headline-${lang}`}
          text={headline}
          as="h1"
          mode="char"
          delay={0.1}
          className="font-serif-display text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[1.06] font-semibold tracking-tight text-white [text-wrap:balance] mb-6 drop-shadow-sm"
        />

        <motion.p
          key={`subtitle-${lang}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#F1F7F6]/90 mb-10"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          <MagneticButton
            onClick={onExploreClick}
            className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#F2B84B] text-[#0B2A33] font-semibold text-sm sm:text-base shadow-lg shadow-black/25 hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B]"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Điều khiển video nền & chú thích cảnh quay */}
      <div className="absolute bottom-20 md:bottom-24 right-4 sm:right-8 z-10 flex items-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-white/75 tracking-wide">
          <Film className="w-3.5 h-3.5 text-[#F2B84B]" aria-hidden="true" />
          <span>{slideCaption}</span>
        </span>
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? t.hero.pauseVideo : t.hero.playVideo}
          aria-pressed={isPlaying}
          className="w-9 h-9 rounded-full bg-[#06181E]/55 hover:bg-[#06181E]/85 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2B84B]"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>
      </div>

      {/* Biểu tượng cuộn xuống nhấp nháy nhẹ */}
      <motion.a
        href="#search-bar"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('search-bar')?.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label={t.hero.scrollAria}
        animate={
          shouldReduceMotion
            ? undefined
            : { y: [0, 7, 0], opacity: [0.65, 1, 0.65] }
        }
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/85 hover:text-[#F2B84B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B84B] rounded-full p-2"
      >
        <span className="text-[11px] tracking-[0.18em] uppercase font-medium">
          {t.hero.scrollLabel}
        </span>
        <ArrowDown className="w-4 h-4" />
      </motion.a>
    </section>
  );
}
