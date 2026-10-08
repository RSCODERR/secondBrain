import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";
import { SparkleIcon } from "../icons/sparkleIcon";
import { ThemeToggle } from "../components/ThemeToggle";
import { GitHubButton } from "../components/GitHubButton";
import "../App.css";

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
    <span className="text-[#5c9964] dark:text-emerald-400">
      {displayed}
      <span className="animate-blink">|</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a2a1c] dark:bg-[#070b08] text-stone-100 transition-colors duration-300">

      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-[#1a2a1c]/90 dark:bg-[#070b08]/95 backdrop-blur-md border-b border-white/10 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3.5">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2d4a31] dark:bg-emerald-700/80 flex items-center justify-center text-white shadow-sm">
              <BrainIcon />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Second Brain</span>
          </Link>
          <div className="flex items-center gap-2">
            <GitHubButton />
            <div className="hidden sm:inline-flex items-center">
              <ThemeToggle />
            </div>
            <Link
              to="/contact"
              className="hidden sm:inline-block px-2.5 py-1.5 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              Contact
            </Link>
            <Link
              to="/signin"
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#2d4a31] dark:bg-emerald-600 hover:bg-[#3a5e40] dark:hover:bg-emerald-500 rounded-lg transition-colors border border-[#4a7a50]/30 dark:border-emerald-500/30"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2d4a31]/25 dark:bg-emerald-950/25 rounded-full blur-[120px] pointer-events-none" />

        <h1 className="relative text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[1.05] text-white">
          One place to save<br />
          <TypewriterWord />
        </h1>

        <p className="relative mt-5 sm:mt-6 text-sm sm:text-lg text-[#8aab8d] dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
          Second Brain is a personal knowledge vault for YouTube videos, tweets, web links, and notes. Save once, summarize with AI, search semantically, and share when ready.
        </p>

        <div className="relative mt-8 flex flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-white dark:bg-emerald-500 text-[#1a2a1c] dark:text-[#060a07] text-sm font-bold hover:bg-stone-100 dark:hover:bg-emerald-400 transition-all shadow-lg shadow-black/25"
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl border border-white/20 dark:border-white/10 text-stone-200 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
          >
            Sign in
          </Link>
        </div>

        {/* Sample content preview cards */}
        <div className="relative mt-14 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
          <div className="bg-white/5 dark:bg-[#111c14]/80 border border-white/10 dark:border-emerald-900/40 rounded-xl p-3.5 hover:border-[#5c9964]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-300">YouTube</span>
            </div>
            <p className="text-xs font-medium text-stone-200">System Design Masterclass</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Embedded player</p>
          </div>

          <div className="bg-white/5 dark:bg-[#111c14]/80 border border-white/10 dark:border-emerald-900/40 rounded-xl p-3.5 hover:border-[#5c9964]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">X</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">Twitter</span>
            </div>
            <p className="text-xs font-medium text-stone-200">&ldquo;Write code for the reader&rdquo;</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Thread bookmark</p>
          </div>

          <div className="hidden sm:block bg-white/5 dark:bg-[#111c14]/80 border border-white/10 dark:border-emerald-900/40 rounded-xl p-3.5 hover:border-[#5c9964]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-[#4a7a50]/30 text-[#8aab8d] dark:text-emerald-300 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aab8d] dark:text-emerald-300">Note</span>
            </div>
            <p className="text-xs font-medium text-stone-200">Database indexing cheat sheet</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Personal note</p>
          </div>
        </div>
      </section>

      {/* WHY SECOND BRAIN */}
      <section className="bg-[#f5f3ef] dark:bg-[#0c120e] text-[#1c2b1e] dark:text-stone-100 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase text-[#4a7a50] dark:text-emerald-400">What it does</p>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-[#1c2b1e] dark:text-white">
              Stop scattering links across 6 different apps.
            </h2>
            <p className="mt-4 text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              Most people save content to browser bookmarks, screenshots, notes apps, and DMs. None of it is searchable or organized. Second Brain puts it all in one place with tags, instant search, and intelligent retrieval.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black mb-3">01</div>
              <h3 className="text-sm font-bold text-[#1c2b1e] dark:text-stone-100">One unified library</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Videos, tweets, links, and notes all in one searchable place. No more jumping between tabs.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black mb-3">02</div>
              <h3 className="text-sm font-bold text-[#1c2b1e] dark:text-stone-100">Search and tags</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Tag anything when you save it. Search by keyword or filter by tag to find what you need without scrolling.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/80 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black mb-3">03</div>
              <h3 className="text-sm font-bold text-[#1c2b1e] dark:text-stone-100">Share a public link</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Generate a read-only link to your vault and share your curated collection with anyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT-IN AI FEATURES */}
      <section className="bg-[#142316] dark:bg-[#080d09] text-white transition-colors duration-300 border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#5c9964] dark:text-emerald-400 text-xs font-semibold mb-3">
              <SparkleIcon size="sm" />
              <span>Built-in Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              An AI that actually knows what you saved.
            </h2>
            <p className="mt-4 text-stone-300 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              Standard chatbots know the internet, but they do not know your personal notes. Second Brain connects an AI directly to your vault for citations, summaries, and semantic retrieval.
            </p>
          </div>

          {/* AI Feature Grid & Preview */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 4 Feature Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-[#1c2b1e] dark:bg-[#101912] border border-white/10 dark:border-emerald-950/70 rounded-2xl p-5 hover:border-[#5c9964]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 className="text-sm font-bold text-stone-100">Ask Your Brain</h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Chat with an assistant grounded in your library. It answers questions and provides direct citations linking to your saved notes.
                </p>
              </div>

              <div className="bg-[#1c2b1e] dark:bg-[#101912] border border-white/10 dark:border-emerald-950/70 rounded-2xl p-5 hover:border-[#5c9964]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <h3 className="text-sm font-bold text-stone-100">1-Click Summaries</h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Generate high-density TL;DR summaries and core takeaways for articles, videos, or lengthy notes without reading through everything again.
                </p>
              </div>

              <div className="bg-[#1c2b1e] dark:bg-[#101912] border border-white/10 dark:border-emerald-950/70 rounded-2xl p-5 hover:border-[#5c9964]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3 className="text-sm font-bold text-stone-100">Semantic Search</h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Find content by conceptual meaning. Searching for &ldquo;latency&rdquo; surfaces your notes on database indexing and Redis caching.
                </p>
              </div>

              <div className="bg-[#1c2b1e] dark:bg-[#101912] border border-white/10 dark:border-emerald-950/70 rounded-2xl p-5 hover:border-[#5c9964]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                </div>
                <h3 className="text-sm font-bold text-stone-100">Smart Tagging</h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Second Brain evaluates incoming content and automatically suggests taxonomy tags so your library stays organized effortlessly.
                </p>
              </div>

            </div>

            {/* Right Interactive Mockup Showcase */}
            <div className="lg:col-span-5 bg-[#0e1710] dark:bg-[#0c130d] border border-emerald-900/50 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                      <SparkleIcon size="sm" />
                    </div>
                    <span className="text-xs font-bold text-stone-200">Ask Your Brain</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Active Context: 48 items
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="mt-4 space-y-3.5">
                  
                  {/* User query */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-left">
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">You asked</p>
                    <p className="text-xs text-stone-200 mt-1 font-medium">
                      What are my saved notes on database indexing strategies?
                    </p>
                  </div>

                  {/* AI Response with realistic citation */}
                  <div className="bg-[#152317] border border-emerald-900/60 rounded-xl p-3.5 text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 text-[11px] font-bold">
                      <SparkleIcon size="sm" />
                      <span>Second Brain AI</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Based on your notes, here are the key strategies:
                    </p>
                    <ul className="text-xs text-stone-300 mt-2 space-y-1.5 list-disc list-inside">
                      <li>Use composite indexes following the leftmost prefix rule for compound filters.</li>
                      <li>B-tree indexes optimize range scans; hash indexes serve exact key lookups.</li>
                    </ul>

                    {/* Cited sources */}
                    <div className="mt-3 pt-2.5 border-t border-emerald-900/40">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Referenced from your vault</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-md font-mono">
                          Database indexing cheat sheet
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-md font-mono">
                          System Design Masterclass
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                <span>Direct keyboard shortcut</span>
                <kbd className="font-mono bg-white/10 text-stone-200 px-2 py-0.5 rounded text-[10px]">Cmd + J</kbd>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CONTENT FORMATS */}
      <section className="bg-[#f5f3ef] dark:bg-[#0c120e] text-[#1c2b1e] dark:text-stone-100 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase text-[#4a7a50] dark:text-emerald-400">Supported formats</p>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-[#1c2b1e] dark:text-white">
              Four types of content, neatly organized.
            </h2>
            <p className="mt-4 text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              Paste a link or type a note. Second Brain handles the formatting and keeps it structured.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-[#101912] border border-stone-200 dark:border-emerald-950/70 rounded-2xl p-4 sm:p-6 hover:border-[#5c9964]/40 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </span>
                <span className="text-xs font-bold text-red-600 dark:text-red-300 uppercase tracking-wider">YouTube</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1c2b1e] dark:text-stone-100">Video Previews</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Paste a YouTube URL and watch it directly in your dashboard without switching tabs.</p>
              <div className="mt-3"><span className="text-[10px] bg-stone-100 dark:bg-emerald-950 text-[#4a7a50] dark:text-emerald-300 px-2 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">#engineering</span></div>
            </div>

            <div className="bg-white dark:bg-[#101912] border border-stone-200 dark:border-emerald-950/70 rounded-2xl p-4 sm:p-6 hover:border-[#5c9964]/40 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-500 dark:text-sky-400 flex items-center justify-center text-xs font-bold">X</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider">Twitter</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1c2b1e] dark:text-stone-100">Thread Bookmarks</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Save tweets and threads with author info preserved. Read them later in a clean format.</p>
              <div className="mt-3"><span className="text-[10px] bg-stone-100 dark:bg-emerald-950 text-[#4a7a50] dark:text-emerald-300 px-2 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">#threads</span></div>
            </div>

            <div className="bg-white dark:bg-[#101912] border border-stone-200 dark:border-emerald-950/70 rounded-2xl p-4 sm:p-6 hover:border-[#5c9964]/40 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">Links</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1c2b1e] dark:text-stone-100">Rich Bookmarks</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Save any web page as a bookmark card. Preview the title and domain at a glance.</p>
              <div className="mt-3"><span className="text-[10px] bg-stone-100 dark:bg-emerald-950 text-[#4a7a50] dark:text-emerald-300 px-2 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">#reading</span></div>
            </div>

            <div className="bg-white dark:bg-[#101912] border border-stone-200 dark:border-emerald-950/70 rounded-2xl p-4 sm:p-6 hover:border-[#5c9964]/40 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-md bg-[#5c9964]/30 text-[#4a7a50] dark:text-emerald-300 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </span>
                <span className="text-xs font-bold text-[#4a7a50] dark:text-emerald-300 uppercase tracking-wider">Notes</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1c2b1e] dark:text-stone-100">Personal Notes</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">Write quick thoughts, code snippets, or ideas. Stored and searchable like everything else.</p>
              <div className="mt-3"><span className="text-[10px] bg-stone-100 dark:bg-emerald-950 text-[#4a7a50] dark:text-emerald-300 px-2 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">#thoughts</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#142316] dark:bg-[#080d09] text-white transition-colors duration-300 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold tracking-widest uppercase text-[#5c9964] dark:text-emerald-400">How it works</p>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight text-white">
              Three simple steps.
            </h2>
            <p className="mt-4 text-stone-300 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
              No complicated configuration. No external plugins required.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#1c2b1e] dark:bg-[#121c15] rounded-2xl border border-white/10 dark:border-emerald-950/80 p-6 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-sm font-black mb-4">01</div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-2">Create an account</h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">Sign up with a username and password. No credit card required. Your vault is private by default.</p>
            </div>

            <div className="bg-[#1c2b1e] dark:bg-[#121c15] rounded-2xl border border-white/10 dark:border-emerald-950/80 p-6 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-sm font-black mb-4">02</div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-2">Save what you find</h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">Paste a YouTube URL, tweet, web page, or write a note. Let the AI suggest relevant tags.</p>
            </div>

            <div className="bg-[#1c2b1e] dark:bg-[#121c15] rounded-2xl border border-white/10 dark:border-emerald-950/80 p-6 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#2d4a31] dark:bg-emerald-600 text-white flex items-center justify-center text-sm font-black mb-4">03</div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-2">Search, summarize, and ask</h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">Search by keyword or meaning. Generate 1-click summaries or chat with your vault to recall anything.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#111e13] dark:bg-[#050806] text-white transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Start building your knowledge vault.
          </h2>
          <p className="mt-4 text-stone-300 dark:text-stone-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Free to use. No credit card. Your data stays private until you choose to share it.
          </p>
          <div className="mt-8 flex flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-white dark:bg-emerald-500 text-[#1c2b1e] dark:text-[#060a07] text-sm font-bold hover:bg-stone-100 dark:hover:bg-emerald-400 transition-all shadow-xl shadow-black/30"
            >
              Create your account
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl border border-white/20 dark:border-white/10 text-stone-200 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/40 dark:bg-black/60 border-t border-white/10 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2d4a31] dark:bg-emerald-700 flex items-center justify-center text-white">
              <BrainIcon />
            </div>
            <span className="font-semibold text-stone-300">Second Brain</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link to="/signin" className="hover:text-stone-200 transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-stone-200 transition-colors">Register</Link>
            <Link to="/contact" className="hover:text-stone-200 transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-stone-200 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-stone-200 transition-colors">Terms of Service</Link>
          </div>
          <p className="text-stone-500">&copy; {new Date().getFullYear()} Second Brain</p>
        </div>
      </footer>
    </div>
  );
}
