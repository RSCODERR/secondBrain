import { useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Button } from "./button"
import { CrossIcon } from "../icons/crossIcon"

interface ShareBrainModalProps {
  open: boolean
  onClose: () => void
}

export function ShareBrainModal({ open, onClose }: ShareBrainModalProps) {
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)

  async function generateLink() {
    try {
      setLoading(true)

      const res = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        {},
        { withCredentials: true }
      )

      const fullLink = `${window.location.origin}/share/${res.data.shareLink}`
      setLink(fullLink)
      await navigator.clipboard.writeText(fullLink)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      <div className="relative bg-white p-6 rounded-lg w-96 z-10">
        
        <div
          className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <CrossIcon size="md" />
        </div>

        <h2 className="text-lg font-semibold mb-2">
          Share Your Second Brain
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Anyone with this link can view your shared notes.
        </p>

        <Button
          text={loading ? "Generating..." : "Copy Share Link"}
          varient="primary"
          size="md"
          onClick={generateLink}
          fullWidth
          loading={loading}
        />

        {link && (
          <p className="text-xs mt-3 text-green-600 text-center">
            Link copied to clipboard
          </p>
        )}
      </div>
    </div>
  )
}
