import { SparkleIcon } from "../icons/sparkleIcon";

interface AIFloatingButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export function AIFloatingButton({ onClick, isOpen = false }: AIFloatingButtonProps) {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-cmd-fade">
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center p-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="Ask your Second Brain AI (Cmd/Ctrl + J)"
        aria-label="Open AI Assistant"
      >
        {/* Glow ambient background ring */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse" />

        <div className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white dark:bg-[#121c15] text-stone-800 dark:text-stone-100 font-semibold text-xs sm:text-sm">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition-transform duration-300">
            <SparkleIcon size="sm" />
          </div>

          <span className="tracking-tight flex items-center gap-1.5">
            <span>Ask Brain</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
              AI
            </span>
          </span>

          <kbd className="hidden md:inline-flex items-center text-[10px] font-mono text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-[#18261e] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40 ml-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            ⌘J
          </kbd>
        </div>
      </button>
    </div>
  );
}
