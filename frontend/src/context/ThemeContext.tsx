import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type ThemePreset =
  | "emerald-glow"
  | "dark"
  | "light"
  | "monochrome"
  | "high-contrast"
  | "midnight"
  | "cyberpunk";

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  themePreset: ThemePreset;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setThemePreset: (preset: ThemePreset) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
  resetAppearance: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "sb_theme";
const PRESET_STORAGE_KEY = "sb_theme_preset";
const ACCENT_STORAGE_KEY = "sb_accent_color";

export const DEFAULT_ACCENT = "#10b981";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num) || c.length !== 6) return `rgba(16, 185, 129, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return "system";
  });

  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    if (typeof window === "undefined") return "emerald-glow";
    const saved = localStorage.getItem(PRESET_STORAGE_KEY) as ThemePreset | null;
    if (
      saved &&
      [
        "emerald-glow",
        "dark",
        "light",
        "monochrome",
        "high-contrast",
        "midnight",
        "cyberpunk",
      ].includes(saved)
    ) {
      return saved;
    }
    return "emerald-glow";
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_ACCENT;
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (saved && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(saved)) {
      return saved;
    }
    return DEFAULT_ACCENT;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themePreset === "light") return "light";
    if (theme === "system") return getSystemTheme();
    return theme;
  });

  // Keep resolvedTheme and <html> attributes in sync with theme, preset, accent and OS changes
  useEffect(() => {
    const updateTheme = () => {
      let active: ResolvedTheme;
      if (themePreset === "light") {
        active = "light";
      } else if (
        [
          "emerald-glow",
          "dark",
          "monochrome",
          "high-contrast",
          "midnight",
          "cyberpunk",
        ].includes(themePreset) &&
        theme !== "light"
      ) {
        active = "dark";
      } else {
        active = theme === "system" ? getSystemTheme() : theme;
      }

      setResolvedTheme(active);

      const root = document.documentElement;
      if (active === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }

      // Apply theme preset data attribute
      root.setAttribute("data-theme-preset", themePreset);

      // Apply dynamic accent CSS variables
      const activeAccent =
        themePreset === "monochrome"
          ? active === "dark"
            ? "#ffffff"
            : "#18181b"
          : accentColor;

      root.style.setProperty("--accent-color", activeAccent);
      root.style.setProperty("--accent-subtle", hexToRgba(activeAccent, 0.15));
      root.style.setProperty("--accent-border", hexToRgba(activeAccent, 0.35));
      root.style.setProperty("--accent-glow", hexToRgba(activeAccent, 0.28));
    };

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme, themePreset, accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Storage error handling
    }

    // If user explicitly requests light/dark, adjust preset if discordant
    if (newTheme === "light" && themePreset !== "light") {
      setThemePresetState("light");
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, "light");
      } catch {}
    } else if (newTheme === "dark" && themePreset === "light") {
      setThemePresetState("emerald-glow");
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, "emerald-glow");
      } catch {}
    }
  };

  const setThemePreset = (newPreset: ThemePreset) => {
    setThemePresetState(newPreset);
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, newPreset);
    } catch {}

    if (newPreset === "light") {
      setThemeState("light");
      try {
        localStorage.setItem(STORAGE_KEY, "light");
      } catch {}
    } else {
      setThemeState("dark");
      try {
        localStorage.setItem(STORAGE_KEY, "dark");
      } catch {}
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, color);
    } catch {}
  };

  const toggleTheme = () => {
    // 2-way toggle between light and dark
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const resetAppearance = () => {
    setThemePresetState("emerald-glow");
    setAccentColorState(DEFAULT_ACCENT);
    setThemeState("dark");
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, "emerald-glow");
      localStorage.setItem(ACCENT_STORAGE_KEY, DEFAULT_ACCENT);
      localStorage.setItem(STORAGE_KEY, "dark");
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        themePreset,
        accentColor,
        setTheme,
        setThemePreset,
        setAccentColor,
        toggleTheme,
        resetAppearance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
