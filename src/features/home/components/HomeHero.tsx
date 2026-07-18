import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TrekkingVideo from '@/assets/videos/Trekking.mp4';
import { PATHS } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

// Free-to-use mountain/nature video from Pixabay CDN
const HERO_VIDEO_URL = TrekkingVideo;

// Fallback poster image if video fails
const HERO_POSTER_URL = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80';

export default function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Eyebrow
      tl.from(eyebrowRef.current, { opacity: 0, y: 20, duration: 0.5 }, 0.2);

      // Headline — word-by-word reveal using span wrappers
      const headline = headlineRef.current;
      if (headline) {
        const rawText = headline.textContent ?? '';
        const words = rawText.split(' ');
        headline.innerHTML = words
          .map(
            (w) =>
              `<span class="inline-block overflow-hidden"><span class="inline-block hero-word">${w}</span></span>`
          )
          .join(' ');
        tl.from(
          '.hero-word',
          {
            y: '110%',
            opacity: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: 'expo.out',
          },
          0.35
        );
      }

      tl.from(subRef.current, { opacity: 0, y: 24, duration: 0.6 }, 0.7);
      tl.from(ctaRef.current, { opacity: 0, y: 20, scale: 0.96, duration: 0.5 }, 0.85);
      if (searchRef.current) {
        tl.from(searchRef.current, { opacity: 0, y: 32, duration: 0.55 }, 0.95);
      }
      tl.from(indicatorRef.current, { opacity: 0, duration: 0.4 }, 1.2);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '100dvh', minHeight: 600 }}
    >
      {/* ── Video background ── */}
      <video
        className="hero-video-bg"
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_POSTER_URL}
        tabIndex={-1}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,32,28,0.45) 0%, rgba(15,32,28,0.65) 60%, rgba(15,32,28,0.85) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center pb-20">
        <span ref={eyebrowRef} className="section-eyebrow text-white/60 mb-4">
          TrekSphere — Hành trình của bạn
        </span>

        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight max-w-[900px] mx-auto"
          style={{ letterSpacing: '-0.02em' }}
        >
          Chinh phục những đỉnh cao mới cùng TrekSphere
        </h1>

        <p
          ref={subRef}
          className="mt-6 text-white/85 text-base md:text-lg leading-relaxed max-w-[660px] mx-auto"
        >
          Trải nghiệm trekking chuyên nghiệp, an toàn và bền vững cùng đội ngũ chuyên gia hàng đầu.
          Khám phá vẻ đẹp hùng vĩ của núi rừng Việt Nam qua những hành trình độc bản.
        </p>

        <div ref={ctaRef} className="mt-8">
          <Link to={PATHS.TOURS}>
            <button
              type="button"
              className="px-8 py-3.5 rounded-full bg-white text-primary text-sm font-bold
                shadow-lg hover:bg-white/90 transition-all hover:scale-[1.03] cursor-pointer"
            >
              Khám phá ngay
            </button>
          </Link>
        </div>

        {/* ── Search bar ── */}
        {/* <form
          ref={searchRef}
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] items-center
            max-w-[760px] w-full rounded-2xl md:rounded-full shadow-2xl
            bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden"
        >
          <label
            className="flex items-center gap-2 px-5 py-3.5 border-b md:border-b-0 md:border-r border-white/20
            focus-within:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              aria-label="Điểm đến"
              className="w-full bg-transparent text-sm outline-none text-white placeholder:text-white/55"
            />
          </label>

          <label
            className="flex items-center gap-2 px-5 py-3.5 border-b md:border-b-0 border-white/20
            focus-within:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <input
              type="text"
              placeholder="Thời gian"
              aria-label="Thời gian"
              className="w-full bg-transparent text-sm outline-none text-white placeholder:text-white/55"
            />
          </label>

          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="flex items-center justify-center gap-2 px-6 py-3.5 md:py-0 md:h-full
            text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer
            border-t md:border-t-0 border-white/20
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-sm font-semibold md:hidden">Tìm kiếm</span>
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </form> */}
      </div>

      {/* ── Scroll indicator ── */}
      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
      >
        <span className="text-white/50 text-xs tracking-widest uppercase">Cuộn xuống</span>
        <div className="scroll-indicator">
          <svg
            className="w-5 h-5 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
