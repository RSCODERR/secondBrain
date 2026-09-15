import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";
import "../App.css";

// ─── Typewriter ────────────────────────────────────────────────────────────────
const WORDS = ["YouTube videos.", "Twitter threads.", "web links.", "personal notes."];

function TypewriterWord() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = WORDS[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else {
      setDeleting(false);
      setIdx((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span className="text-[#5c9964]">
      {displayed}
      <span className="animate-blink">|</span>
    </span>
  );
}

// ─── Section Configuration ─────────────────────────────────────────────────────
const SECTIONS = [
  { id: "hero", label: "01 Hero" },
  { id: "overview", label: "02 Overview" },
  { id: "features", label: "03 Formats" },
  { id: "workflow", label: "04 Workflow" },
  { id: "cta", label: "05 Get Started" },
];

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visited, setVisited] = useState<boolean[]>([true, false, false, false, false]);
  const isScrollingRef = useRef(false);

  const lockScroll = useCallback(() => {
    isScrollingRef.current = true;
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1050); // Matches the 1000ms transition duration
  }, []);

  // Safe navigation to a specific slide
  const goToSlide = useCallback((index: number) => {
    if (index === activeIndex || isScrollingRef.current) return;
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
    lockScroll();
    setActiveIndex(clamped);
    setVisited((prev) => {
      if (prev[clamped]) return prev;
      const next = [...prev];
      next[clamped] = true;
      return next;
    });
  }, [activeIndex, lockScroll]);

  // Wheel handling with smooth lock
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) {
          // Scroll down
          setActiveIndex((cur) => {
            if (cur < SECTIONS.length - 1) {
              const next = cur + 1;
              lockScroll();
              setVisited((v) => {
                if (v[next]) return v;
                const updated = [...v];
                updated[next] = true;
                return updated;
              });
              return next;
            }
            return cur;
          });
        } else {
          // Scroll up
          setActiveIndex((cur) => {
            if (cur > 0) {
              const prev = cur - 1;
              lockScroll();
              setVisited((v) => {
                if (v[prev]) return v;
                const updated = [...v];
                updated[prev] = true;
                return updated;
              });
              return prev;
            }
            return cur;
          });
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [lockScroll]);

  // Touch swipe handling with pull-to-refresh prevention
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Intercept drag gestures so the mobile browser doesn't trigger pull-to-refresh
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      if (e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      // Only trigger if vertical swipe is dominant and passes threshold
      if (Math.abs(diffY) > 30 && Math.abs(diffY) > Math.abs(diffX)) {
        if (diffY > 0) {
          // Swipe up -> scroll down
          if (activeIndex < SECTIONS.length - 1) {
            goToSlide(activeIndex + 1);
          }
        } else {
          // Swipe down -> scroll up
          if (activeIndex > 0) {
            goToSlide(activeIndex - 1);
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setActiveIndex((cur) => {
          if (cur < SECTIONS.length - 1) {
            const next = cur + 1;
            lockScroll();
            setVisited((v) => {
              if (v[next]) return v;
              const updated = [...v];
              updated[next] = true;
              return updated;
            });
            return next;
          }
          return cur;
        });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setActiveIndex((cur) => {
          if (cur > 0) {
            const prev = cur - 1;
            lockScroll();
            setVisited((v) => {
              if (v[prev]) return v;
              const updated = [...v];
              updated[prev] = true;
              return updated;
            });
            return prev;
          }
          return cur;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lockScroll]);

  const progressPercent = (activeIndex / (SECTIONS.length - 1)) * 100;

  return (
    <div className="fullpage-wrapper bg-[#1c2b1e] text-stone-100 select-none">
      
      {/* ── TOP PROGRESS BAR ── */}
      <div className="fixed top-0 inset-x-0 h-1 z-50 bg-black/30 pointer-events-none">
        <div
          className="h-full bg-[#5c9964] transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_0_10px_rgba(92,153,100,0.8)]"
          style={{ width: `${Math.max(6, progressPercent)}%` }}
        />
      </div>

      {/* ── FIXED TOP NAVIGATION ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#1c2b1e]/85 backdrop-blur-md border-b border-white/10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3 md:py-3.5">
          <Link to="/" className="inline-flex items-center gap-2 md:gap-2.5 group">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#2d4a31] flex items-center justify-center text-white group-hover:bg-[#3a5e40] transition-colors shadow-sm">
              <BrainIcon />
            </div>
            <span className="text-sm md:text-base font-bold tracking-tight text-white">Second Brain</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-2.5">
            <Link
              to="/signin"
              className="px-3 py-1 md:px-3.5 md:py-1.5 text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1 md:px-4 md:py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#2d4a31] hover:bg-[#3a5e40] rounded-lg transition-all shadow-sm border border-[#4a7a50]/40 hover:border-[#4a7a50]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── RIGHT VERTICAL PAGINATION DOTS (Tablets & PC) ── */}
      <div className="fixed right-5 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-3.5">
        {SECTIONS.map((sec, idx) => {
          const isActive = activeIndex === idx;
          return (
            <button
              key={sec.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Jump to ${sec.label}`}
              className="group relative flex items-center justify-center p-1 focus:outline-none cursor-pointer"
            >
              {/* Tooltip */}
              <span className="absolute right-full mr-3 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide bg-stone-900/90 text-stone-200 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                {sec.label}
              </span>
              {/* Indicator Pip */}
              <div
                className={`transition-all duration-500 rounded-full ${
                  isActive
                    ? "w-3 h-8 bg-[#5c9964] shadow-[0_0_12px_rgba(92,153,100,0.7)]"
                    : "w-2.5 h-2.5 bg-stone-500/40 hover:bg-stone-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ── BOTTOM LEFT SECTION COUNTER ── */}
      <div className="fixed bottom-4 sm:bottom-5 left-4 sm:left-8 z-40 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-stone-400 bg-black/40 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
        <span className="text-[#5c9964] font-bold">0{activeIndex + 1}</span>
        <span className="text-stone-600">/</span>
        <span>0{SECTIONS.length}</span>
      </div>

      {/* ── FULLPAGE SLIDER TRACK (1000ms luxury easeInOutCubic glide) ── */}
      <div
        className="fullpage-track"
        style={{ transform: `translate3d(0, -${activeIndex * 100}%, 0)` }}
      >

        {/* ════════════════════════════════════════════════════════════════════════
            SLIDE 0: HERO
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="fullpage-slide bg-[#1c2b1e] text-white">
          <div className="absolute top-10 left-10 w-[350px] md:w-[550px] h-[350px] md:h-[550px] bg-[#2d4a31]/50 rounded-full blur-[100px] md:blur-[130px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#1a3d1e]/70 rounded-full blur-[90px] md:blur-[110px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-16 pb-4 md:py-20 flex flex-col justify-center items-center text-center">
            {/* Pill */}
            <div className={`slide-elem ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              <span className="inline-flex items-center gap-1.5 md:gap-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#8aab8d] border border-[#4a7a50]/40 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full bg-[#2d4a31]/40 mb-3 md:mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5c9964] animate-ping" />
                Personal Knowledge Base
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.08] md:leading-[1.05] slide-elem delay-150 ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              One place for
            </h1>
            <div className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.08] md:leading-[1.05] mt-0.5 md:mt-1 slide-elem delay-300 ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              <TypewriterWord />
            </div>

            {/* Subtitle */}
            <p className={`mt-2.5 md:mt-5 text-xs sm:text-base md:text-lg text-[#8aab8d] max-w-sm md:max-w-xl leading-relaxed slide-elem delay-400 ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              Stop scattering bookmarks across browser tabs and apps. Second Brain is a single, searchable vault for everything you discover.
            </p>

            {/* CTAs */}
            <div className={`mt-4 md:mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto slide-elem delay-500 ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-xl bg-white text-[#1c2b1e] text-xs md:text-sm font-bold hover:bg-stone-100 transition-all shadow-lg shadow-black/30 active:scale-[0.98]"
              >
                Start for free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-xl border border-white/20 text-stone-200 text-xs md:text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>

            {/* Sample Mini Preview Cards */}
            <div className={`mt-5 md:mt-10 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 w-full max-w-2xl text-left slide-elem delay-600 ${visited[0] ? "slide-visible" : "slide-hidden"}`}>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-2.5 md:p-3.5 hover:border-[#5c9964]/50 transition-colors">
                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-[9px] md:text-[10px] font-bold">Y</div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-red-300">YouTube</span>
                </div>
                <p className="text-[11px] md:text-xs font-medium text-stone-200 truncate">System Design Masterclass</p>
                <p className="text-[10px] md:text-[11px] text-stone-400">Embedded preview</p>
              </div>

              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-2.5 md:p-3.5 hover:border-[#5c9964]/50 transition-colors">
                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center text-[9px] md:text-[10px] font-bold">T</div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-sky-300">Twitter</span>
                </div>
                <p className="text-[11px] md:text-xs font-medium text-stone-200 truncate">"Write code for reader"</p>
                <p className="text-[10px] md:text-[11px] text-stone-400">Thread bookmark</p>
              </div>

              <div className="hidden md:block bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-3.5 hover:border-[#5c9964]/50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded bg-[#4a7a50]/30 text-[#8aab8d] flex items-center justify-center text-[10px] font-bold">N</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aab8d]">Note</span>
                </div>
                <p className="text-xs font-medium text-stone-200 truncate">Database indexing cheat sheet</p>
                <p className="text-[11px] text-stone-400">Quick personal note</p>
              </div>
            </div>

            {/* Scroll Down Prompt Button */}
            <button
              onClick={() => goToSlide(1)}
              className="mt-4 md:mt-8 inline-flex flex-col items-center gap-1 text-[10px] md:text-xs text-[#8aab8d] hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <span className="tracking-wider uppercase text-[10px] md:text-[11px] font-medium">Scroll to explore</span>
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce-down" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SLIDE 1: OVERVIEW & STATS
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="fullpage-slide bg-[#f5f3ef] text-[#1c2b1e]">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-14 pb-4 md:py-16 flex flex-col justify-center items-center text-center">
            
            <div className={`slide-elem ${visited[1] ? "slide-visible" : "slide-hidden"}`}>
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#4a7a50]">
                Why Second Brain
              </span>
              <h2 className="mt-1 md:mt-2 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1c2b1e]">
                Turn web chaos into personal clarity.
              </h2>
              <p className="mt-1.5 md:mt-3 text-stone-600 max-w-xl mx-auto text-xs sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                Designed for builders, thinkers, and lifelong learners who consume high-value content every day and need instant recall.
              </p>
            </div>

            {/* Stats Grid */}
            <div className={`mt-4 md:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 w-full max-w-3xl slide-elem delay-200 ${visited[1] ? "slide-visible" : "slide-hidden"}`}>
              <div className="bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 md:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2d4a31] tracking-tight">4+</p>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5 md:mt-1">Core formats</p>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 md:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2d4a31] tracking-tight">100%</p>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5 md:mt-1">Private & yours</p>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 md:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2d4a31] tracking-tight">1-Click</p>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5 md:mt-1">Public sharing</p>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 md:p-5 shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2d4a31] tracking-tight">&lt;10ms</p>
                <p className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5 md:mt-1">Instant search</p>
              </div>
            </div>

            {/* 3 Core Highlight Pillars */}
            <div className={`mt-3 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full max-w-4xl text-left slide-elem delay-400 ${visited[1] ? "slide-visible" : "slide-hidden"}`}>
              <div className="flex md:block items-center gap-2.5 md:gap-0 p-2.5 sm:p-3 md:p-4 rounded-xl bg-stone-100/80 border border-stone-200">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-[#2d4a31] text-white flex items-center justify-center text-[10px] md:text-xs font-bold mb-0 md:mb-2 shrink-0">01</div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[#1c2b1e]">Unified Stream</h3>
                  <p className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 leading-snug line-clamp-1 md:line-clamp-none">No more juggling 5 different bookmark folders. One library.</p>
                </div>
              </div>
              <div className="flex md:block items-center gap-2.5 md:gap-0 p-2.5 sm:p-3 md:p-4 rounded-xl bg-stone-100/80 border border-stone-200">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-[#2d4a31] text-white flex items-center justify-center text-[10px] md:text-xs font-bold mb-0 md:mb-2 shrink-0">02</div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[#1c2b1e]">Pure Focus</h3>
                  <p className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 leading-snug line-clamp-1 md:line-clamp-none">Editorial design and zero clutter. Just clean text and notes.</p>
                </div>
              </div>
              <div className="flex md:block items-center gap-2.5 md:gap-0 p-2.5 sm:p-3 md:p-4 rounded-xl bg-stone-100/80 border border-stone-200">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-[#2d4a31] text-white flex items-center justify-center text-[10px] md:text-xs font-bold mb-0 md:mb-2 shrink-0">03</div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-[#1c2b1e]">Instant Recall</h3>
                  <p className="text-[10px] md:text-xs text-stone-500 mt-0.5 md:mt-1 leading-snug line-clamp-1 md:line-clamp-none">Filter by tag or search keyword to retrieve anything fast.</p>
                </div>
              </div>
            </div>

            {/* Next Section Button */}
            <button
              onClick={() => goToSlide(2)}
              className="mt-3.5 md:mt-8 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#1c2b1e] transition-colors cursor-pointer focus:outline-none"
            >
              <span>See supported formats</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SLIDE 2: CONTENT TYPES & FORMATS
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="fullpage-slide bg-[#142316] text-white">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-14 pb-4 md:py-16 flex flex-col justify-center items-center text-center">
            
            <div className={`slide-elem ${visited[2] ? "slide-visible" : "slide-hidden"}`}>
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#5c9964]">
                What You Can Save
              </span>
              <h2 className="mt-1 md:mt-2 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Every format, neatly organized.
              </h2>
              <p className="mt-1.5 md:mt-3 text-stone-300 max-w-lg mx-auto text-xs sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                Add content from anywhere on the web. Second Brain automatically formats and structures your saves.
              </p>
            </div>

            {/* 4 Cards Grid - 2x2 on both mobile & desktop for balanced fit */}
            <div className={`mt-4 md:mt-10 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-3xl text-left slide-elem delay-200 ${visited[2] ? "slide-visible" : "slide-hidden"}`}>
              {/* YouTube Card */}
              <div className="bg-[#1c2b1e] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-[#5c9964]/60 transition-all shadow-md">
                <div className="flex items-center justify-between mb-1.5 md:mb-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] md:text-xs font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-red-300 uppercase tracking-wider">YouTube</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-stone-400 bg-white/5 px-2 py-0.5 rounded">Player</span>
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate md:whitespace-normal">Live Video Previews</h4>
                <p className="text-[10px] md:text-xs text-stone-400 mt-0.5 md:mt-1 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">Paste video URLs to watch directly in your dashboard.</p>
                <div className="mt-1.5 md:mt-3 flex gap-1 md:gap-1.5">
                  <span className="text-[9px] md:text-[10px] bg-[#2d4a31] text-[#8aab8d] px-1.5 py-0.5 rounded">#engineering</span>
                </div>
              </div>

              {/* Twitter Card */}
              <div className="bg-[#1c2b1e] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-[#5c9964]/60 transition-all shadow-md">
                <div className="flex items-center justify-between mb-1.5 md:mb-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] md:text-xs font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-sky-300 uppercase tracking-wider">Twitter</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-stone-400 bg-white/5 px-2 py-0.5 rounded">Threads</span>
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate md:whitespace-normal">Threads in Context</h4>
                <p className="text-[10px] md:text-xs text-stone-400 mt-0.5 md:mt-1 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">Save tweets and insightful threads with full author info.</p>
                <div className="mt-1.5 md:mt-3 flex gap-1 md:gap-1.5">
                  <span className="text-[9px] md:text-[10px] bg-[#2d4a31] text-[#8aab8d] px-1.5 py-0.5 rounded">#threads</span>
                </div>
              </div>

              {/* Web Link Card */}
              <div className="bg-[#1c2b1e] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-[#5c9964]/60 transition-all shadow-md">
                <div className="flex items-center justify-between mb-1.5 md:mb-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] md:text-xs font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-amber-300 uppercase tracking-wider">Links</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-stone-400 bg-white/5 px-2 py-0.5 rounded">URLs</span>
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate md:whitespace-normal">Rich Bookmarks</h4>
                <p className="text-[10px] md:text-xs text-stone-400 mt-0.5 md:mt-1 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">Clean preview cards with domain tags for fast scanning.</p>
                <div className="mt-1.5 md:mt-3 flex gap-1 md:gap-1.5">
                  <span className="text-[9px] md:text-[10px] bg-[#2d4a31] text-[#8aab8d] px-1.5 py-0.5 rounded">#reading</span>
                </div>
              </div>

              {/* Note Card */}
              <div className="bg-[#1c2b1e] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-5 hover:border-[#5c9964]/60 transition-all shadow-md">
                <div className="flex items-center justify-between mb-1.5 md:mb-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-[#5c9964]/30 text-[#8aab8d] flex items-center justify-center text-[10px] md:text-xs font-bold">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-[#8aab8d] uppercase tracking-wider">Notes</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-stone-400 bg-white/5 px-2 py-0.5 rounded">Personal</span>
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-stone-100 truncate md:whitespace-normal">Quick Notes</h4>
                <p className="text-[10px] md:text-xs text-stone-400 mt-0.5 md:mt-1 leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none">Jot down thoughts and code snippets in seconds.</p>
                <div className="mt-1.5 md:mt-3 flex gap-1 md:gap-1.5">
                  <span className="text-[9px] md:text-[10px] bg-[#2d4a31] text-[#8aab8d] px-1.5 py-0.5 rounded">#thoughts</span>
                </div>
              </div>
            </div>

            {/* Next Section Button */}
            <button
              onClick={() => goToSlide(3)}
              className="mt-3.5 md:mt-8 inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <span>How it works</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SLIDE 3: HOW IT WORKS
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="fullpage-slide bg-[#f5f3ef] text-[#1c2b1e]">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-14 pb-4 md:py-16 flex flex-col justify-center items-center text-center">
            
            <div className={`slide-elem ${visited[3] ? "slide-visible" : "slide-hidden"}`}>
              <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#4a7a50]">
                Simple Workflow
              </span>
              <h2 className="mt-1 md:mt-2 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#1c2b1e]">
                Three steps, zero friction.
              </h2>
              <p className="mt-1.5 md:mt-3 text-stone-600 max-w-md mx-auto text-xs sm:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                Everything is engineered to get out of your way and let you collect what matters.
              </p>
            </div>

            {/* Steps Row - compact horizontal rows on mobile, 3 vertical cards on desktop */}
            <div className={`mt-4 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 w-full max-w-4xl text-left slide-elem delay-200 ${visited[3] ? "slide-visible" : "slide-hidden"}`}>
              <div className="flex md:block items-center md:items-start gap-3 md:gap-0 bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 sm:p-4 md:p-6 shadow-sm">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#2d4a31] text-white flex items-center justify-center text-xs md:text-sm font-black mb-0 md:mb-4 shrink-0 shadow-sm">
                  01
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-[#1c2b1e] mb-0.5 md:mb-1.5">Sign up in 30 seconds</h3>
                  <p className="text-[11px] md:text-sm text-stone-500 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none">
                    Create your private brain with username and password. No credit card required.
                  </p>
                </div>
              </div>

              <div className="flex md:block items-center md:items-start gap-3 md:gap-0 bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 sm:p-4 md:p-6 shadow-sm">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#2d4a31] text-white flex items-center justify-center text-xs md:text-sm font-black mb-0 md:mb-4 shrink-0 shadow-sm">
                  02
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-[#1c2b1e] mb-0.5 md:mb-1.5">Paste links or notes</h3>
                  <p className="text-[11px] md:text-sm text-stone-500 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none">
                    Drop a YouTube video, tweet, web page, or personal thought from any device.
                  </p>
                </div>
              </div>

              <div className="flex md:block items-center md:items-start gap-3 md:gap-0 bg-white rounded-xl md:rounded-2xl border border-stone-200 p-3 sm:p-4 md:p-6 shadow-sm">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#2d4a31] text-white flex items-center justify-center text-xs md:text-sm font-black mb-0 md:mb-4 shrink-0 shadow-sm">
                  03
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-[#1c2b1e] mb-0.5 md:mb-1.5">Search & share anytime</h3>
                  <p className="text-[11px] md:text-sm text-stone-500 leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-none">
                    Filter by tags, search instantly, or share your knowledge vault with a public link.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Section Button */}
            <button
              onClick={() => goToSlide(4)}
              className="mt-4 md:mt-10 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#1c2b1e] transition-colors cursor-pointer focus:outline-none"
            >
              <span>Ready to start?</span>
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SLIDE 4: TESTIMONIAL, FINAL CTA & FOOTER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="fullpage-slide bg-[#111e13] text-white flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 pt-14 pb-4 md:py-12 text-center max-w-4xl mx-auto">
            
            {/* Testimonial Quote */}
            <div className={`border-l-2 border-[#5c9964] pl-3.5 md:pl-6 text-left max-w-xl mx-auto mb-4 md:mb-10 slide-elem ${visited[4] ? "slide-visible" : "slide-hidden"}`}>
              <blockquote className="text-xs sm:text-base md:text-xl font-medium text-stone-200 italic leading-snug">
                "I used to screenshot everything and lose it forever in my gallery. Now I paste it into Second Brain, and it's actually searchable when I need it."
              </blockquote>
              <p className="mt-1 md:mt-2 text-[10px] md:text-xs font-semibold text-[#8aab8d]">
                — Reader & developer with 60+ organized saves
              </p>
            </div>

            {/* Big CTA */}
            <div className={`slide-elem delay-200 ${visited[4] ? "slide-visible" : "slide-hidden"}`}>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">
                Stop losing good stuff to the void.
              </h2>
              <p className="mt-1.5 md:mt-3 text-stone-300 text-xs sm:text-base max-w-md mx-auto leading-relaxed">
                Build your curated vault of ideas today. Free, fast, and organized forever.
              </p>

              <div className="mt-4 md:mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl bg-white text-[#1c2b1e] text-xs md:text-sm font-bold hover:bg-stone-100 transition-all shadow-xl shadow-black/40 active:scale-[0.98]"
                >
                  Build your brain
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl border border-white/20 text-stone-200 text-xs md:text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Back to top button */}
            <button
              onClick={() => goToSlide(0)}
              className="mt-4 md:mt-8 inline-flex items-center gap-1.5 text-xs text-[#8aab8d] hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <svg className="w-3.5 h-3.5 rotate-180" viewBox="0 0 16 16" fill="none">
                <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back to top</span>
            </button>
          </div>

          {/* Minimal Footer */}
          <footer className="w-full border-t border-white/10 py-3 md:py-4 px-4 sm:px-8 bg-black/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto flex flex-row items-center justify-between gap-2 text-[11px] md:text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#2d4a31] flex items-center justify-center text-white">
                  <BrainIcon />
                </div>
                <span className="font-semibold text-stone-300">Second Brain</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <Link to="/signin" className="hover:text-stone-200 transition-colors">Sign in</Link>
                <Link to="/signup" className="hover:text-stone-200 transition-colors">Register</Link>
              </div>
            </div>
          </footer>
        </section>

      </div>
    </div>
  );
}
