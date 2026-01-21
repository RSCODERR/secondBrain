import { useRef, useState } from "react"
import { CrossIcon } from "../icons/crossIcon"
import { Button } from "./button"
import { Input } from "./Input"
import { BACKEND_URL } from "../config"
import axios from "axios"

type ContentType = "youtube" | "twitter" | "link" | "note"

interface CreateContentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateContentModal({
  open,
  onClose,
  onSuccess
}: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const linkRef = useRef<HTMLInputElement | null>(null)
  const noteRef = useRef<HTMLTextAreaElement | null>(null)

  const [type, setType] = useState<ContentType>("youtube")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function addcontent() {
    const title = titleRef.current?.value.trim()
    const link = linkRef.current?.value.trim()
    const note = noteRef.current?.value.trim()

    if (!title) {
      setError("Title is required")
      return
    }

    if (type !== "note" && !link) {
      setError("Link is required")
      return
    }

    if (type === "note" && !note) {
      setError("Note cannot be empty")
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
          note: type === "note" ? note : null
        },
        { withCredentials: true }
      )

      titleRef.current!.value = ""
      if (linkRef.current) linkRef.current.value = ""
      if (noteRef.current) noteRef.current.value = ""

      onSuccess()
      onClose()
    } catch {
      setError("Failed to add content")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-white rounded-lg w-96 p-5 z-10">
        {/* Close */}
        <div className="flex justify-end">
          <div onClick={onClose} className="cursor-pointer">
            <CrossIcon size="md" />
          </div>
        </div>

        
        <div className="flex flex-col gap-3 mt-2">
          <Input reference={titleRef} placeholder="Title" />

          
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContentType)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
            <option value="link">Link</option>
            <option value="note">Note</option>
          </select>

          
          {type !== "note" && (
            <Input reference={linkRef} placeholder="Paste link here" />
          )}

          {type === "note" && (
            <textarea
              ref={noteRef}
              placeholder="Write your note..."
              rows={5}
              className="border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="mt-4">
          <Button
            onClick={addcontent}
            varient="primary"
            size="md"
            fullWidth
            loading={loading}
            text={loading ? "Adding..." : "Add Content"}
          />
        </div>
      </div>
    </div>
  )
}
