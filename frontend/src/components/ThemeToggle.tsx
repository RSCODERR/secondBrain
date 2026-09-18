import { useTheme } from "../context/ThemeContext";
import { SunIcon } from "../icons/sunIcon";
import { MoonIcon } from "../icons/moonIcon";

interface ThemeToggleProps {
  variant?: "capsule" | "icon" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "capsule", className = "" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Capsule variant: ultra-sleek icon-only sliding switch
  if (variant === "capsule" || variant === "segmented") {
    return (
      <div
        className={`relative inline-flex items-center p-1 bg-stone-200/90 dark:bg-[#0d140f]/95 border border-stone-300/80 dark:border-emerald-950/80 rounded-full shadow-inner select-none transition-colors duration-300 backdrop-blur-md ${className}`}
        role="group"
        aria-label="Theme mode switcher (Light / Dark)"
      >
        {/* Animated Sliding Highlight Pill */}
        <span
          className={`absolute top-1 bottom-1 w-[34px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none shadow-md ${
            isDark
              ? "left-[39px] bg-[var(--accent-color)] shadow-[0_0_14px_var(--accent-glow)]"
              : "left-1 bg-white shadow-stone-300/80 ring-1 ring-black/5"
          }`}
        />

        {/* Light Mode Icon Button */}
        <button
          type="button"
          onClick={() => setTheme("light")}
          title="Switch to light mode"
          aria-label="Light mode"
          aria-pressed={!isDark}
          className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            !isDark
              ? "text-amber-500 scale-105 rotate-0 font-bold"
              : "text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rotate-[-12deg]"
          }`}
        >
          <SunIcon size="sm" />
        </button>

        {/* Dark Mode Icon Button */}
        <button
          type="button"
          onClick={() => setTheme("dark")}
          title="Switch to dark mode"
          aria-label="Dark mode"
          aria-pressed={isDark}
          className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isDark
              ? "text-white scale-105 rotate-0 font-bold"
              : "text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 rotate-[12deg]"
          }`}
        >
          <MoonIcon size="sm" />
        </button>
      </div>
    );
  }

  // Single-button icon toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100/90 dark:bg-[#142017] hover:bg-stone-200/80 dark:hover:bg-[#1e3023] border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${className}`}
    >
      {isDark ? <MoonIcon size="sm" /> : <SunIcon size="sm" />}
    </button>
  );
}
