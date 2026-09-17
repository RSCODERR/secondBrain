import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Card } from "../components/Card"
import { LoaderIcon } from "../icons/loaderIcon"
import { BrainIcon } from "../icons/brainIcon"
import { Button } from "../components/button"
import { LandingThemeToggle } from "../components/LandingThemeToggle"

interface SharedCardData {
  _id: string
  title: string
  link?: string | null
  note?: string | null
  type: "twitter" | "youtube" | "link" | "note"
}

export default function ShareCardView() {
  const { id } = useParams()
  const [content, setContent] = useState<SharedCardData | null>(null)
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSharedCard() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/card/${id}`)
        setContent(res.data.content)
        setUsername(res.data.username)
      } catch {
        setError("Card not found or link has expired")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSharedCard()
    }
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-zinc-100 dark:bg-[#0b110d] transition-colors">
        <LoaderIcon />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col justify-center items-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#121c15] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 text-center max-w-md w-full">
          <p className="text-red-500 dark:text-red-400 font-medium mb-4">{error || "Card not found"}</p>
          <Link to="/">
            <Button text="Go to Homepage" varient="primary" size="md" fullWidth />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-3.5 bg-white/95 dark:bg-[#0e1610]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30 transition-colors">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-[#2d4a31] dark:text-emerald-400">
            <BrainIcon />
          </span>
          <span>Second Brain</span>
        </Link>

        <div className="flex items-center gap-3">
          <LandingThemeToggle />
          <Link to="/signup">
            <Button text="Create Your Brain" size="sm" varient="primary" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg">
          <div className="mb-4 text-center">
            <p className="text-xs uppercase tracking-wider text-[#2d4a31] dark:text-emerald-400 font-semibold mb-1">
              Shared Memory
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Shared by <span className="text-[#2d4a31] dark:text-emerald-400">{username}</span>
            </h1>
          </div>

          <Card
            id={content._id}
            title={content.title}
            link={content.link}
            note={content.note}
            type={content.type}
            readonly
          />

          <div className="mt-6 text-center">
            <Link to="/signup" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-[#2d4a31] dark:hover:text-emerald-400 transition">
              Want to save links, notes, and tweets like this? <strong className="underline">Get Second Brain Free</strong>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
