import { useEffect, useRef, useState } from "react"
import { BinIcon } from "../icons/binIcon"
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

    // Handle youtu.be/<id>
    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0]
      if (id) return `https://www.youtube.com/embed/${id}`
    }

    // Handle youtube.com
    if (host.includes("youtube.com")) {
      // 1. /watch?v=<id>
      const v = parsed.searchParams.get("v")
      if (v) return `https://www.youtube.com/embed/${v}`

      const segments = parsed.pathname.split("/").filter(Boolean)
      // 2. /shorts/<id>
      if (segments[0] === "shorts" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`
      }
      // 3. /embed/<id>
      if (segments[0] === "embed" && segments[1]) {
        return `https://www.youtube.com/embed/${segments[1]}`
      }
      // 4. /v/<id>
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
    <div ref={containerRef} className="w-full flex justify-center mt-1 min-h-[12rem]">
      <blockquote className="twitter-tweet" data-dnt="true" data-theme="light">
        <a 
          href={cleanLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-600 hover:underline text-sm"
        >
          Loading tweet...
        </a>
      </blockquote>
    </div>
  )
}

export const Card = ({
  id,
  title,
  link,
  note,
  type,
  readonly,
  onDelete
}: CardProps) => {
  const [copied, setCopied] = useState(false)
  const youtubeEmbedUrl = type === "youtube" ? getYouTubeEmbedUrl(link) : null

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
    <div className="flex flex-col p-4 sm:p-5 bg-white rounded-xl shadow-xs hover:shadow-md border border-gray-200 transition-all duration-200 w-full min-h-[20rem] max-h-[28rem]">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 font-medium text-gray-900 min-w-0">
          <span className="shrink-0">
            {type === "twitter" && <TwitterIcon />}
            {type === "youtube" && <YoutubeIcon />}
            {type === "link" && <LinkIcon />}
            {type === "note" && <NoteIcon />}
          </span>
          <span className="truncate" title={title}>{title}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* External Link icon if link exists (e.g. YouTube, Twitter, web links) */}
          {link && (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
              title="Open source in new tab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}

          {/* Share Card Button: Available on ALL cards including notes! */}
          <button
            onClick={handleShareCard}
            className={`p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              copied ? "text-green-600 font-semibold" : "text-gray-400 hover:text-purple-600"
            }`}
            title={copied ? "Link copied to clipboard!" : "Share this card"}
            aria-label="Share this card"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Copied!</span>
              </span>
            ) : (
              <ShareIcon size="md" />
            )}
          </button>

          {!readonly && (
            <div
              onClick={() => onDelete?.(id)}
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Delete"
            >
              <BinIcon size="lg" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {type === "youtube" && link && (
          <div className="w-full aspect-video mt-1">
            {youtubeEmbedUrl ? (
              <iframe
                className="w-full h-full rounded-lg"
                src={youtubeEmbedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 border border-dashed rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Could not preview video</p>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-indigo-600 hover:underline break-all"
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
            className="text-indigo-600 hover:text-indigo-800 underline break-all text-sm block mt-2"
          >
            {link}
          </a>
        )}

        {type === "note" && (
          <p className="whitespace-pre-wrap text-gray-700 text-sm sm:text-base leading-relaxed break-words">
            {note}
          </p>
        )}
      </div>
    </div>
  )
}
