import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { Compass } from 'lucide-react';

/**
 * Thanh tiến trình cuộn trang mảnh ở mép trên cùng màn hình
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[#1F8A70] via-[#F2B84B] to-[#E8708A] pointer-events-none"
      style={{ scaleX }}
    />
  );
}

/**
 * Hiển thị ảnh có lazy loading, mờ dần khi tải xong và khung dự phòng tinh tế nếu lỗi ảnh
 */
interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  fallbackTitle?: string;
}

export function EditorialImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  eager = false,
  fallbackTitle,
}: EditorialImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setFailed(false);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#0B2A33]/10 dark:bg-[#0B2A33]/60 ${className}`}
    >
      {!failed ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover ${
            shouldReduceMotion
              ? 'opacity-100'
              : `transition-[opacity,transform] duration-700 ease-out ${
                  loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
                }`
          } ${imgClassName}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0B2A33] via-[#13424E] to-[#1F8A70] text-[#F1F7F6]">
          <Compass className="w-7 h-7 mb-2 text-[#F2B84B] opacity-85" aria-hidden="true" />
          <span className="font-serif-display text-sm font-medium opacity-90">
            {fallbackTitle || alt}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Tiêu đề lớn hiện lần lượt từng ký tự hoặc từng từ, vẫn giữ nguyên khả năng đọc cho trình đọc màn hình
 */
interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2';
  mode?: 'char' | 'word';
  delay?: number;
}

export function AnimatedHeadline({
  text,
  className = '',
  as = 'h1',
  mode = 'char',
  delay = 0.08,
}: AnimatedHeadlineProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(' ');

  let globalCharIndex = 0;

  return (
    <Tag className={className} aria-label={text}>
      <React.Fragment key={text}>
        {words.map((word, wordIdx) => {
          if (mode === 'word') {
            return (
              <span
                key={`${word}-${wordIdx}`}
                aria-hidden="true"
                className="inline-block overflow-hidden align-bottom mr-[0.26em] last:mr-0"
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, y: '105%' }}
                  whileInView={{ opacity: 1, y: '0%' }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.65,
                    delay: delay + wordIdx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            );
          }

          const chars = Array.from(word);
          return (
            <span
              key={`${word}-${wordIdx}`}
              aria-hidden="true"
              className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0"
            >
              {chars.map((char, charIdx) => {
                const currentIdx = globalCharIndex++;
                return (
                  <span key={`${char}-${charIdx}`} className="inline-block overflow-hidden align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={{ opacity: 0, y: '110%' }}
                      animate={{ opacity: 1, y: '0%' }}
                      transition={{
                        duration: 0.6,
                        delay: delay + currentIdx * 0.032,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}
            </span>
          );
        })}
      </React.Fragment>
    </Tag>
  );
}

/**
 * Khối nội dung hiện lên mượt mà (fade + trượt nhẹ) khi cuộn tới khung nhìn
 */
interface RevealBlockProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export function RevealBlock({
  children,
  className = '',
  delay = 0,
  yOffset = 22,
}: RevealBlockProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Nút bấm có hiệu ứng từ tính nhẹ theo con trỏ trên màn hình desktop và nhấc nhẹ khi hover
 */
interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function MagneticButton({
  children,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20 });
  const springY = useSpring(y, { stiffness: 260, damping: 20 });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion || disabled || e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    x.set(relX * 5);
    y.set(relY * 4);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={shouldReduceMotion ? undefined : { x: springX, y: springY }}
      whileHover={shouldReduceMotion || disabled ? undefined : { y: -2 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * Số liệu đếm tăng dần mượt mà khi phần tử xuất hiện trong khung nhìn
 */
interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  locale?: 'vi-VN' | 'en-US';
}

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  locale = 'vi-VN',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    const duration = 1400;
    const startTime = performance.now();
    let frameId = 0;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic cho cảm giác dừng êm ái
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, value, shouldReduceMotion]);

  const formatted =
    decimals > 0
      ? locale === 'vi-VN'
        ? displayValue.toFixed(decimals).replace('.', ',')
        : displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString(locale);

  return (
    <span ref={ref} className="tabular-nums">
      {formatted}
      {suffix}
    </span>
  );
}
