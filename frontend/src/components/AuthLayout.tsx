import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainIcon } from "../icons/brainIcon";

interface AuthLayoutProps {
  activeTab: "signin" | "signup";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({
  activeTab,
  title,
  subtitle,
  children,
  footer
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="dark min-h-screen w-full flex bg-[#080d09] selection:bg-green-800 selection:text-white transition-colors duration-200">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#1c2b1e]">

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6b9970]/50 to-transparent" />

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#4a7a50] flex items-center justify-center text-white group-hover:bg-[#5a9060] transition-colors duration-200">
              <BrainIcon />
            </div>
            <span className="text-base font-semibold tracking-tight text-[#c8d9c9]">
              Second Brain
            </span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#6b9970] mb-5">
            Personal knowledge base
          </p>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tighter text-white leading-[1.08] mb-6">
            One place<br />
            for everything<br />
            you save.
          </h1>
          <p className="text-[#8aab8d] text-sm leading-relaxed max-w-xs">
            Videos, tweets, links, and notes — all in one searchable place that actually belongs to you.
          </p>

          {/* Minimal divider list — no icons, no emojis */}
          <div className="mt-10 border-t border-white/10 pt-8 space-y-3">
            {[
              "YouTube videos with embedded previews",
              "Twitter threads saved in context",
              "Web links with rich domain cards",
              "Personal notes, always within reach",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-[5px] w-1 h-1 rounded-full bg-[#6b9970] shrink-0" />
                <span className="text-sm text-[#8aab8d]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="relative z-10">
          <p className="text-xs text-[#4a6b4c]">Built for people who think in tabs.</p>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="relative w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
        <div className="w-full max-w-md bg-white dark:bg-[#121c15] text-stone-800 dark:text-stone-100 rounded-2xl p-6 sm:p-9 shadow-lg shadow-stone-900/8 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-stone-200/70 dark:border-emerald-950/70 animate-fade-in-up transition-colors">

          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#2d4a31] dark:bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <BrainIcon />
              </div>
              <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Second Brain
              </span>
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-[#0c120e] rounded-xl mb-7 border border-stone-200/50 dark:border-emerald-950/80">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "signin"
                  ? "bg-white dark:bg-[#18261e] text-stone-900 dark:text-emerald-300 shadow-xs border border-stone-200/60 dark:border-emerald-800/60 font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "signup"
                  ? "bg-white dark:bg-[#18261e] text-stone-900 dark:text-emerald-300 shadow-xs border border-stone-200/60 dark:border-emerald-800/60 font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {title}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          {children}

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-emerald-950/70 text-center text-sm text-stone-500 dark:text-stone-400">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
