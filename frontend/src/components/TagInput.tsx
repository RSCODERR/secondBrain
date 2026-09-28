import React, { useState, useRef, useEffect } from "react";
import { getTagColorClass, normalizeTag } from "../utils/tagColors";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  onPendingChange?: (val: string) => void;
  suggestedTags?: string[];
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onChange,
  onPendingChange,
  suggestedTags = [],
  placeholder = "Add tags (e.g. work, design, reading)...",
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggested tags that match input and are not yet selected
  const matchingSuggestions = suggestedTags.filter((s) => {
    const norm = normalizeTag(s);
    if (!norm) return false;
    if (tags.some((t) => normalizeTag(t) === norm)) return false;
    if (!inputValue.trim()) return true;
    return norm.includes(normalizeTag(inputValue));
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (rawTag: string) => {
    if (!rawTag) return;
    const parts = rawTag
      .split(/[,]+/)
      .map((p) => normalizeTag(p))
      .filter(Boolean);

    let updated = [...tags];
    for (const clean of parts) {
      if (!updated.some((t) => normalizeTag(t) === clean) && updated.length < maxTags) {
        updated.push(clean);
      }
    }

    onChange(updated);
    setInputValue("");
    onPendingChange?.("");
    setActiveIndex(-1);
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      addTag(val);
      return;
    }
    setInputValue(val);
    onPendingChange?.(val);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleBlur = () => {
    // When clicking away or submitting, auto-commit any pending input
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If comma, tab, or enter pressed, add tag
    if (e.key === "," || e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (
        isOpen &&
        activeIndex >= 0 &&
        activeIndex < matchingSuggestions.length
      ) {
        addTag(matchingSuggestions[activeIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
      return;
    }

    // Space commits if there's text typed
    if (e.key === " " && inputValue.trim().length > 0) {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    // Backspace on empty input removes last tag
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      removeTag(tags.length - 1);
      return;
    }

    // Dropdown arrow navigation
    if (isOpen && matchingSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < matchingSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : matchingSuggestions.length - 1
        );
        return;
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label and counter */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <span>Tags</span>
          <span className="text-[11px] font-normal text-stone-400 dark:text-stone-500">
            (optional — press Enter, Space, Comma, or click + Add)
          </span>
        </label>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          {tags.length}/{maxTags}
        </span>
      </div>

      {/* Main tag input container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="min-h-[46px] p-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-stone-200 dark:border-emerald-950/80 bg-stone-50/60 dark:bg-[#0c120e] focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all cursor-text shadow-2xs"
      >
        {/* Selected tag pills */}
        {tags.map((tag, idx) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs animate-cmd-fade ${getTagColorClass(
              tag
            )}`}
          >
            <span className="opacity-60 text-[11px]">#</span>
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(idx);
              }}
              className="ml-0.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-colors cursor-pointer text-xs"
              title="Remove tag"
            >
              ✕
            </button>
          </span>
        ))}

        {/* Text input for new tag */}
        {tags.length < maxTags && (
          <div className="flex items-center gap-1 flex-1 min-w-[140px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : "Add more..."}
              className="flex-1 bg-transparent text-xs text-stone-800 dark:text-stone-200 focus:outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500 py-1"
            />
            {inputValue.trim().length > 0 && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(inputValue);
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 flex items-center gap-0.5"
                title="Add tag"
              >
                <span>+ Add</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && matchingSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#142017] shadow-xl z-50 p-1.5 animate-cmd-slide">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-stone-400 dark:text-stone-500">
            Suggested Tags
          </div>
          {matchingSuggestions.map((suggestion, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(suggestion);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1a2c1f]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">#</span>
                  <span>{suggestion}</span>
                </div>
                <span className="text-[10px] text-stone-400">↵ to select</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick click suggestions (chips below input) */}
      {suggestedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 select-none">
            Popular:
          </span>
          {suggestedTags
            .filter((st) => !tags.includes(normalizeTag(st)))
            .slice(0, 6)
            .map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => addTag(st)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-[#152319] hover:bg-stone-200 dark:hover:bg-[#1c3022] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-emerald-900/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  +
                </span>
                <span>#{st}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
