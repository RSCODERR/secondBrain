import { useEffect, useRef, useState } from "react"
import { useTheme } from "../context/ThemeContext"
import { BinIcon } from "../icons/binIcon"
import { EditIcon } from "../icons/editIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { ShareIcon } from "../icons/shareicon"
import { TwitterIcon } from "../icons/twitterIcon"
import { YoutubeIcon } from "../icons/youTubeIcon"
import { RichMarkdown } from "./RichMarkdown"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { StarIcon } from "../icons/starIcon"
import { SparkleIcon } from "../icons/sparkleIcon"
import { getTagColorClass } from "../utils/tagColors"

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement | null) => void
      }
    }
  }
}

export interface TagItem {
  _id?: string
  title: string
}

interface CardProps {
  id: string
  title: string
  link?: string | null
  note?: string | null
  type: "twitter" | "youtube" | "link" | "note"
  tags?: (TagItem | string)[]
  pinned?: boolean
  readonly?: boolean
  onDelete?: (id: string) => void
  onEdit?: (content: {
    _id: string
    title: string
    link?: string | null
    note?: string | null
    type: "twitter" | "youtube" | "link" | "note"
    tags?: (TagItem | string)[]
    pinned?: boolean
  }) => void
  onTogglePin?: (id: string) => void
  onTagClick?: (tag: string) => void
  semanticReason?: string
}

const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  const trimmed = url.trim()
  const validUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`

  try {
    const parsed = new URL(validUrl)
    const host = parsed.hostname.toLowerCase()

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    if (host.includes("youtube.com")) {
      const v = parsed.searchParams.get("v")
      if (v) return `https://www.youtube.com/embed/${v}`

      const segments = parsed.pathname.split("/").filter(Boolean)
      if (segments[0] === "shorts" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`
      }
      if (segments[0] === "embed" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`
      }
      if (segments[0] === "v" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`
      }
    }
  } catch {
    // Regex fallback
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = trimmed.match(regex)
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }

  return null
}

const getHostname = (url: string | null | undefined): string => {
  if (!url) return "web"
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return "link"
  }
}

const TwitterEmbed = ({ link }: { link: string }) => {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanLink = link.trim().replace(/^https?:\/\/x\.com/, "https://twitter.com")

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <blockquote class="twitter-tweet" data-dnt="true" data-theme="${resolvedTheme}" data-width="100%">
          <a 
            href="${cleanLink}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="${resolvedTheme === "dark" ? "text-emerald-400" : "text-[#2d4a31]"} hover:underline text-sm font-medium"
          >
            Loading tweet from @X...
          </a>
        </blockquote>
      `
    }

    if (window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current)
    } else {
      const existingScript = document.getElementById("twitter-widgets-script")
      if (!existingScript) {
        const script = document.createElement("script")
        script.id = "twitter-widgets-script"
        script.src = "https://platform.twitter.com/widgets.js"
        script.async = true
        script.onload = () => {
          window.twttr?.widgets?.load(containerRef.current)
        }
        document.head.appendChild(script)
      } else {
        existingScript.addEventListener("load", () => {
          window.twttr?.widgets?.load(containerRef.current)
        })
      }
    }
  }, [cleanLink, resolvedTheme])

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden flex justify-center mt-1 min-h-[12rem]" />
  )
}

const typeStyles = {
  youtube: {
    accent: "from-red-500 to-rose-600",
    badge: "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60",
    label: "YouTube",
    icon: <YoutubeIcon />,
  },
  twitter: {
    accent: "from-sky-500 to-blue-600",
    badge: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60",
    label: "Twitter",
    icon: <TwitterIcon />,
  },
  link: {
    accent: "from-[#2d4a31] to-[#4a7a50] dark:from-emerald-500 dark:to-teal-400",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
    label: "Link",
    icon: <LinkIcon />,
  },
  note: {
    accent: "from-[#4a7a50] to-stone-600 dark:from-emerald-600 dark:to-stone-500",
    badge: "bg-stone-100 text-stone-700 border-stone-200/80 dark:bg-[#18261e] dark:text-stone-300 dark:border-emerald-900/50",
    label: "Note",
    icon: <NoteIcon />,
  },
}

export const Card = ({
  id,
  title,
  link,
  note,
  type,
  tags,
  pinned,
  readonly,
  onDelete,
  onEdit,
  onTogglePin,
  onTagClick,
  semanticReason,
}: CardProps) => {
  const [copied, setCopied] = useState(false)
  const [noteText, setNoteText] = useState(note || "")
  const [isPinned, setIsPinned] = useState(Boolean(pinned))

  useEffect(() => {
    setNoteText(note || "")
  }, [note])

  useEffect(() => {
    setIsPinned(Boolean(pinned))
  }, [pinned])

  const youtubeEmbedUrl = type === "youtube" ? getYouTubeEmbedUrl(link) : null
  const style = typeStyles[type] || typeStyles.note
  const hostname = getHostname(link)

  const handleToggleTask = async (nextMarkdown: string) => {
    setNoteText(nextMarkdown)
    if (readonly || !id) return

    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/content/${id}`,
        {
          title,
          type,
          link: type === "note" ? null : link,
          note: nextMarkdown,
        },
        { withCredentials: true }
      )
    } catch (err) {
      console.error("Failed to persist task checkbox state:", err)
      setNoteText(note || "")
    }
  }

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (readonly || !id) return
    const next = !isPinned
    setIsPinned(next)
    if (onTogglePin) {
      try {
        await onTogglePin(id)
      } catch (err) {
        console.error("Failed to toggle pin state via callback:", err)
        setIsPinned(!next)
      }
    } else {
      try {
        await axios.patch(`${BACKEND_URL}/api/v1/content/${id}/pin`, {}, { withCredentials: true })
      } catch {
        try {
          await axios.put(`${BACKEND_URL}/api/v1/content/${id}/pin`, {}, { withCredentials: true })
        } catch (err) {
          console.error("Failed to toggle pin state:", err)
          setIsPinned(!next)
        }
      }
    }
  }

  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryProvider, setSummaryProvider] = useState<string | null>(null)
  const [summaryModel, setSummaryModel] = useState<string | null>(null)
  const [summaryCopied, setSummaryCopied] = useState(false)

  const handleShareCard = async () => {
    const cardShareUrl = `${window.location.origin}/share/card/${id}`
    try {
      await navigator.clipboard.writeText(cardShareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy card link:", err)
    }
  }

  const fetchSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/ai/summarize`,
        {
          cardId: id,
          title,
          type,
          link,
          note: noteText,
          tags,
        },
        { withCredentials: true }
      )
      if (res.data?.summary) {
        setSummary(res.data.summary)
        setSummaryProvider(res.data.provider || null)
        setSummaryModel(res.data.model || null)
      } else {
        setSummaryError("Could not generate summary.")
      }
    } catch (err: any) {
      console.error("Failed to generate summary:", err)
      setSummaryError(
        err.response?.data?.message || "Failed to generate AI summary. Please try again."
      )
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleToggleSummary = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !showSummary
    setShowSummary(next)
    if (next && !summary && !summaryLoading) {
      fetchSummary()
    }
  }

  const handleCopySummary = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy summary:", err)
    }
  }

  return (
    <div
      id={id}
      className={`group relative flex flex-col bg-white dark:bg-[#121c15] rounded-2xl border transition-all duration-200 overflow-hidden w-full min-w-0 max-w-full h-auto ${
        isPinned
          ? "border-amber-400/90 dark:border-amber-500/50 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.18)] dark:shadow-[0_4px_25px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/30 dark:ring-amber-500/20"
          : "border-stone-200/90 dark:border-emerald-950/70 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-[#2d4a31]/30 dark:hover:border-emerald-600/40"
      }`}
    >
      {/* Top category accent bar - Golden gradient if pinned */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          isPinned
            ? "from-amber-400 via-amber-500 to-yellow-400"
            : style.accent
        }`}
      />

      <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header - 2 rows on mobile for readability, 1 row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          {/* Top Row on Mobile: Category Badge, Pinned Badge & Action Buttons */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badge} shrink-0`}>
                {style.icon}
                <span>{style.label}</span>
              </span>

              {isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shrink-0 shadow-2xs">
                  <span>⭐</span>
                  <span>Pinned</span>
                </span>
              )}
            </div>

            {/* Action Toolbar on Mobile */}
            <div className="flex md:hidden items-center gap-1 shrink-0">
              {!readonly && (
                <button
                  onClick={handleTogglePin}
                  className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                    isPinned
                      ? "text-amber-500 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-2xs"
                      : "text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                  }`}
                  title={isPinned ? "Unpin card" : "Pin to top / Add to favorites"}
                  aria-label={isPinned ? "Unpin card" : "Pin to top / Add to favorites"}
                >
                  <StarIcon size="md" filled={isPinned} />
                </button>
              )}

              {link && (
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e] transition-colors cursor-pointer active:scale-95"
                  title="Open original link"
                  aria-label="Open original link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}

              <button
                onClick={handleShareCard}
                className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 active:scale-95 ${
                  copied 
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 font-semibold" 
                    : "text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e]"
                }`}
                title={copied ? "Copied to clipboard!" : "Share this card"}
                aria-label="Share this card"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-[11px] font-bold">Copied!</span>
                  </span>
                ) : (
                  <ShareIcon size="md" />
                )}
              </button>

              <button
                onClick={handleToggleSummary}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                  showSummary
                    ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/80 ring-1 ring-emerald-500/50 shadow-2xs font-semibold"
                    : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
                }`}
                title={showSummary ? "Hide AI summary" : "✨ Summarize with AI"}
                aria-label={showSummary ? "Hide AI summary" : "✨ Summarize with AI"}
              >
                <SparkleIcon size="sm" className={showSummary ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : ""} />
              </button>

              {!readonly && onEdit && (
                <button
                  onClick={() => onEdit({ _id: id, title, link, note: noteText, type, tags, pinned: isPinned })}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e] transition-colors cursor-pointer active:scale-95"
                  title="Edit card"
                  aria-label="Edit card"
                >
                  <EditIcon size="md" />
                </button>
              )}

              {!readonly && (
                <button
                  onClick={() => onDelete?.(id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:text-stone-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer active:scale-95"
                  title="Delete card"
                  aria-label="Delete card"
                >
                  <BinIcon size="md" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Title & Toolbar Combined */}
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-snug break-words md:truncate md:flex-1 md:mx-2" title={title}>
            {title}
          </h3>

          {/* Desktop Action Toolbar */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {!readonly && (
              <button
                onClick={handleTogglePin}
                className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-90 ${
                  isPinned
                    ? "text-amber-500 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-2xs"
                    : "text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                }`}
                title={isPinned ? "Unpin card" : "Pin to top / Add to favorites"}
                aria-label={isPinned ? "Unpin card" : "Pin to top / Add to favorites"}
              >
                <StarIcon size="md" filled={isPinned} />
              </button>
            )}

            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e] transition-colors cursor-pointer"
                title="Open original link"
                aria-label="Open original link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}

            <button
              onClick={handleShareCard}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                copied 
                  ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 font-semibold" 
                  : "text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e]"
              }`}
              title={copied ? "Copied to clipboard!" : "Share this card"}
              aria-label="Share this card"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] font-bold">Copied!</span>
                </span>
              ) : (
                <ShareIcon size="md" />
              )}
            </button>

            <button
              onClick={handleToggleSummary}
              className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                showSummary
                  ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/80 ring-1 ring-emerald-500/50 shadow-2xs font-semibold"
                  : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/30"
              }`}
              title={showSummary ? "Hide AI summary" : "✨ Summarize with AI"}
              aria-label={showSummary ? "Hide AI summary" : "✨ Summarize with AI"}
            >
              <SparkleIcon size="sm" className={showSummary ? "text-emerald-600 dark:text-emerald-400 animate-pulse" : ""} />
              <span className="hidden xl:inline text-xs font-semibold">Summarize</span>
            </button>

            {!readonly && onEdit && (
              <button
                onClick={() => onEdit({ _id: id, title, link, note: noteText, type, tags, pinned: isPinned })}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-[#18261e] transition-colors cursor-pointer"
                title="Edit card"
                aria-label="Edit card"
              >
                <EditIcon size="md" />
              </button>
            )}

            {!readonly && (
              <button
                onClick={() => onDelete?.(id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:text-stone-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete card"
                aria-label="Delete card"
              >
                <BinIcon size="md" />
              </button>
            )}
          </div>
        </div>

        {/* Semantic Search Match Reason */}
        {semanticReason && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 dark:border-emerald-800/50 flex items-start gap-1.5 text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs animate-cmd-fade">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
              <SparkleIcon size="sm" />
            </span>
            <span className="leading-snug">
              <strong className="font-semibold text-emerald-800 dark:text-emerald-300">Concept Match:</strong> {semanticReason}
            </span>
          </div>
        )}

        {/* AI Summary Drawer / Panel */}
        {showSummary && (
          <div className="mb-3.5 rounded-xl border border-emerald-500/30 dark:border-emerald-600/30 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white/90 dark:from-[#0d1c13] dark:via-[#112419] dark:to-[#0f1d14] overflow-hidden shadow-2xs animate-cmd-fade">
            {/* Summary Drawer Header */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-900/30 border-b border-emerald-500/20 dark:border-emerald-800/40">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400">
                  <SparkleIcon size="sm" />
                </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  AI Summary
                </span>
                {(summaryModel || summaryProvider) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs">
                    {summaryProvider ? `${summaryProvider} • ` : ""}{summaryModel || "AI"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {summary && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="p-1 rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title={summaryCopied ? "Copied!" : "Copy summary"}
                    >
                      {summaryCopied ? (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Copied!</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fetchSummary(); }}
                      className="p-1 rounded-md text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title="Regenerate summary"
                    >
                      <svg className={`w-3.5 h-3.5 ${summaryLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowSummary(false); }}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  title="Close summary drawer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Summary Drawer Body */}
            <div className="p-3.5 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              {summaryLoading ? (
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
                    <span className="animate-spin text-emerald-600 dark:text-emerald-400">
                      <SparkleIcon size="sm" />
                    </span>
                    <span className="text-xs">Generating AI summary...</span>
                  </div>
                  <div className="h-2.5 bg-emerald-500/20 dark:bg-emerald-500/10 rounded w-5/6 animate-pulse" />
                  <div className="h-2.5 bg-emerald-500/20 dark:bg-emerald-500/10 rounded w-full animate-pulse" />
                  <div className="h-2.5 bg-emerald-500/20 dark:bg-emerald-500/10 rounded w-4/6 animate-pulse" />
                </div>
              ) : summaryError ? (
                <div className="flex flex-col gap-2 py-1 text-rose-600 dark:text-rose-400">
                  <span>{summaryError}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fetchSummary(); }}
                    className="self-start text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : summary ? (
                <div className="prose prose-xs dark:prose-invert max-w-none">
                  <RichMarkdown content={summary} />
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-visible pr-0 min-w-0">
          {type === "youtube" && link && (
            <div className="w-full aspect-video mt-1 rounded-xl overflow-hidden shadow-2xs border border-stone-200 dark:border-emerald-950/70 bg-black">
              {youtubeEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={youtubeEmbedUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-stone-50 dark:bg-[#0c120e] p-3 text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Preview not available</p>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {type === "twitter" && link && (
            <TwitterEmbed link={link} />
          )}

          {type === "link" && link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-3.5 sm:p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200 hover:border-[#2d4a31]/30 dark:bg-[#0c120e]/80 dark:hover:bg-[#142017] dark:border-emerald-950/80 dark:hover:border-emerald-600/40 transition-all duration-200 group/link mt-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-[#18261e] border border-stone-200 dark:border-emerald-900/60 text-stone-700 dark:text-stone-300 shadow-2xs">
                  <LinkIcon size="sm" />
                  <span className="truncate max-w-[160px]">{hostname}</span>
                </span>
                <span className="text-xs font-semibold text-[#2d4a31] dark:text-emerald-400 flex items-center gap-1 group-hover/link:translate-x-0.5 transition-transform">
                  <span>Visit</span>
                  <span>↗</span>
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 break-all group-hover/link:text-stone-900 dark:group-hover/link:text-stone-200 transition-colors">
                {link}
              </p>
            </a>
          )}

          {type === "note" && noteText && (
            <div className="bg-stone-50/80 border border-stone-200/90 dark:bg-[#0c120e]/80 dark:border-emerald-950/80 rounded-xl p-3.5 sm:p-4 shadow-2xs overflow-hidden">
              <RichMarkdown
                content={noteText}
                onToggleTask={!readonly ? handleToggleTask : undefined}
              />
            </div>
          )}

          {/* Tag Pills */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-stone-100 dark:border-emerald-950/60">
              {tags.map((tag) => {
                const tagTitle = typeof tag === "string" ? tag : tag.title;
                if (!tagTitle) return null;
                return (
                  <button
                    key={tagTitle}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tagTitle);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-2xs transition-all ${getTagColorClass(
                      tagTitle
                    )} ${
                      onTagClick
                        ? "cursor-pointer hover:scale-105 active:scale-95"
                        : "cursor-default"
                    }`}
                    title={onTagClick ? `Filter by #${tagTitle}` : undefined}
                  >
                    <span className="opacity-60 text-[10px]">#</span>
                    <span>{tagTitle}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

