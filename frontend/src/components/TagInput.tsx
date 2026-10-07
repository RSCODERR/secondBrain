import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { SparkleIcon } from "../icons/sparkleIcon";
import { getTagColorClass, normalizeTag } from "../utils/tagColors";

export interface ContentContext {
  title?: string;
  type?: string;
  link?: string;
  note?: string;
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  onPendingChange?: (val: string) => void;
  suggestedTags?: string[];
  placeholder?: string;
  maxTags?: number;
  contentContext?: ContentContext;
}

export function TagInput({
  tags,
  onChange,
  onPendingChange,
  suggestedTags = [],
  placeholder = "Add tags (e.g. work, design, reading)...",
  maxTags = 10,
  contentContext,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestError, setSuggestError] = useState<string | null>(null);
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

  const handleAutoSuggest = async () => {
    if (!contentContext?.title && !contentContext?.note && !contentContext?.link) {
      setSuggestError("Type title, note, or link first");
      setTimeout(() => setSuggestError(null), 3000);
      return;
    }

    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/ai/suggest-tags`, {
        title: contentContext.title || "",
        type: contentContext.type || "note",
        link: contentContext.link || "",
        note: contentContext.note || "",
        existingTags: tags,
      });

      if (Array.isArray(res.data?.tags) && res.data.tags.length > 0) {
        const newTags = res.data.tags.filter((t: string) => !tags.includes(normalizeTag(t)));
        if (newTags.length > 0) {
          setAiSuggestions(newTags);
        } else {
          setSuggestError("All suggested tags already added");
          setTimeout(() => setSuggestError(null), 3000);
        }
      } else {
        setSuggestError("No tags found for this content");
        setTimeout(() => setSuggestError(null), 3000);
      }
    } catch (err: any) {
      console.error("Auto suggest tags failed:", err);
      setSuggestError(err?.response?.data?.message || "Failed to suggest tags");
      setTimeout(() => setSuggestError(null), 3500);
    } finally {
      setIsSuggesting(false);
    }
  };

  const addAllAiSuggestions = () => {
    let updated = [...tags];
    for (const t of aiSuggestions) {
      if (!updated.includes(t) && updated.length < maxTags) {
        updated.push(t);
      }
    }
    onChange(updated);
    setAiSuggestions([]);
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
      {/* Label, AI Auto-suggest button, and counter */}
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Tags
          </label>
          <button
            type="button"
            onClick={handleAutoSuggest}
            disabled={isSuggesting}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Auto-suggest relevant tags using AI"
          >
            <SparkleIcon size="sm" className={isSuggesting ? "animate-spin text-emerald-600" : "text-emerald-600 dark:text-emerald-400"} />
            <span>{isSuggesting ? "Suggesting tags..." : "✨ Auto-suggest tags"}</span>
          </button>
          {suggestError && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 animate-cmd-fade">
              {suggestError}
            </span>
          )}
        </div>
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

      {/* AI Suggested Tags Bar */}
      {aiSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 mt-2 rounded-xl bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs animate-cmd-fade">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <SparkleIcon size="sm" className="text-emerald-600 dark:text-emerald-400" />
            <span>AI Suggested:</span>
          </span>
          {aiSuggestions.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                addTag(st);
                setAiSuggestions((prev) => prev.filter((t) => t !== st));
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-[#142218] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">+</span>
              <span>#{st}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={addAllAiSuggestions}
            className="ml-auto text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white underline cursor-pointer px-1"
          >
            Add All (+{aiSuggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setAiSuggestions([])}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer ml-1 text-xs"
            title="Dismiss suggestions"
          >
            ✕
          </button>
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
