import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { SparkleIcon } from "../icons/sparkleIcon";
import { BrainIcon } from "../icons/brainIcon";
import { CrossIcon } from "../icons/crossIcon";
import { TwitterIcon } from "../icons/twitterIcon";
import { YoutubeIcon } from "../icons/youTubeIcon";
import { LinkIcon } from "../icons/linkIcon";
import { NoteIcon } from "../icons/noteIcon";
import { RichMarkdown } from "./RichMarkdown";

export interface ReferencedCard {
  _id: string;
  title: string;
  type: string;
  link?: string | null;
  tags?: any[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedCards?: ReferencedCard[];
  provider?: string;
  model?: string;
  timestamp: string;
}

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectCard?: (cardId: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: "🧠",
    title: "Summarize my collection",
    query: "Give me an overview of all the topics and notes currently saved in my Second Brain.",
  },
  {
    icon: "🛠️",
    title: "Backend & Dev resources",
    query: "What backend roadmaps, tools, or development guides do I have saved?",
  },
  {
    icon: "📚",
    title: "Find formulas & equations",
    query: "What math, physics, or scientific notes have I recorded?",
  },
  {
    icon: "💡",
    title: "Brainstorm new connections",
    query: "Based on what I have collected so far, what are 3 new related topics I should look into?",
  },
];

export function AIChatDrawer({ open, onClose, onSelectCard }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("sb_ai_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sb_ai_chat_history", JSON.stringify(messages));
    } catch {
      // storage quota
    }
  }, [messages]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  // Auto focus input on drawer open
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Format chat history for context (last 8 messages)
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/ai/chat`,
        {
          message: query,
          history: historyPayload,
        },
        { withCredentials: true }
      );

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.data.reply || "I couldn't generate a response. Please try again.",
        referencedCards: res.data.referencedCards || [],
        provider: res.data.provider,
        model: res.data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          err?.response?.data?.message ||
          "Sorry, I ran into an issue connecting to the AI providers. Please check that at least one API key is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your AI chat history?")) {
      setMessages([]);
      localStorage.removeItem("sb_ai_chat_history");
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <YoutubeIcon size="sm" />;
      case "twitter":
        return <TwitterIcon size="sm" />;
      case "link":
        return <LinkIcon size="sm" />;
      default:
        return <NoteIcon size="sm" />;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-cmd-fade"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-[#0f1712] border-l border-stone-200 dark:border-emerald-950/80 shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-cmd-slide">
        {/* Header */}
        <header className="px-5 py-4 border-b border-stone-200/90 dark:border-emerald-950/80 flex items-center justify-between bg-stone-50/70 dark:bg-[#121c15]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0">
              <SparkleIcon size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Ask Your Brain
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Qwen & Gemini
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                AI personal knowledge assistant with memory citations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-[#18261e] rounded-xl transition-colors cursor-pointer"
                title="Clear conversation history"
                aria-label="Clear chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-[#18261e] rounded-xl transition-colors cursor-pointer"
              title="Close drawer (Esc)"
              aria-label="Close drawer"
            >
              <CrossIcon size="md" />
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col justify-center items-center text-center py-6 px-3">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 dark:from-emerald-500/10 dark:to-indigo-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm animate-pulse">
                <BrainIcon />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Ask anything about your Second Brain
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-1 mb-6">
                I can search your notes, summarize videos & articles, find connections, or draft new ideas from your saved memories.
              </p>

              {/* Starter Prompt Chips */}
              <div className="w-full space-y-2">
                <div className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider text-left pl-1">
                  Try asking:
                </div>
                {STARTER_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p.query)}
                    className="w-full text-left p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50/70 dark:bg-[#131d16] dark:hover:bg-[#17251c] border border-stone-200/80 hover:border-emerald-300 dark:border-emerald-950/70 dark:hover:border-emerald-800/80 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base shrink-0">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {p.query}
                        </div>
                      </div>
                      <span className="text-stone-400 group-hover:text-emerald-500 transition-colors text-xs font-bold">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages List */
            <>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Bubble Container */}
                  <div
                    className={`relative max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 shadow-2xs ${
                      m.role === "user"
                        ? "bg-[#2d4a31] text-white rounded-br-xs"
                        : "bg-stone-50 dark:bg-[#142017] text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-emerald-950/80 rounded-bl-xs"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] opacity-75 font-medium">
                      <span className="flex items-center gap-1">
                        {m.role === "assistant" && (
                          <span className="text-emerald-500 font-bold">✨</span>
                        )}
                        <span>{m.role === "user" ? "You" : "Second Brain AI"}</span>
                        {m.model && (
                          <span className="opacity-60">• {m.model}</span>
                        )}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>

                    {/* Content */}
                    {m.role === "user" ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {m.content}
                      </p>
                    ) : (
                      <div className="text-xs sm:text-sm leading-relaxed overflow-x-auto">
                        <RichMarkdown content={m.content} />
                      </div>
                    )}

                    {/* Referenced Memory Cards Pills */}
                    {m.referencedCards && m.referencedCards.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-stone-200/80 dark:border-emerald-900/40">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2 flex items-center gap-1.5">
                          <span>📌 Referenced Memories ({m.referencedCards.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.referencedCards.map((rc) => (
                            <button
                              key={rc._id}
                              type="button"
                              onClick={() => {
                                onSelectCard?.(rc._id);
                                if (rc.link) {
                                  window.open(rc.link, "_blank", "noopener,noreferrer");
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-[#19271c] hover:bg-emerald-50 dark:hover:bg-[#203325] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-emerald-900/60 shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95 group/card"
                              title={`View "${rc.title}"`}
                            >
                              <span className="opacity-80 text-emerald-600 dark:text-emerald-400">
                                {getCardIcon(rc.type)}
                              </span>
                              <span className="truncate max-w-[160px] sm:max-w-[200px]">
                                {rc.title}
                              </span>
                              <span className="text-[10px] text-stone-400 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400">
                                ↗
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copy Button for Assistant */}
                    {m.role === "assistant" && (
                      <div className="mt-2 pt-1.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copy answer"
                        >
                          {copiedId === m.id ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Copied!
                            </span>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9 9.06 9.06 0 0 0-1.5.124m7.5 10.376h-3.375a1.125 1.125 0 0 1-1.125-1.125v-9.375m0 0V3.75m0 0A2.25 2.25 0 0 1 13.5 1.5h1.5" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking / Loading Indicator */}
              {loading && (
                <div className="flex items-start">
                  <div className="rounded-3xl p-4 bg-stone-50 dark:bg-[#142017] border border-stone-200/80 dark:border-emerald-950/80 rounded-bl-xs flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 shadow-2xs animate-pulse">
                    <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shrink-0 animate-spin">
                      <SparkleIcon size="sm" />
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>Synthesizing your Second Brain memories...</span>
                      <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Footer */}
        <footer className="p-3 sm:p-4 border-t border-stone-200 dark:border-emerald-950/80 bg-stone-50/80 dark:bg-[#121c15]/90 backdrop-blur-md shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex flex-col gap-2"
          >
            <div className="relative flex items-center bg-white dark:bg-[#0c120e] rounded-2xl border border-stone-200 dark:border-emerald-950/80 shadow-xs focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1.5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything about your notes, links, or videos..."
                disabled={loading}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none resize-none max-h-32 min-h-[38px]"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  input.trim() && !loading
                    ? "bg-[#2d4a31] hover:bg-[#395c3e] text-white shadow-md active:scale-95"
                    : "bg-stone-100 dark:bg-[#18261e] text-stone-300 dark:text-stone-600 cursor-not-allowed"
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 px-1">
              <span>
                Press <kbd className="px-1 py-0.5 rounded bg-stone-200/60 dark:bg-[#18261e] text-stone-600 dark:text-stone-400 font-mono text-[10px]">Enter ↵</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-stone-200/60 dark:bg-[#18261e] text-stone-600 dark:text-stone-400 font-mono text-[10px]">Shift+Enter</kbd> for newline
              </span>
              <span className="hidden sm:inline opacity-75">Multi-Model Failover Active</span>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
}
