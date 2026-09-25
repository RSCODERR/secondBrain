import React, { useState, useRef, useCallback } from "react";
import { RichMarkdown } from "./RichMarkdown";

interface RichNoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  autoFocus?: boolean;
}

type EditorMode = "write" | "preview" | "split";

export function RichNoteEditor({
  value,
  onChange,
  placeholder = "Write your thoughts, summaries, math equations, or code snippets...",
  minHeight = "240px",
  autoFocus = false,
}: RichNoteEditorProps) {
  const [mode, setMode] = useState<EditorMode>("write");
  const [showGuide, setShowGuide] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Helper to insert formatting at selection
  const insertFormatting = useCallback(
    (prefix: string, suffix: string = "", defaultText: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const textToWrap = selected || defaultText;

      const replacement = `${prefix}${textToWrap}${suffix}`;
      const newValue =
        value.substring(0, start) + replacement + value.substring(end);

      onChange(newValue);

      // Restore cursor position after state update
      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + prefix.length + textToWrap.length;
        textarea.setSelectionRange(
          selected ? start + prefix.length : cursorPosition,
          cursorPosition
        );
      }, 10);
    },
    [value, onChange]
  );

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key: Insert 2 spaces instead of leaving focus
    if (e.key === "Tab") {
      e.preventDefault();
      insertFormatting("  ", "", "");
      return;
    }

    // Ctrl/Cmd + B for Bold
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertFormatting("**", "**", "bold text");
      return;
    }

    // Ctrl/Cmd + I for Italic
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertFormatting("*", "*", "italic text");
      return;
    }
  };

  // Stats calculation
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const chars = value.length;

  // Task list detection
  const totalTasks = (value.match(/- \[[ xX]\]/g) || []).length;
  const completedTasks = (value.match(/- \[[xX]\]/g) || []).length;

  // Math equation detection
  const mathEquations = (value.match(/\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$/g) || []).length;

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-emerald-950/80 bg-white dark:bg-[#0c130e] overflow-hidden shadow-xs transition-colors">
      {/* ─── TOOLBAR & VIEW MODE HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-stone-50/90 dark:bg-[#101912] border-b border-stone-200/80 dark:border-emerald-950/70 select-none">
        {/* Left: Quick Formatting Buttons (Enabled in write/split mode) */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "bold text")}
            disabled={mode === "preview"}
            title="Bold (Ctrl+B)"
            className="w-7 h-7 rounded-lg text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            B
          </button>

          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "italic text")}
            disabled={mode === "preview"}
            title="Italic (Ctrl+I)"
            className="w-7 h-7 rounded-lg text-xs italic font-serif text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            I
          </button>

          <span className="w-px h-4 bg-stone-200 dark:bg-emerald-950/80 mx-0.5" />

          <button
            type="button"
            onClick={() => insertFormatting("### ", "", "Heading")}
            disabled={mode === "preview"}
            title="Heading 3"
            className="px-1.5 h-7 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            H3
          </button>

          <button
            type="button"
            onClick={() => insertFormatting("`", "`", "code")}
            disabled={mode === "preview"}
            title="Inline Code"
            className="w-7 h-7 rounded-lg text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            {"</>"}
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                "```typescript\n",
                "\n```",
                "const message: string = 'Hello World';"
              )
            }
            disabled={mode === "preview"}
            title="Code Block"
            className="px-1.5 h-7 rounded-lg text-xs font-mono text-emerald-700 dark:text-emerald-400 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            {`{ }`}
          </button>

          <span className="w-px h-4 bg-stone-200 dark:bg-emerald-950/80 mx-0.5" />

          {/* Task list checkbox button */}
          <button
            type="button"
            onClick={() => insertFormatting("- [ ] ", "", "New task")}
            disabled={mode === "preview"}
            title="Task List Item"
            className="px-2 h-7 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">☑</span>
            <span className="text-[11px] hidden sm:inline">Task</span>
          </button>

          {/* Math / LaTeX formula button */}
          <button
            type="button"
            onClick={() =>
              insertFormatting("$$\n", "\n$$", "E = mc^2")
            }
            disabled={mode === "preview"}
            title="Math / LaTeX Equation ($$formula$$)"
            className="px-2 h-7 rounded-lg text-xs font-serif italic text-amber-700 dark:text-amber-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span className="font-bold text-sm">∑</span>
            <span className="text-[11px] hidden sm:inline">LaTeX</span>
          </button>

          <span className="w-px h-4 bg-stone-200 dark:bg-emerald-950/80 mx-0.5" />

          <button
            type="button"
            onClick={() => insertFormatting("- ", "", "List item")}
            disabled={mode === "preview"}
            title="Bullet list"
            className="w-7 h-7 rounded-lg text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            •—
          </button>

          <button
            type="button"
            onClick={() => insertFormatting("> ", "", "Quote")}
            disabled={mode === "preview"}
            title="Blockquote"
            className="w-7 h-7 rounded-lg text-xs font-serif text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-emerald-950/80 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition-colors"
          >
            ”
          </button>
        </div>

        {/* Right: View Mode Segmented Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Markdown Quick Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            title="Markdown & LaTeX Cheatsheet"
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              showGuide
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-emerald-950/60"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          {/* Segmented Mode Selector */}
          <div className="flex items-center p-0.5 rounded-xl bg-stone-200/70 dark:bg-[#070b08] border border-stone-300/50 dark:border-emerald-950 text-xs">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                mode === "write"
                  ? "bg-white dark:bg-[#162319] text-stone-900 dark:text-white shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              Write
            </button>

            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                mode === "preview"
                  ? "bg-white dark:bg-[#162319] text-emerald-700 dark:text-emerald-300 shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              Preview
            </button>

            <button
              type="button"
              onClick={() => setMode("split")}
              className={`hidden md:inline-block px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                mode === "split"
                  ? "bg-white dark:bg-[#162319] text-stone-900 dark:text-white shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              Split
            </button>
          </div>
        </div>
      </div>

      {/* ─── QUICK CHEATSHEET HINT BANNER (when toggled) ─── */}
      {showGuide && (
        <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 text-xs text-stone-700 dark:text-stone-300 grid grid-cols-2 sm:grid-cols-4 gap-2 leading-relaxed">
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
              Math / LaTeX
            </span>
            <code className="text-[11px] font-mono">$E=mc^2$</code> (inline)
            <br />
            <code className="text-[11px] font-mono">{"$$\\frac{a}{b}$$"}</code> (block)
          </div>
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
              Checkboxes
            </span>
            <code className="text-[11px] font-mono">- [ ] To-do item</code>
            <br />
            <code className="text-[11px] font-mono">- [x] Done item</code>
          </div>
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
              Code Blocks
            </span>
            <code className="text-[11px] font-mono">```js ... ```</code>
            <br />
            <code className="text-[11px] font-mono">```python ... ```</code>
          </div>
          <div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
              Tables & Quotes
            </span>
            <code className="text-[11px] font-mono">| Col 1 | Col 2 |</code>
            <br />
            <code className="text-[11px] font-mono">&gt; Important note</code>
          </div>
        </div>
      )}

      {/* ─── EDITOR BODY: WRITE / PREVIEW / SPLIT ─── */}
      <div className="relative w-full" style={{ minHeight }}>
        {/* Mode: Write Only */}
        {mode === "write" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            style={{ minHeight }}
            className="w-full h-full p-4 text-sm font-sans text-stone-900 dark:text-stone-100 bg-transparent resize-y focus:outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600 leading-relaxed font-normal"
          />
        )}

        {/* Mode: Preview Only */}
        {mode === "preview" && (
          <div
            style={{ minHeight }}
            className="w-full p-4 overflow-y-auto max-h-[460px] bg-stone-50/40 dark:bg-[#070b08]/50"
          >
            {value.trim() ? (
              <RichMarkdown content={value} onToggleTask={(next) => onChange(next)} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-stone-400 dark:text-stone-600 text-xs">
                <span className="text-2xl mb-1">✍️</span>
                <span>Nothing to preview yet. Switch back to Write mode to type.</span>
              </div>
            )}
          </div>
        )}

        {/* Mode: Split Screen (Side-by-Side) */}
        {mode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-emerald-950/70 h-full">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 text-sm font-sans text-stone-900 dark:text-stone-100 bg-transparent resize-none focus:outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600 leading-relaxed font-normal"
            />
            <div
              style={{ minHeight }}
              className="w-full p-4 overflow-y-auto max-h-[460px] bg-stone-50/40 dark:bg-[#070b08]/50"
            >
              {value.trim() ? (
                <RichMarkdown content={value} onToggleTask={(next) => onChange(next)} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-stone-400 dark:text-stone-600 text-xs">
                  <span>Live preview will appear here as you type</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── STATS FOOTER BAR ─── */}
      <div className="px-3.5 py-2 bg-stone-50/80 dark:bg-[#090f0a] border-t border-stone-200/80 dark:border-emerald-950/60 flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 select-none">
        <div className="flex items-center gap-3">
          <span>{words} words</span>
          <span>•</span>
          <span>{chars} characters</span>

          {totalTasks > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <span>☑</span>
                <span>
                  {completedTasks}/{totalTasks} tasks
                </span>
              </span>
            </>
          )}

          {mathEquations > 0 && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <span>∑</span>
                <span>
                  {mathEquations} {mathEquations === 1 ? "formula" : "formulas"}
                </span>
              </span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-stone-400 dark:text-stone-500">
          <span>Markdown & LaTeX enabled</span>
        </div>
      </div>
    </div>
  );
}
