import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme, type ThemePreset } from "../context/ThemeContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type ContentItem = {
  _id: string;
  type: string;
  title: string;
  note?: string;
  link?: string;
};

type FilterType = "note" | "youtube" | "twitter" | "link" | null;

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  contents: ContentItem[];
  onAddContent: () => void;
  onShareBrain: () => void;
  onSetFilter: (filter: FilterType) => void;
  onSetSearch: (query: string) => void;
  onEditContent?: (content: ContentItem) => void;
}

// ─── Command Item Definition ──────────────────────────────────────────────────

type CommandGroup = {
  label: string;
  items: CommandItem[];
};

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  kbd?: string[];
  action: () => void;
  accent?: boolean;
};

// ─── Icons (inlined SVG to avoid extra imports) ───────────────────────────────

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

const TweetIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const ContentTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "youtube": return <VideoIcon />;
    case "twitter": return <TweetIcon />;
    case "link": return <LinkIcon />;
    default: return <NoteIcon />;
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case "youtube": return "text-red-500 bg-red-500/10";
    case "twitter": return "text-sky-500 bg-sky-500/10";
    case "link": return "text-blue-500 bg-blue-500/10";
    default: return "text-emerald-500 bg-emerald-500/10";
  }
};

// Theme preset options
const THEME_PRESETS: { id: ThemePreset; label: string; emoji: string }[] = [
  { id: "emerald-glow", label: "Emerald Glow", emoji: "🌿" },
  { id: "midnight", label: "Midnight", emoji: "🌌" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "⚡" },
  { id: "monochrome", label: "Monochrome", emoji: "🩶" },
  { id: "high-contrast", label: "High Contrast", emoji: "🔲" },
  { id: "light", label: "Light", emoji: "☀️" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommandPalette({
  open,
  onClose,
  contents,
  onAddContent,
  onShareBrain,
  onSetFilter,
  onSetSearch,
  onEditContent,
}: CommandPaletteProps) {
  const { setThemePreset, themePreset, toggleTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ── Reset state when opening ──
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Build command groups ──
  const groups = useCallback((): CommandGroup[] => {
    const q = query.toLowerCase().trim();
    const result: CommandGroup[] = [];

    // 1. Content search results
    if (q.length > 0) {
      const matches = contents
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            (c.note && c.note.toLowerCase().includes(q)) ||
            c.type.toLowerCase().includes(q)
        )
        .slice(0, 6);

      if (matches.length > 0) {
        result.push({
          label: "Results",
          items: matches.map((c) => ({
            id: `content-${c._id}`,
            label: c.title,
            description: c.note ? c.note.slice(0, 60) + (c.note.length > 60 ? "…" : "") : c.type,
            icon: (
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeColor(c.type)}`}>
                <ContentTypeIcon type={c.type} />
              </span>
            ),
            action: () => {
              onSetSearch(c.title);
              onClose();
            },
          })),
        });
      }
    }

    // 2. Quick actions (always shown, filtered by query)
    const actions: CommandItem[] = [
      {
        id: "add-content",
        label: "Add Content",
        description: "Save a new note, video, tweet, or link",
        icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"><PlusIcon /></span>,
        kbd: ["A"],
        accent: true,
        action: () => { onAddContent(); onClose(); },
      },
      {
        id: "share-brain",
        label: "Share My Brain",
        description: "Generate a shareable link to your collection",
        icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-violet-500 bg-violet-500/10"><ShareIcon /></span>,
        kbd: ["S"],
        action: () => { onShareBrain(); onClose(); },
      },
      {
        id: "toggle-theme",
        label: resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        description: "Toggle between light and dark appearance",
        icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10">{resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}</span>,
        kbd: ["T"],
        action: () => { toggleTheme(); onClose(); },
      },
    ].filter(
      (a) => q === "" || a.label.toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q)
    );

    if (actions.length > 0) {
      result.push({ label: "Actions", items: actions });
    }

    // 3. Filters
    const filterItems: CommandItem[] = [
      { id: "filter-all", label: "All Notes", description: "Show all content types", icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-stone-500 bg-stone-500/10"><SearchIcon /></span>, action: () => { onSetFilter(null); onClose(); } },
      { id: "filter-note", label: "Filter: Notes", icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-emerald-500 bg-emerald-500/10"><NoteIcon /></span>, action: () => { onSetFilter("note"); onClose(); } },
      { id: "filter-youtube", label: "Filter: YouTube Videos", icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-red-500 bg-red-500/10"><VideoIcon /></span>, action: () => { onSetFilter("youtube"); onClose(); } },
      { id: "filter-twitter", label: "Filter: Tweets", icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sky-500 bg-sky-500/10"><TweetIcon /></span>, action: () => { onSetFilter("twitter"); onClose(); } },
      { id: "filter-link", label: "Filter: Links", icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-blue-500 bg-blue-500/10"><LinkIcon /></span>, action: () => { onSetFilter("link"); onClose(); } },
    ].filter((f) => q === "" || f.label.toLowerCase().includes(q));

    if (filterItems.length > 0) {
      result.push({ label: "Filters", items: filterItems });
    }

    // 4. Theme presets
    const themeItems: CommandItem[] = THEME_PRESETS
      .filter((p) => q === "" || p.label.toLowerCase().includes(q) || "theme".includes(q))
      .map((p) => ({
        id: `theme-${p.id}`,
        label: `${p.emoji} ${p.label}`,
        description: themePreset === p.id ? "Currently active" : "Switch to this theme",
        icon: <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-violet-400 bg-violet-500/10"><PaletteIcon /></span>,
        action: () => { setThemePreset(p.id); onClose(); },
      }));

    if (themeItems.length > 0) {
      result.push({ label: "Themes", items: themeItems });
    }

    return result;
  }, [query, contents, resolvedTheme, themePreset, onAddContent, onShareBrain, onSetFilter, onSetSearch, onClose, toggleTheme, setThemePreset]);

  const allItems = groups().flatMap((g) => g.items);

  // ── Keyboard navigation ──
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        allItems[activeIndex]?.action();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, allItems, activeIndex, onClose]);

  // ── Scroll active item into view ──
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  // Reset active index when query or groups change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const renderedGroups = groups();
  let globalIdx = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-cmd-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className="w-full max-w-[600px] pointer-events-auto animate-cmd-slide">
          <div className="bg-white dark:bg-[#0f1a12] border border-stone-200/80 dark:border-emerald-900/50 rounded-2xl shadow-2xl overflow-hidden">

            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-100 dark:border-emerald-900/40">
              <span className="text-stone-400 dark:text-stone-500 shrink-0">
                <SearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes or run a command..."
                className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40 shrink-0">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto overscroll-contain py-1.5"
            >
              {renderedGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400 dark:text-stone-600 gap-2">
                  <SearchIcon />
                  <span className="text-sm">No results for "{query}"</span>
                </div>
              )}

              {renderedGroups.map((group) => (
                <div key={group.label}>
                  {/* Group Label */}
                  <div className="px-3 pt-2.5 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-600">
                      {group.label}
                    </span>
                  </div>

                  {/* Group Items */}
                  {group.items.map((item) => {
                    const idx = globalIdx++;
                    const isActive = idx === activeIndex;

                    return (
                      <button
                        key={item.id}
                        ref={(el) => { itemRefs.current[idx] = el; }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75 cursor-pointer ${
                          isActive
                            ? "bg-stone-100 dark:bg-emerald-950/60"
                            : "hover:bg-stone-50 dark:hover:bg-emerald-950/30"
                        }`}
                        onClick={item.action}
                        onMouseMove={() => setActiveIndex(idx)}
                      >
                        {/* Icon */}
                        {item.icon}

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${
                            item.accent
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-stone-800 dark:text-stone-100"
                          }`}>
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>

                        {/* Keyboard shortcut badge */}
                        {item.kbd && (
                          <div className="flex items-center gap-1 shrink-0">
                            {item.kbd.map((k) => (
                              <kbd
                                key={k}
                                className="text-[10px] font-medium text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40"
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-stone-100 dark:border-emerald-900/40 bg-stone-50/50 dark:bg-[#0c1510]/60">
              <div className="flex items-center gap-3 text-[10px] text-stone-400 dark:text-stone-600 font-medium">
                <span className="flex items-center gap-1">
                  <kbd className="bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">↑</kbd>
                  <kbd className="bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40">↵</kbd>
                  Select
                </span>
              </div>
              <span className="text-[10px] text-stone-300 dark:text-stone-700 font-medium">
                Second Brain
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
