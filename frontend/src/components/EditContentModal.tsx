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
    activeClass: "border-red-500 bg-red-50/80 text-red-700 ring-2 ring-red-500/20 shadow-xs",
    hoverClass: "hover:border-red-200 hover:bg-red-50/30",
  },
  {
    id: "twitter" as const,
    label: "Twitter",
    description: "Posts & Threads",
    icon: <TwitterIcon />,
    activeClass: "border-sky-500 bg-sky-50/80 text-sky-700 ring-2 ring-sky-500/20 shadow-xs",
    hoverClass: "hover:border-sky-200 hover:bg-sky-50/30",
  },
  {
    id: "link" as const,
    label: "Link",
    description: "Web page & doc",
    icon: <LinkIcon />,
    activeClass: "border-indigo-500 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs",
    hoverClass: "hover:border-indigo-200 hover:bg-indigo-50/30",
  },
  {
    id: "note" as const,
    label: "Note",
    description: "Thoughts & ideas",
    icon: <NoteIcon />,
    activeClass: "border-purple-500 bg-purple-50/80 text-purple-700 ring-2 ring-purple-500/20 shadow-xs",
    hoverClass: "hover:border-purple-200 hover:bg-purple-50/30",
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
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-3xl w-full max-w-lg p-5 sm:p-7 z-10 shadow-2xl border border-gray-100 my-auto transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0">
              <EditIcon size="md" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Content</h2>
              <p className="text-xs text-gray-500 mt-0.5">Update title, category, or note details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CrossIcon size="md" />
          </button>
        </div>

        {/* Type Selector Tiles */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
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
                    isActive ? opt.activeClass : `border-gray-200 text-gray-600 bg-white ${opt.hoverClass}`
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
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Note Content
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={5}
                placeholder="Write your note here..."
                className="w-full px-4 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-2xl resize-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 shadow-xs"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-600 font-medium">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
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
