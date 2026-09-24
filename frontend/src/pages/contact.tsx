import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { GitHubButton } from "../components/GitHubButton";
import { BrainIcon } from "../icons/brainIcon";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How soon will I receive a response?",
    answer:
      "We actively monitor our inbox and typically respond within 12 to 24 hours. For critical bug reports or urgent queries, we aim to respond even faster.",
  },
  {
    question: "Can I contribute to Second Brain on GitHub?",
    answer:
      "Yes, absolutely! Second Brain is completely open source. You can fork the repository at github.com/RSCODERR/secondBrain, submit pull requests, report issues, or propose new architectural enhancements.",
  },
  {
    question: "Where should I report bugs or UI glitches?",
    answer:
      "You can submit them directly using the contact form on this page, through the dedicated 'Report a Bug' card in your Account Settings, or by creating an issue on our GitHub repository.",
  },
  {
    question: "Can I request new content types and integrations?",
    answer:
      "Definitely! We are continually expanding supported embeds and formats (including Notion, Twitter/X, YouTube, audio notes, and markdown documents). Let us know what you want to see next!",
  },
  {
    question: "How is my personal knowledge base kept secure?",
    answer:
      "Your personal notes and metadata are encrypted in transit and securely persisted in MongoDB. Shareable links are only created and accessible when you explicitly choose to publish them.",
  },
];

export default function ContactPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(label);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/contact`,
        {
          name: name.trim(),
          email: email.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
        },
        { withCredentials: true }
      );

      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          err.response?.data?.error ||
            "Unable to dispatch message right now. You can email us directly at secondbrain.in.app@gmail.com."
        );
      } else {
        setErrorMsg("Network error. Please try again or email us directly.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#070b08] text-stone-900 dark:text-stone-100 transition-colors duration-300 relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* ─── DYNAMIC BACKGROUND AMBIENT PARTICLES ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Orb 1: Emerald glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 sm:w-[520px] sm:h-[520px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] animate-float-1" />

        {/* Floating Orb 2: Teal / Cyan accent */}
        <div className="absolute top-1/3 -right-32 w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-teal-500/10 dark:bg-emerald-600/10 blur-[130px] animate-float-2" />

        {/* Floating Orb 3: Subtle ambient pulse */}
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-emerald-400/5 blur-[100px] animate-pulse-glow" />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ─── TOP NAVIGATION HEADER ─── */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#070b08]/85 backdrop-blur-md border-b border-stone-200/80 dark:border-emerald-950/70 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group select-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2d4a31] to-[#1a3321] dark:from-emerald-600 dark:to-emerald-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_14px_rgba(16,185,129,0.35)] transition-all">
              <BrainIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-white">
                Second Brain
              </span>
              <span className="text-[10px] text-stone-500 dark:text-emerald-400/80 font-medium">
                Support & Community
              </span>
            </div>
          </Link>

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <GitHubButton />

            <ThemeToggle />

            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white bg-stone-100 hover:bg-stone-200/70 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-stone-200 dark:border-emerald-900/70 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Dashboard
              </button>
            ) : (
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white bg-stone-100 hover:bg-stone-200/70 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-stone-200 dark:border-emerald-900/70 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Home
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20">
        {/* ══════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════ */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          {/* Animated Pulsing Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-6 shadow-xs select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Always Open for Feedback & Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]">
            Let's connect & build{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200 bg-clip-text text-transparent">
              something remarkable
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
            Whether you have a question, feature request, found a bug, or want to
            contribute to the open source project — our doors are always open.
          </p>

          {/* Quick Highlight Badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-[#121c15] border border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              100% Open Source
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-[#121c15] border border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Fast &lt; 24h Responses
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-[#121c15] border border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Direct Builder Access
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            INTERACTIVE 2-COLUMN SHOWCASE
        ══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* ── LEFT COLUMN: DIRECT CHANNELS (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Card 1: Official Email Channel */}
            <div className="group relative p-6 rounded-2xl bg-white/90 dark:bg-[#121c15]/90 border border-stone-200 dark:border-emerald-950/70 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Official Inbox
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                    Email Directly
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Ideal for support inquiries, account assistance, or private discussions.
                  </p>
                </div>
              </div>

              {/* Email Pill Box */}
              <div className="mt-5 p-3.5 rounded-xl bg-stone-50 dark:bg-[#0c140e] border border-stone-200/80 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-mono font-semibold text-stone-800 dark:text-emerald-300 truncate">
                    secondbrain.in.app@gmail.com
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("secondbrain.in.app@gmail.com", "official")}
                  title="Copy email to clipboard"
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-[#162319] hover:bg-stone-200/60 dark:hover:bg-emerald-900/60 border border-stone-200 dark:border-emerald-800/60 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  {copiedEmail === "official" ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Link: mailto */}
              <div className="mt-3.5 flex items-center justify-between text-xs">
                <a
                  href="mailto:secondbrain.in.app@gmail.com?subject=Inquiry%20from%20Second%20Brain"
                  className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold group-hover:underline cursor-pointer"
                >
                  Open in mail client
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <span className="text-[11px] text-stone-400 dark:text-stone-500">Replies &lt; 24h</span>
              </div>
            </div>

            {/* Card 2: GitHub & Developer Hub */}
            <div className="group relative p-6 rounded-2xl bg-white/90 dark:bg-[#121c15]/90 border border-stone-200 dark:border-emerald-950/70 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 dark:from-stone-800 dark:to-stone-950 border border-stone-700/40 flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Open Source Codebase
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                    GitHub Repository
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Explore the code, report issues, or star the project on GitHub.
                  </p>
                </div>
              </div>

              {/* Repo Tag Box */}
              <div className="mt-5 p-3.5 rounded-xl bg-stone-50 dark:bg-[#0c140e] border border-stone-200/80 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-mono font-semibold text-stone-800 dark:text-emerald-300 truncate">
                    github.com/RSCODERR/secondBrain
                  </span>
                </div>
                <a
                  href="https://github.com/RSCODERR/secondBrain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-[#162319] hover:bg-stone-200/60 dark:hover:bg-emerald-900/60 border border-stone-200 dark:border-emerald-800/60 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Visit</span>
                  <svg className="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              </div>

              {/* GitHub Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <a
                  href="https://github.com/RSCODERR/secondBrain/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-stone-100/70 hover:bg-stone-100 dark:bg-[#0e1711] dark:hover:bg-[#142017] border border-stone-200/70 dark:border-emerald-900/40 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-amber-500 text-sm">🐛</span>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-stone-900 dark:text-white truncate">Open Issue</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">Report bugs</span>
                  </div>
                </a>

                <a
                  href="https://github.com/RSCODERR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-stone-100/70 hover:bg-stone-100 dark:bg-[#0e1711] dark:hover:bg-[#142017] border border-stone-200/70 dark:border-emerald-900/40 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span className="text-emerald-500 text-sm">👨‍💻</span>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-stone-900 dark:text-white truncate">@RSCODERR</span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">Creator profile</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Card 3: Live Status & Location Badge */}
            <div className="p-5 rounded-2xl bg-white/70 dark:bg-[#0e1611]/70 border border-stone-200/80 dark:border-emerald-950/60 shadow-xs flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-stone-900 dark:text-white">Active Timezone: IST (UTC+5:30)</div>
                  <div className="text-stone-500 dark:text-stone-400 text-[11px] mt-0.5">Global support • English & Hindi</div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE DISPATCHER FORM (7 cols) ── */}
          <div className="lg:col-span-7">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#121c15]/95 border border-stone-200 dark:border-emerald-950/70 shadow-lg dark:shadow-2xl transition-all duration-300">
              {/* Form Title & Subtitle */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-100 dark:border-emerald-950/60">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
                    Send a Direct Message
                    <span className="text-lg">✉️</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Delivered directly to our team inbox. We'll reply straight to your email.
                  </p>
                </div>
              </div>

              {submitted ? (
                /* Success State Banner */
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-lg">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 max-w-md">
                    Thank you for reaching out! Your note has landed in our team inbox at{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">secondbrain.in.app@gmail.com</strong>.
                    We will review it and reply back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                /* The Contact Form */
                <form onSubmit={handleSubmit} className="pt-6 flex flex-col gap-4">
                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        Your Name <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Walker"
                        className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0c140e] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0c140e] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        Topic / Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0c140e] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-xs cursor-pointer"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Feature Request">Feature Request / Idea</option>
                        <option value="Bug Report">Bug / Issue Report</option>
                        <option value="Open Source Collaboration">Open Source / Collaboration</option>
                        <option value="Account / Auth Support">Account / Login Support</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        Subject <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your note"
                        maxLength={120}
                        className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0c140e] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Row 3: Message Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                        Message <span className="text-emerald-500">*</span>
                      </label>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        {message.length} / 1000
                      </span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      maxLength={1000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here in detail. If reporting a bug, please include steps to reproduce..."
                      className="w-full px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0c140e] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-xs resize-none"
                    />
                  </div>

                  {/* Error Notification Alert */}
                  {errorMsg && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-300 flex items-start gap-2.5">
                      <svg className="w-4 h-4 shrink-0 text-red-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v4m0 4h.01" />
                      </svg>
                      <div className="flex-1">
                        <div>{errorMsg}</div>
                        <a
                          href={`mailto:secondbrain.in.app@gmail.com?subject=${encodeURIComponent(
                            subject || "Second Brain Inquiry"
                          )}&body=${encodeURIComponent(
                            `From: ${name} (${email})\nCategory: ${category}\n\n${message}`
                          )}`}
                          className="mt-1.5 inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 underline hover:no-underline"
                        >
                          Click here to send directly via email client instead
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 text-center sm:text-left">
                      Protected by Second Brain security • No spam guaranteed
                    </span>

                    <button
                      type="submit"
                      disabled={loading || !name.trim() || !email.trim() || !subject.trim() || !message.trim()}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                          <span>Dispatching…</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FREQUENTLY ASKED QUESTIONS SECTION
        ══════════════════════════════════════════ */}
        <div className="mt-16 pt-12 border-t border-stone-200/80 dark:border-emerald-950/70 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Quick Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
              Everything you need to know about contacting us, contributing, and getting support.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200/80 dark:border-emerald-950/70 bg-white/70 dark:bg-[#121c15]/60 overflow-hidden transition-all duration-200 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                      {item.question}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center bg-stone-100 dark:bg-[#162319] text-stone-600 dark:text-emerald-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-emerald-950/40">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CREATOR & COMMUNITY FOOTER BANNER
        ══════════════════════════════════════════ */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-[#0c140e] dark:to-[#070b08] border border-emerald-500/20 dark:border-emerald-900/40 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
            <span>Built by</span>
            <a
              href="https://github.com/RSCODERR"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-emerald-500 font-bold"
            >
              @RSCODERR
            </a>
            <span>• Open Source Knowledge Management</span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-lg mb-5">
            Second Brain is crafted with React, TypeScript, TailwindCSS, Express, and MongoDB.
            Star the repo to show support or check the codebase.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/RSCODERR/secondBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Star on GitHub
            </a>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#162319] hover:bg-stone-100 dark:hover:bg-emerald-950/70 border border-stone-200 dark:border-emerald-800/60 text-stone-700 dark:text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
              </svg>
              Back to Top
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
