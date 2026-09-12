import { BinIcon } from "../icons/binIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { ShareIcon } from "../icons/shareicon"
import { TwitterIcon } from "../icons/twitterIcon"
import { YoutubeIcon } from "../icons/youTubeIcon"

interface CardProps {
  id: string
  title: string
  link?: string | null
  note?: string | null
  type: "twitter" | "youtube" | "link" | "note"
  readonly?: boolean
  onDelete?: (id: string) => void
}

const youtubeUrlToEmbed = (url: string | null | undefined) => {
  if (!url || !URL.canParse(url)) return undefined
  const u = new URL(url)

  if (u.hostname.includes("youtu")) {
    return `https://www.youtube.com/embed/${u.searchParams.get("v")}`
  }

  return url
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

        <div className="flex items-center gap-4 shrink-0">
          {type !== "note" && link && (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-indigo-600 transition-colors"
              title="Open link"
            >
              <ShareIcon size="md" />
            </a>
          )}

          {!readonly && (
            <div
              onClick={() => onDelete?.(id)}
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
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
            <iframe
              className="w-full h-full rounded-lg"
              src={youtubeUrlToEmbed(link)}
              allowFullScreen
            />
          </div>
        )}

        {type === "twitter" && link && (
          <div className="mt-1">
            <blockquote className="twitter-tweet">
              <a href={link.replace("x.com", "twitter.com")}></a>
            </blockquote>
          </div>
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
