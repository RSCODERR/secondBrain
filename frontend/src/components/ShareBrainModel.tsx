import { useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Button } from "./button"
import { CrossIcon } from "../icons/crossIcon"
import { BrainIcon } from "../icons/brainIcon"
import { ShareIcon } from "../icons/shareicon"

interface ShareBrainModalProps {
  open: boolean
  onClose: () => void
}

export function ShareBrainModal({ open, onClose }: ShareBrainModalProps) {
  const [link, setLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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
      await copyToClipboard(fullLink)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(textToCopy: string) {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative bg-white p-6 rounded-2xl w-full max-w-md z-10 shadow-2xl">
        <div
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-800 p-1"
          onClick={onClose}
        >
          <CrossIcon size="md" />
        </div>

        {/* Modal Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <BrainIcon />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Share Your Second Brain
            </h2>
            <p className="text-xs text-gray-500">
              Anyone with this link can view your saved memories
            </p>
          </div>
        </div>

        {/* Expiration notice */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-start gap-2.5 mb-5">
          <span className="text-sm">⏱️</span>
          <div className="text-xs text-purple-900">
            <strong>Public Read-Only Link</strong>
            <p className="text-purple-700 mt-0.5">
              The link gives read-only access to your notes and expires automatically in 24 hours.
            </p>
          </div>
        </div>

        {!link ? (
          <Button
            text={loading ? "Generating..." : "Generate & Copy Share Link"}
            varient="primary"
            size="md"
            startIcon={<ShareIcon size="md" />}
            onClick={generateLink}
            fullWidth
            loading={loading}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Your Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="w-full bg-zinc-50 border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-gray-700 select-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => copyToClipboard(link)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 underline"
              >
                <span>Preview public view</span>
                <span>↗</span>
              </a>

              <button
                onClick={generateLink}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer underline disabled:opacity-50"
              >
                Regenerate link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
