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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white p-6 sm:p-7 rounded-3xl w-full max-w-md z-10 shadow-2xl border border-gray-100 my-auto">
        <button
          className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CrossIcon size="md" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
            <BrainIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Share Your Brain
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Anyone with this link can view your curated collection
            </p>
          </div>
        </div>

        {/* Expiration notice */}
        <div className="bg-purple-50/80 border border-purple-100/90 rounded-2xl p-3.5 flex items-start gap-3 mb-5">
          <span className="text-base shrink-0 mt-0.5">⏱️</span>
          <div className="text-xs text-purple-950 leading-relaxed">
            <strong className="font-semibold text-purple-900">24-Hour Public Access</strong>
            <p className="text-purple-700/90 mt-0.5">
              This link gives read-only access to your notes and links. It expires automatically after 24 hours.
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-gray-700 select-all focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 shadow-2xs"
                />
                <button
                  onClick={() => copyToClipboard(link)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98] ${
                    copied
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/20"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
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
                className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline"
              >
                <span>Preview Public Brain</span>
                <span>↗</span>
              </a>

              <button
                onClick={generateLink}
                disabled={loading}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer hover:underline disabled:opacity-50 font-medium"
              >
                Regenerate Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
