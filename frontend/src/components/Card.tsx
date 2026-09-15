import { useEffect, useRef, useState } from "react"
import { BinIcon } from "../icons/binIcon"
import { EditIcon } from "../icons/editIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { ShareIcon } from "../icons/shareicon"
import { TwitterIcon } from "../icons/twitterIcon"
import { YoutubeIcon } from "../icons/youTubeIcon"

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement | null) => void
      }
    }
  }
}

interface CardProps {
  id: string
  title: string
  link?: string | null
  note?: string | null
  type: "twitter" | "youtube" | "link" | "note"
  readonly?: boolean
  onDelete?: (id: string) => void
  onEdit?: (content: {
    _id: string
    title: string
    link?: string | null
    note?: string | null
    type: "twitter" | "youtube" | "link" | "note"
  }) => void
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
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanLink = link.trim().replace(/^https?:\/\/x\.com/, "https://twitter.com")

  useEffect(() => {
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
  }, [cleanLink])

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden flex justify-center mt-1 min-h-[12rem]">
      <blockquote className="twitter-tweet" data-dnt="true" data-theme="light" data-width="100%">
        <a 
          href={cleanLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Loading tweet from @X...
        </a>
      </blockquote>
    </div>
  )
}

const typeStyles = {
  youtube: {
    accent: "from-red-500 to-rose-600",
    badge: "bg-red-50 text-red-700 border-red-200/80",
    label: "YouTube",
    icon: <YoutubeIcon />,
  },
  twitter: {
    accent: "from-sky-500 to-blue-600",
    badge: "bg-sky-50 text-sky-700 border-sky-200/80",
    label: "Twitter",
    icon: <TwitterIcon />,
  },
  link: {
    accent: "from-[#2d4a31] to-[#4a7a50]",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    label: "Link",
    icon: <LinkIcon />,
  },
  note: {
    accent: "from-[#4a7a50] to-stone-600",
    badge: "bg-stone-100 text-stone-700 border-stone-200/80",
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
  readonly,
  onDelete,
  onEdit
}: CardProps) => {
  const [copied, setCopied] = useState(false)
  const youtubeEmbedUrl = type === "youtube" ? getYouTubeEmbedUrl(link) : null
  const style = typeStyles[type] || typeStyles.note
  const hostname = getHostname(link)

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

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#2d4a31]/30 transition-all duration-200 overflow-hidden w-full min-w-0 max-w-full h-auto">
      {/* Top subtle category accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${style.accent}`} />

      <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header - 2 rows on mobile for readability, 1 row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          {/* Top Row on Mobile: Category Badge & Action Buttons */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badge} shrink-0`}>
              {style.icon}
              <span>{style.label}</span>
            </span>

            {/* Action Toolbar on Mobile */}
            <div className="flex md:hidden items-center gap-1 shrink-0">
              {link && (
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer active:scale-95"
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
                    ? "text-emerald-700 bg-emerald-50 font-semibold" 
                    : "text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                }`}
                title={copied ? "Copied to clipboard!" : "Share this card"}
                aria-label="Share this card"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-[11px] font-bold">Copied!</span>
                  </span>
                ) : (
                  <ShareIcon size="md" />
                )}
              </button>

              {!readonly && onEdit && (
                <button
                  onClick={() => onEdit({ _id: id, title, link, note, type })}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer active:scale-95"
                  title="Edit card"
                  aria-label="Edit card"
                >
                  <EditIcon size="md" />
                </button>
              )}

              {!readonly && (
                <button
                  onClick={() => onDelete?.(id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
                  title="Delete card"
                  aria-label="Delete card"
                >
                  <BinIcon size="md" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Title & Toolbar Combined */}
          <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug break-words md:truncate md:flex-1 md:mx-2" title={title}>
            {title}
          </h3>

          {/* Desktop Action Toolbar */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
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
                  ? "text-emerald-700 bg-emerald-50 font-semibold" 
                  : "text-stone-400 hover:text-stone-800 hover:bg-stone-100"
              }`}
              title={copied ? "Copied to clipboard!" : "Share this card"}
              aria-label="Share this card"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-[11px] font-bold">Copied!</span>
                </span>
              ) : (
                <ShareIcon size="md" />
              )}
            </button>

            {!readonly && onEdit && (
              <button
                onClick={() => onEdit({ _id: id, title, link, note, type })}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Edit card"
                aria-label="Edit card"
              >
                <EditIcon size="md" />
              </button>
            )}

            {!readonly && (
              <button
                onClick={() => onDelete?.(id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete card"
                aria-label="Delete card"
              >
                <BinIcon size="md" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-visible pr-0 min-w-0">
          {type === "youtube" && link && (
            <div className="w-full aspect-video mt-1 rounded-xl overflow-hidden shadow-2xs border border-stone-200 bg-black">
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
                <div className="flex flex-col items-center justify-center h-full bg-stone-50 p-3 text-center">
                  <p className="text-xs text-stone-500 mb-1">Preview not available</p>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-red-600 font-semibold hover:underline"
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
              className="flex flex-col p-3.5 sm:p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 border border-stone-200 hover:border-[#2d4a31]/30 transition-all duration-200 group/link mt-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 shadow-2xs">
                  <LinkIcon size="sm" />
                  <span className="truncate max-w-[160px]">{hostname}</span>
                </span>
                <span className="text-xs font-semibold text-[#2d4a31] flex items-center gap-1 group-hover/link:translate-x-0.5 transition-transform">
                  <span>Visit</span>
                  <span>↗</span>
                </span>
              </div>
              <p className="text-xs text-stone-600 line-clamp-2 break-all group-hover/link:text-stone-900 transition-colors">
                {link}
              </p>
            </a>
          )}

          {type === "note" && (
            <div className="bg-stone-50/80 border border-stone-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs">
              <p className="whitespace-pre-wrap text-stone-800 text-sm leading-relaxed break-words font-sans">
                {note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

