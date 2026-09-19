interface GitHubButtonProps {
  className?: string;
  repoUrl?: string;
}

/**
 * Creative GitHub Capsule Pill Button designed to pair harmoniously with the Day/Night ThemeToggle.
 * - Same 32px height and rounded-full capsule form factor.
 * - Prominent 20px Octocat logo + clean "GitHub" label + sleek arrow indicator.
 * - No star begging: pure, confident open-source repository link.
 */
export function GitHubButton({
  className = "",
  repoUrl = "https://github.com/RSCODERR/secondBrain",
}: GitHubButtonProps) {
  return (
    <a
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="View RSCODERR/secondBrain on GitHub"
      aria-label="View RSCODERR/secondBrain source code on GitHub"
      className={`group relative hidden md:inline-flex items-center h-[32px] px-3.5 gap-2 rounded-full overflow-hidden transition-all duration-300 ease-out cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 shrink-0 bg-gradient-to-r from-[#121e15] via-[#16271c] to-[#111e14] dark:from-[#0d1610] dark:via-[#132217] dark:to-[#0c160f] border border-emerald-500/40 dark:border-emerald-400/30 hover:border-emerald-400/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.35)] hover:shadow-[0_0_16px_rgba(16,185,129,0.35)] ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Background ambient glow on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/15 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Prominent Large GitHub Octocat (20px x 20px, crisp pure white) */}
      <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
        <svg
          className="w-5 h-5 fill-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      </div>

      {/* GitHub Brand Typography */}
      <span className="relative z-10 text-[13px] font-bold text-white group-hover:text-emerald-300 transition-colors tracking-tight">
        GitHub
      </span>

      {/* Subtle sleek external arrow indicator */}
      <svg
        className="relative z-10 w-3 h-3 text-emerald-400/80 group-hover:text-emerald-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    </a>
  );
}
