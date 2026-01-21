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
    <div className="flex flex-col p-4 bg-white rounded-md shadow-md border w-96 h-98">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 font-medium">
          {type === "twitter" && <TwitterIcon />}
          {type === "youtube" && <YoutubeIcon />}
          {type === "link" && <LinkIcon />}
          {type === "note" && <NoteIcon />}
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center gap-6">
          {type !== "note" && link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ShareIcon size="md" />
            </a>
          )}

          {!readonly && (
            <div
              onClick={() => onDelete?.(id)}
              className="cursor-pointer text-gray-500 hover:text-red-500"
            >
              <BinIcon size="lg" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 flex-1 overflow-y-auto">
        {type === "youtube" && link && (
          <iframe
            className="w-full mt-2"
            src={youtubeUrlToEmbed(link)}
            allowFullScreen
          />
        )}

        {type === "twitter" && link && (
          <blockquote className="twitter-tweet">
            <a href={link.replace("x.com", "twitter.com")}></a>
          </blockquote>
        )}

        {type === "link" && link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline break-all"
          >
            {link}
          </a>
        )}

        {type === "note" && (
          <p className="whitespace-pre-wrap text-gray-800">
            {note}
          </p>
        )}
      </div>
    </div>
  )
}
