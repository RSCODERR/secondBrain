import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { useTheme, type ThemePreset } from "../context/ThemeContext";
import { BrainIcon } from "../icons/brainIcon";
import { MenuIcon } from "../icons/menuIcon";
import { LogoutIcon } from "../icons/logoutIcon";
import { EyeopenIcon } from "../icons/eyeopenIcon";
import { EyeoffIcon } from "../icons/eyeoffIcon";
import { SunIcon } from "../icons/sunIcon";
import { MoonIcon } from "../icons/moonIcon";
import "../App.css";

/* ─── tiny helper: debounce ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface ThemePresetOption {
  id: ThemePreset;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}

const THEME_PRESETS: ThemePresetOption[] = [
  {
    id: "emerald-glow",
    title: "SecondBrain Glow",
    description: "The original Second Brain look with obsidian emerald and mint glow",
    badge: "Original",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-900 to-emerald-500 text-white flex items-center justify-center shadow-xs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 6.8 6.8 2.4-6.8 2.4L12 20.4l-2.4-6.8L2.8 11.2l6.8-2.4z" />
        </svg>
      </div>
    ),
  },
  {
    id: "dark",
    title: "Dark",
    description: "Clean neutral black and charcoal with crisp contrast",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-stone-800 text-stone-200 border border-stone-700/60 flex items-center justify-center shadow-xs">
        <MoonIcon size="md" />
      </div>
    ),
  },
  {
    id: "light",
    title: "Light",
    description: "Crisp white and clean slate for high daylight visibility",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shadow-xs">
        <SunIcon size="md" />
      </div>
    ),
  },
  {
    id: "monochrome",
    title: "Monochrome",
    description: "Quiet, focused black and white. Removes decorative colors",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-black text-white border border-stone-700 flex items-center justify-center shadow-xs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1 0-16v16z" />
        </svg>
      </div>
    ),
  },
  {
    id: "high-contrast",
    title: "High Contrast",
    description: "Sharper edges, pure OLED black, and ultra-bright text",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-black text-white border-2 border-white flex items-center justify-center shadow-xs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" strokeWidth="2.5" />
        </svg>
      </div>
    ),
  },
  {
    id: "midnight",
    title: "Midnight",
    description: "A calmer deep sapphire and oceanic blue-only palette",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 text-sky-300 border border-blue-900/60 flex items-center justify-center shadow-xs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </div>
    ),
  },
  {
    id: "cyberpunk",
    title: "Cyberpunk",
    description: "Vibrant neon violet & magenta electric night glow",
    icon: (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-950 to-pink-600 text-pink-200 border border-pink-500/40 flex items-center justify-center shadow-xs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
        </svg>
      </div>
    ),
  },
];

const ACCENT_PRESETS = [
  { name: "Emerald", color: "#10b981" },
  { name: "Sky Blue", color: "#0ea5e9" },
  { name: "Teal Cyan", color: "#14b8a6" },
  { name: "Royal Violet", color: "#8b5cf6" },
  { name: "Vibrant Rose", color: "#ec4899" },
  { name: "Sunset Amber", color: "#f59e0b" },
  { name: "Flame Orange", color: "#f97316" },
];

/* ─── availability states ─── */
type AvailStatus = "idle" | "checking" | "available" | "taken" | "self" | "error";

export default function Settings() {
  const { user, logout, updateUsername } = useAuth();
  const {
    themePreset,
    accentColor,
    accentStyles,
    setThemePreset,
    setAccentColor,
    resetAppearance,
  } = useTheme();
  const navigate = useNavigate();

  /* ── sidebar open state (mobile) ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ══════════════════════════════
     Change Username section
  ══════════════════════════════ */
  const [newUsername, setNewUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  const debouncedUsername = useDebounce(newUsername.trim().toLowerCase(), 500);

  /* Check availability whenever debounced value changes */
  useEffect(() => {
    const trimmed = debouncedUsername;
    if (!trimmed) {
      setUsernameStatus("idle");
      return;
    }
    if (trimmed === user?.username?.toLowerCase()) {
      setUsernameStatus("self");
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 25) {
      setUsernameStatus("idle");
      return;
    }

    let cancelled = false;
    setUsernameStatus("checking");

    axios
      .get(`${BACKEND_URL}/api/v1/check-username`, {
        params: { username: trimmed },
      })
      .then((res) => {
        if (!cancelled) {
          setUsernameStatus(res.data.available ? "available" : "taken");
        }
      })
      .catch(() => {
        if (!cancelled) setUsernameStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, user?.username]);

  const handleSaveUsername = async () => {
    setUsernameError(null);
    setUsernameSuccess(null);

    const trimmed = newUsername.trim().toLowerCase();
    if (!trimmed) {
      setUsernameError("Please enter a new username.");
      return;
    }
    if (trimmed === user?.username?.toLowerCase()) {
      setUsernameError("That is already your current username.");
      return;
    }
    if (trimmed.length < 4 || trimmed.length > 25) {
      setUsernameError("Username must be between 4 and 25 characters.");
      return;
    }
    if (usernameStatus !== "available") {
      setUsernameError("Please wait for availability check or choose a different username.");
      return;
    }

    try {
      setSavingUsername(true);
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/user/username`,
        { newUsername: trimmed },
        { withCredentials: true }
      );
      updateUsername(res.data.username);
      setUsernameSuccess(`Username changed to @${res.data.username} successfully!`);
      setNewUsername("");
      setUsernameStatus("idle");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setUsernameError(err.response?.data?.error || "Failed to update username.");
      } else {
        setUsernameError("An unexpected error occurred.");
      }
    } finally {
      setSavingUsername(false);
    }
  };

  /* ══════════════════════════════
     Delete Account section
  ══════════════════════════════ */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDeleteConfirm) {
      setTimeout(() => deleteInputRef.current?.focus(), 100);
    } else {
      setDeletePassword("");
      setDeleteError(null);
      setShowDeletePassword(false);
    }
  }, [showDeleteConfirm]);

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    try {
      setDeletingAccount(true);
      await axios.delete(`${BACKEND_URL}/api/v1/user`, {
        data: { password: deletePassword },
        withCredentials: true,
      });
      // Clear auth state then redirect
      await logout();
      navigate("/signin", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDeleteError(err.response?.data?.error || "Failed to delete account.");
      } else {
        setDeleteError("An unexpected error occurred.");
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  /* ── availability badge ── */
  const renderBadge = useCallback(() => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 4) return null;

    if (usernameStatus === "checking") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
          <span className="w-3.5 h-3.5 border-2 border-stone-400 dark:border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" />
          Checking…
        </span>
      );
    }
    if (usernameStatus === "available") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Available
        </span>
      );
    }
    if (usernameStatus === "taken") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Already taken
        </span>
      );
    }
    if (usernameStatus === "self") {
      return (
        <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">That's your current username</span>
      );
    }
    return null;
  }, [newUsername, usernameStatus]);

  return (
    <div
      data-theme-preset={themePreset}
      style={accentStyles}
      className="dashboard-scope min-h-screen bg-slate-50/70 dark:bg-[#0b110d] text-stone-800 dark:text-stone-100 w-full transition-colors duration-200"
    >
      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`h-screen bg-white dark:bg-[#0c120e] border-r border-stone-200 dark:border-emerald-950/70 w-72 fixed left-0 top-0 px-5 py-6 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        <div>
          <div className="flex text-2xl sm:text-3xl items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:cursor-pointer select-none"
            >
              <div className="text-[#2d4a31] dark:text-emerald-400"><BrainIcon /></div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">Second Brain</div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white lg:hidden cursor-pointer rounded-lg hover:bg-stone-100 dark:hover:bg-[#142017]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="pt-8 flex flex-col gap-1.5">
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3.5 py-2.5 cursor-pointer rounded-xl px-3.5 transition-all duration-200 ease-in-out text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-[#142017] dark:hover:text-emerald-200 text-sm font-medium"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </Link>

            {/* Settings — active */}
            <div className="flex items-center gap-3.5 py-2.5 cursor-default rounded-xl px-3.5 bg-[#2d4a31]/10 text-[#2d4a31] dark:bg-emerald-950/70 dark:text-emerald-300 border border-[#2d4a31]/20 dark:border-emerald-800/60 font-semibold text-sm shadow-xs">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Account Settings
            </div>
          </nav>
        </div>

        {/* Bottom: user info + logout */}
        <div className="border-t border-stone-200 dark:border-emerald-950/70 pt-4 flex flex-col gap-2.5">
          {user && (
            <div className="px-3 py-0.5 text-xs text-stone-500 dark:text-stone-400 truncate">
              Signed in as <span className="font-semibold text-stone-800 dark:text-emerald-300">@{user.username}</span>
            </div>
          )}
          <button
            onClick={() => { logout(); }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/40 text-sm"
          >
            <LogoutIcon size="md" />
            <span className="font-semibold">Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-0 lg:ml-72 min-h-screen p-4 md:p-6 lg:p-8 transition-all duration-300">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-emerald-950/70">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-[#142017] border border-stone-200 dark:border-emerald-900/60 hover:bg-stone-50 dark:hover:bg-[#1b2b20] text-stone-700 dark:text-stone-200 cursor-pointer shadow-xs transition"
              aria-label="Open Navigation Menu"
            >
              <MenuIcon size="md" />
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-stone-100 select-none">
              <span className="text-[#2d4a31] dark:text-emerald-400"><BrainIcon /></span>
              <span>Second Brain</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-white dark:bg-[#142017] border border-stone-200 dark:border-emerald-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer shadow-xs transition"
              aria-label="Logout"
            >
              <LogoutIcon size="md" />
            </button>
          </div>
        </header>

        {/* Page heading */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Account Settings</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your account details and appearance preferences
          </p>
        </div>

        <div className="max-w-2xl flex flex-col gap-5">

          {/* ── Current account info card ── */}
          <div className="bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/70 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-full bg-[#2d4a31]/10 dark:bg-emerald-950/70 border border-[#2d4a31]/20 dark:border-emerald-800/60 flex items-center justify-center text-[#2d4a31] dark:text-emerald-300 font-bold text-lg shrink-0">
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate">@{user?.username}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Your Second Brain account</div>
            </div>
          </div>

          {/* ══════════════════════════════
               Appearance & Theme card
          ══════════════════════════════ */}
          <div className="bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/70 rounded-2xl shadow-xs overflow-hidden transition-colors">
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-stone-100 dark:border-emerald-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">Appearance & Theme</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Customize your interface theme, palette presets, and highlight accents</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="capitalize">{themePreset.replace("-", " ")}</span>
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* ── SECTION: THEME PRESETS ── */}
              <div>
                <div className="mb-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                    Appearance
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    Theme presets
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = themePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setThemePreset(preset.id)}
                        className={`group w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                          isSelected
                            ? "border-[var(--accent-color)] bg-[var(--accent-subtle)] ring-1.5 ring-[var(--accent-border)] shadow-xs"
                            : "border-stone-200/90 dark:border-stone-800/80 bg-stone-50/40 dark:bg-[#0c120e] hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100/50 dark:hover:bg-[#121b14]"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="shrink-0">{preset.icon}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                              <span>{preset.title}</span>
                              {preset.badge && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  {preset.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate sm:whitespace-normal">
                              {preset.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-transparent bg-[var(--accent-color)] text-white shadow-xs scale-105"
                                : "border-stone-300 dark:border-stone-700 bg-transparent"
                            }`}
                          >
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── SECTION: CHOOSE AN ACCENT ── */}
              <div className="mt-8 pt-6 border-t border-stone-200/80 dark:border-stone-800/80">
                <div className="mb-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                    Personalize
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    Choose an accent
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Keep the familiar Second Brain layout and make the highlights yours.
                  </p>
                </div>

                {/* Swatches Container */}
                <div className="p-3.5 bg-stone-50/80 dark:bg-[#0c120e] rounded-2xl border border-stone-200/80 dark:border-stone-800/80">
                  <div className="flex flex-wrap items-center gap-3">
                    {ACCENT_PRESETS.map((preset) => {
                      const isSelected = accentColor.toLowerCase() === preset.color.toLowerCase();
                      return (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setAccentColor(preset.color)}
                          title={preset.name}
                          aria-label={preset.name}
                          className={`relative w-10 h-10 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 shadow-xs ${
                            isSelected ? "ring-3 ring-offset-2 ring-[var(--accent-color)] dark:ring-offset-[#0c120e] scale-105" : ""
                          }`}
                          style={{ backgroundColor: preset.color }}
                        >
                          {isSelected && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}

                    {/* Custom Color Picker Swatch */}
                    <div className="relative group">
                      <label
                        title="Pick custom accent color"
                        className={`relative w-10 h-10 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-600 hover:scale-110 active:scale-95 bg-gradient-to-tr from-indigo-500 via-pink-500 to-amber-400 shadow-xs ${
                          !ACCENT_PRESETS.some((p) => p.color.toLowerCase() === accentColor.toLowerCase())
                            ? "ring-3 ring-offset-2 ring-[var(--accent-color)] dark:ring-offset-[#0c120e] scale-105"
                            : ""
                        }`}
                        style={
                          !ACCENT_PRESETS.some((p) => p.color.toLowerCase() === accentColor.toLowerCase())
                            ? { backgroundColor: accentColor }
                            : {}
                        }
                      >
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="sr-only"
                        />
                        {!ACCENT_PRESETS.some((p) => p.color.toLowerCase() === accentColor.toLowerCase()) ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        )}
                      </label>
                    </div>

                    {/* Hex display badge */}
                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#141d16] border border-stone-200 dark:border-stone-800 text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>{accentColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* ── CALLOUT TIP BOX ── */}
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 dark:bg-[#0d1811] border border-emerald-500/20 dark:border-emerald-900/40 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    <strong>Monochrome</strong> removes decorative color. <strong>High Contrast</strong> keeps status colors while making text and controls easier to distinguish.
                  </p>
                </div>

                {/* ── RESTORE DEFAULTS BUTTON ── */}
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={resetAppearance}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#152018] rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span>Restore SecondBrain Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════
               Change Username card
          ══════════════════════════════ */}
          <div className="bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/70 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <div className="px-5 py-4 border-b border-stone-100 dark:border-emerald-950/60">
              <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">Change Username</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Pick a new unique username for your account</p>
            </div>
            <div className="px-5 py-5 flex flex-col gap-4">

              {/* Input + badge */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  New Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </span>
                  <input
                    id="new-username-input"
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setUsernameError(null);
                      setUsernameSuccess(null);
                    }}
                    placeholder={`Current: @${user?.username}`}
                    maxLength={25}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-[#4a7a50] dark:focus:border-emerald-500 focus:ring-4 focus:ring-[#4a7a50]/10 dark:focus:ring-emerald-500/15 shadow-xs"
                  />
                </div>
                {/* Availability badge */}
                <div className="mt-2 h-5 flex items-center">
                  {renderBadge()}
                </div>
              </div>

              {/* Feedback messages */}
              {usernameError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  {usernameError}
                </div>
              )}
              {usernameSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 animate-fade-in-up">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {usernameSuccess}
                </div>
              )}

              {/* Save button */}
              <button
                id="save-username-btn"
                onClick={handleSaveUsername}
                disabled={savingUsername || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "self" || !newUsername.trim()}
                className="w-full sm:w-auto sm:self-start px-5 py-2.5 rounded-xl bg-[#2d4a31] hover:bg-[#243d28] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingUsername ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Saving…
                  </span>
                ) : (
                  "Save Username"
                )}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════
               Danger Zone card
          ══════════════════════════════ */}
          <div className="bg-white dark:bg-[#141011] border border-red-200 dark:border-red-950/80 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <div className="px-5 py-4 border-b border-red-100 dark:border-red-950/70 bg-red-50/40 dark:bg-red-950/30">
              <h2 className="text-base font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
              <p className="text-xs text-red-500 dark:text-red-400/80 mt-0.5">These actions are permanent and cannot be undone</p>
            </div>
            <div className="px-5 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">Delete Account</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Permanently deletes your account and all saved content
                  </div>
                </div>
                {!showDeleteConfirm && (
                  <button
                    id="delete-account-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="shrink-0 px-4 py-2 rounded-xl border border-red-300 dark:border-red-800/80 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-400 dark:hover:border-red-700 transition-all duration-200 cursor-pointer"
                  >
                    Delete Account
                  </button>
                )}
              </div>

              {/* Confirmation panel */}
              {showDeleteConfirm && (
                <div className="mt-5 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex flex-col gap-3 animate-fade-in-up">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">
                    ⚠ This cannot be undone
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Enter your password to permanently delete <strong>@{user?.username}</strong> and all associated content.
                  </p>

                  {/* Password field */}
                  <div className="relative">
                    <input
                      ref={deleteInputRef}
                      id="delete-password-input"
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null); }}
                      placeholder="Enter your password"
                      className="w-full pl-4 pr-11 py-2.5 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-red-200 dark:border-red-900/60 rounded-xl transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-red-400 dark:focus:border-red-500 focus:ring-4 focus:ring-red-400/10"
                      onKeyDown={(e) => { if (e.key === "Enter") handleDeleteAccount(); }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-lg transition-colors cursor-pointer"
                      aria-label={showDeletePassword ? "Hide password" : "Show password"}
                    >
                      {showDeletePassword ? <EyeoffIcon /> : <EyeopenIcon />}
                    </button>
                  </div>

                  {deleteError && (
                    <div className="p-3 bg-white dark:bg-[#181112] border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2 animate-fade-in-up">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                      </svg>
                      {deleteError}
                    </div>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                    <button
                      id="cancel-delete-btn"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deletingAccount}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      id="confirm-delete-btn"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount || !deletePassword}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {deletingAccount ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                          Deleting…
                        </span>
                      ) : (
                        "Yes, Delete My Account"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
