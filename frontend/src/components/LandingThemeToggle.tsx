import { useTheme } from "../context/ThemeContext";

/**
 * iOS-style toggle switch for the landing page navbar.
 * Shows a sun emoji when dark (click to go light) and moon emoji when light (click to go dark).
 */
export function LandingThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center cursor-pointer focus:outline-none select-none group"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Track */}
      <span
        className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors duration-300 ease-in-out shadow-inner border ${
          isDark
            ? "bg-[#1a2e1c] border-[#2d4a31]/60"
            : "bg-stone-200 border-stone-300/80"
        }`}
        style={{ width: "52px" }}
      >
        {/* Thumb */}
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full flex items-center justify-center text-sm transition-all duration-300 ease-in-out shadow-md ${
            isDark
              ? "translate-x-6 bg-[#1c2b1e] shadow-black/50"
              : "translate-x-0.5 bg-white shadow-stone-300/80"
          }`}
        >
          {isDark ? (
            /* Moon */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-300">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            /* Sun */
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <circle cx="12" cy="12" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
