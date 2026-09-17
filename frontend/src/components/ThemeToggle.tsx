import { useTheme, type Theme } from "../context/ThemeContext";
import { SunIcon } from "../icons/sunIcon";
import { MoonIcon } from "../icons/moonIcon";
import { SystemIcon } from "../icons/systemIcon";

interface ThemeToggleProps {
  variant?: "capsule" | "icon" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "capsule", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Capsule variant: pure icon pill with no text labels
  if (variant === "capsule" || variant === "segmented") {
    const options: { value: Theme; title: string; icon: React.ReactNode }[] = [
      { value: "light", title: "Light mode", icon: <SunIcon size="sm" /> },
      { value: "dark", title: "Dark mode", icon: <MoonIcon size="sm" /> },
      { value: "system", title: "System preference", icon: <SystemIcon size="sm" /> },
    ];

    return (
      <div
        className={`inline-flex items-center p-1 bg-stone-200/70 dark:bg-[#121c15] border border-stone-300/70 dark:border-emerald-900/60 rounded-full shadow-inner select-none transition-colors ${className}`}
        role="radiogroup"
        aria-label="Theme mode"
      >
        {options.map((opt) => {
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              title={opt.title}
              aria-label={opt.title}
              aria-checked={isSelected}
              role="radio"
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? "bg-white text-[#2d4a31] dark:bg-emerald-600 dark:text-white shadow-xs scale-105 font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-emerald-200 hover:bg-stone-300/40 dark:hover:bg-white/5"
              }`}
            >
              {opt.icon}
            </button>
          );
        })}
      </div>
    );
  }

  // Single-button icon toggle
  const getIcon = () => {
    if (theme === "system") {
      return (
        <span className="relative flex items-center justify-center">
          <SystemIcon size="sm" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-[#0d1410] ${
              resolvedTheme === "dark" ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
        </span>
      );
    }
    if (resolvedTheme === "dark") {
      return <MoonIcon size="sm" />;
    }
    return <SunIcon size="sm" />;
  };

  const getLabel = () => {
    if (theme === "system") {
      return `System preference (${resolvedTheme === "dark" ? "Dark" : "Light"}) — Click to switch`;
    }
    return `${resolvedTheme === "dark" ? "Dark mode" : "Light mode"} — Click to switch`;
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={getLabel()}
      aria-label={getLabel()}
      className={`p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100/90 dark:bg-[#142017] hover:bg-stone-200/80 dark:hover:bg-[#1e3023] border border-stone-200/90 dark:border-emerald-900/60 shadow-2xs transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${className}`}
    >
      {getIcon()}
    </button>
  );
}
