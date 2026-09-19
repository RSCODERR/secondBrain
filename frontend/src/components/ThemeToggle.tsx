import { useTheme } from "../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated Day/Night Toggle Switch matching the sky/clouds and stars/moon design.
 * - Day state: bright golden Sun on the left with fluffy white clouds on the right.
 * - Night state: cratered glowing Moon on the right with starry night sky & dunes on the left.
 */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`relative inline-flex items-center w-[74px] h-[32px] rounded-full overflow-hidden p-0 border transition-all duration-500 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 shrink-0 ${
        isDark
          ? "bg-[#152238] border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
          : "bg-[#54aed4] border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]"
      } ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* ── DAY SKY ASSETS (Clouds) ── */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out ${
          isDark
            ? "opacity-0 translate-y-3 scale-90"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Soft upper cloud */}
        <div className="absolute top-[5px] right-[13px] w-[26px] h-[10px] bg-[#9ec4da] rounded-full opacity-80" />
        <div className="absolute top-[2px] right-[17px] w-[12px] h-[12px] bg-[#9ec4da] rounded-full opacity-80" />

        {/* Foreground fluffy main cloud */}
        <div className="absolute bottom-[3px] right-[10px] w-[30px] h-[12px] bg-white rounded-full shadow-xs" />
        <div className="absolute bottom-[6px] right-[18px] w-[14px] h-[14px] bg-white rounded-full" />
        <div className="absolute bottom-[5px] right-[13px] w-[10px] h-[10px] bg-white rounded-full" />

        {/* Small side cloud puff */}
        <div className="absolute top-[8px] right-[4px] w-[14px] h-[8px] bg-white rounded-full shadow-xs opacity-95" />
        <div className="absolute top-[6px] right-[7px] w-[7px] h-[7px] bg-white rounded-full opacity-95" />
      </div>

      {/* ── NIGHT SKY ASSETS (Stars & Dune Curve) ── */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ease-out ${
          isDark
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-75"
        }`}
      >
        {/* Dark planetary dune in bottom-left corner */}
        <div className="absolute -bottom-3 -left-3 w-11 h-11 rounded-full bg-[#1b2b42] opacity-90" />

        {/* Twinkling Stars (scattered left & center) */}
        {/* Star 1 */}
        <span className="absolute top-[6px] left-[13px] w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_2px_#fff]" />
        {/* Star 2 */}
        <span className="absolute top-[13px] left-[7px] w-[1.5px] h-[1.5px] bg-sky-200 rounded-full" />
        {/* Star 3 (sparkle) */}
        <span className="absolute top-[7px] left-[24px] w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_3px_#fff]" />
        {/* Star 4 */}
        <span className="absolute top-[15px] left-[19px] w-[2.5px] h-[2.5px] bg-sky-100 rounded-full shadow-[0_0_2px_#cbe0ff]" />
        {/* Star 5 */}
        <span className="absolute top-[23px] left-[26px] w-[1.5px] h-[1.5px] bg-white rounded-full" />
        {/* Star 6 */}
        <span className="absolute top-[17px] left-[35px] w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_2px_#fff]" />
        {/* Star 7 */}
        <span className="absolute top-[8px] left-[36px] w-[1.5px] h-[1.5px] bg-sky-200 rounded-full" />
        {/* Star 8 */}
        <span className="absolute top-[21px] left-[15px] w-[1.5px] h-[1.5px] bg-white rounded-full opacity-80" />
      </div>

      {/* ── THE CELESTIAL KNOB (Sun ☀️ <-> Moon 🌙) ── */}
      <div
        className="absolute top-[3px] left-[3px] w-[26px] h-[26px] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 overflow-hidden"
        style={{
          transform: isDark ? "translateX(42px)" : "translateX(0px)",
          backgroundColor: isDark ? "#e8edf3" : "#ffce00",
          boxShadow: isDark
            ? "0 0 10px rgba(235, 243, 255, 0.7), inset 0 -1.5px 2px rgba(180, 195, 210, 0.5)"
            : "0 0 10px rgba(255, 206, 0, 0.8), inset 0 -1.5px 2px rgba(230, 140, 0, 0.45)",
        }}
      >
        {/* Moon Craters (visible only in dark mode) */}
        <div
          className={`absolute inset-0 transition-opacity duration-400 ease-in-out ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Main Large Crater */}
          <span className="absolute top-[6px] left-[6px] w-[5.5px] h-[5.5px] rounded-full bg-[#cad6e2] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.15)]" />
          {/* Medium Crater */}
          <span className="absolute top-[13px] left-[13px] w-[4px] h-[4px] rounded-full bg-[#cbd7e3] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.12)]" />
          {/* Small Crater Top Right */}
          <span className="absolute top-[7px] left-[15px] w-[3px] h-[3px] rounded-full bg-[#cad6e2]" />
          {/* Tiny Crater Bottom Left */}
          <span className="absolute top-[16px] left-[7px] w-[2.5px] h-[2.5px] rounded-full bg-[#d3dce6]" />
        </div>

        {/* Sun Subtle Surface Shine (visible only in light mode) */}
        <div
          className={`absolute inset-0 transition-opacity duration-400 ease-in-out pointer-events-none ${
            !isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="absolute top-[3px] left-[4px] w-[18px] h-[10px] rounded-full bg-white/25 blur-[1px]" />
        </div>
      </div>
    </button>
  );
}
