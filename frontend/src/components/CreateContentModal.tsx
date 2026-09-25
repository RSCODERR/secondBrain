import { useRef, useState } from "react"
import { CrossIcon } from "../icons/crossIcon"
import { Button } from "./button"
import { Input } from "./Input"
import { YoutubeIcon } from "../icons/youTubeIcon"
import { TwitterIcon } from "../icons/twitterIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { BrainIcon } from "../icons/brainIcon"
import { RichNoteEditor } from "./RichNoteEditor"
import { BACKEND_URL } from "../config"
import axios from "axios"

export type ContentType = "youtube" | "twitter" | "link" | "note"

interface CreateContentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const typeOptions = [
  {
    id: "youtube" as const,
    label: "YouTube",
    description: "Video & Shorts",
    icon: <YoutubeIcon />,
    activeClass: "border-red-500 bg-red-50/80 dark:bg-red-950/50 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-xs",
    hoverClass: "hover:border-red-200 hover:bg-red-50/30 dark:hover:bg-red-950/20",
  },
  {
    id: "twitter" as const,
    label: "Twitter",
    description: "Posts & Threads",
    icon: <TwitterIcon />,
    activeClass: "border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20 shadow-xs",
    hoverClass: "hover:border-sky-200 hover:bg-sky-50/30 dark:hover:bg-sky-950/20",
  },
  {
    id: "link" as const,
    label: "Link",
    description: "Web page & doc",
    icon: <LinkIcon />,
    activeClass: "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs",
    hoverClass: "hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20",
  },
  {
    id: "note" as const,
    label: "Note",
    description: "Thoughts & ideas",
    icon: <NoteIcon />,
    activeClass: "border-[#4a7a50] bg-stone-100/80 dark:bg-[#18261e] text-stone-800 dark:text-emerald-200 ring-2 ring-[#4a7a50]/20 shadow-xs",
    hoverClass: "hover:border-stone-300 hover:bg-stone-50/40 dark:hover:bg-[#18261e]/40",
  },
]

export function CreateContentModal({
  open,
  onClose,
  onSuccess
}: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const linkRef = useRef<HTMLInputElement | null>(null)

  const [type, setType] = useState<ContentType>("youtube")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addcontent() {
    const title = titleRef.current?.value.trim()
    const link = linkRef.current?.value.trim()
    const noteContent = note.trim()

    if (!title) {
      setError("Please give your content a title")
      titleRef.current?.focus()
      return
    }

    if (type !== "note" && !link) {
      setError(`Please provide a ${type === "youtube" ? "YouTube" : type === "twitter" ? "Twitter" : "valid"} link`)
      linkRef.current?.focus()
      return
    }

    if (type === "note" && !noteContent) {
      setError("Please write some note content")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await axios.post(
        `${BACKEND_URL}/api/v1/content`,
        {
          title,
          type,
          link: type === "note" ? null : link,
          note: type === "note" ? noteContent : null
        },
        { withCredentials: true }
      )

      if (titleRef.current) titleRef.current.value = ""
      if (linkRef.current) linkRef.current.value = ""
      setNote("")

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add content. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Ambient backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 dark:bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className={`relative bg-white dark:bg-[#131d16] text-stone-800 dark:text-stone-100 rounded-3xl w-full ${type === "note" ? "max-w-2xl" : "max-w-lg"} p-5 sm:p-7 z-10 shadow-2xl border border-stone-100 dark:border-emerald-950/70 my-auto transform transition-all duration-300 max-h-[92vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2d4a31] to-[#4a7a50] dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0">
              <BrainIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Add to Second Brain</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Capture links, media, and thoughts in one place</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1b2b20] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CrossIcon size="md" />
          </button>
        </div>

        {/* Content Type Selector Tiles */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
            Select Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map((opt) => {
              const isActive = type === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setType(opt.id)
                    setError(null)
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center ${
                    isActive ? opt.activeClass : `border-stone-200 dark:border-emerald-950/70 text-stone-600 dark:text-stone-300 bg-white dark:bg-[#0c120e] ${opt.hoverClass}`
                  }`}
                >
                  <span className="text-lg mb-1">{opt.icon}</span>
                  <span className="text-xs font-bold tracking-tight">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <Input
              reference={titleRef}
              placeholder="e.g. Distributed Systems Masterclass or Project Roadmap"
              autoFocus
            />
          </div>

          {type !== "note" ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  {type === "youtube" ? "YouTube Video URL" : type === "twitter" ? "Twitter / X URL" : "Web URL"}
                </label>
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  {type === "youtube" ? "Supports Shorts & Videos" : type === "twitter" ? "x.com or twitter.com" : "Any valid https:// link"}
                </span>
              </div>
              <Input
                reference={linkRef}
                placeholder={
                  type === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : type === "twitter"
                    ? "https://x.com/username/status/..."
                    : "https://example.com/article"
                }
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Note Content
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Markdown, LaTeX & Code
                </span>
              </div>
              <RichNoteEditor
                value={note}
                onChange={setNote}
                placeholder="Write your note in rich markdown... Supports $math$, ```code```, - [ ] tasks, and quotes."
                minHeight="200px"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-emerald-950/70 flex items-center justify-end gap-3">
          <Button
            varient="ghost"
            size="md"
            text="Cancel"
            onClick={onClose}
          />

          <Button
            varient="primary"
            size="md"
            loading={loading}
            text={loading ? "Saving..." : "Add Content"}
            onClick={addcontent}
          />
        </div>
      </div>
    </div>
  )
}
