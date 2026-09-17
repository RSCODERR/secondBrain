import { useEffect, useState } from "react"
import { CrossIcon } from "../icons/crossIcon"
import { Button } from "./button"
import { Input } from "./Input"
import { YoutubeIcon } from "../icons/youTubeIcon"
import { TwitterIcon } from "../icons/twitterIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { EditIcon } from "../icons/editIcon"
import { BACKEND_URL } from "../config"
import axios from "axios"

export type ContentType = "youtube" | "twitter" | "link" | "note"

export interface ContentItem {
  _id: string
  title: string
  link?: string | null
  note?: string | null
  type: ContentType
}

interface EditContentModalProps {
  open: boolean
  content: ContentItem | null
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

export function EditContentModal({
  open,
  content,
  onClose,
  onSuccess
}: EditContentModalProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ContentType>("youtube")
  const [link, setLink] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (content) {
      setTitle(content.title || "")
      setType(content.type || "youtube")
      setLink(content.link || "")
      setNote(content.note || "")
      setError(null)
    }
  }, [content, open])

  async function handleUpdate() {
    if (!content) return

    const trimmedTitle = title.trim()
    const trimmedLink = link.trim()
    const trimmedNote = note.trim()

    if (!trimmedTitle) {
      setError("Title is required")
      return
    }

    if (type !== "note" && !trimmedLink) {
      setError("Link is required")
      return
    }

    if (type === "note" && !trimmedNote) {
      setError("Note content cannot be empty")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await axios.put(
        `${BACKEND_URL}/api/v1/content/${content._id}`,
        {
          title: trimmedTitle,
          type,
          link: type === "note" ? null : trimmedLink,
          note: type === "note" ? trimmedNote : null
        },
        { withCredentials: true }
      )

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update content")
    } finally {
      setLoading(false)
    }
  }

  if (!open || !content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/50 dark:bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative bg-white dark:bg-[#131d16] text-stone-800 dark:text-stone-100 rounded-3xl w-full max-w-lg p-5 sm:p-7 z-10 shadow-2xl border border-stone-100 dark:border-emerald-950/70 my-auto transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2d4a31] to-[#4a7a50] dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0">
              <EditIcon size="md" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Edit Content</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Update title, category, or note details</p>
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

        {/* Type Selector Tiles */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
            Change Type
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

        {/* Form Inputs */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
            />
          </div>

          {type !== "note" ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                {type === "youtube" ? "YouTube Video URL" : type === "twitter" ? "Twitter / X URL" : "Web URL"}
              </label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Paste link here"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Note Content
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                placeholder="Write your note here..."
                className="w-full px-4 py-3 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-[#0e1611] border border-stone-200 dark:border-emerald-900/60 rounded-2xl resize-none transition-all duration-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 hover:border-stone-300 dark:hover:border-emerald-700/60 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-xs"
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
            text={loading ? "Updating..." : "Save Changes"}
            onClick={handleUpdate}
          />
        </div>
      </div>
    </div>
  )
}
