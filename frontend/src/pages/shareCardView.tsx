import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Card } from "../components/Card"
import { LoaderIcon } from "../icons/loaderIcon"
import { BrainIcon } from "../icons/brainIcon"
import { Button } from "../components/button"

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
      } catch (err) {
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
      <div className="h-screen flex justify-center items-center bg-zinc-100">
        <LoaderIcon />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center max-w-md w-full">
          <p className="text-red-500 font-medium mb-4">{error || "Card not found"}</p>
          <Link to="/">
            <Button text="Go to Homepage" varient="primary" size="md" fullWidth />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 bg-white border-b sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span className="text-purple-600">
            <BrainIcon />
          </span>
          <span>Second Brain</span>
        </Link>

        <Link to="/signup">
          <Button text="Create Your Brain" size="sm" varient="primary" />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg">
          <div className="mb-4 text-center">
            <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold mb-1">
              Shared Memory
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Shared by <span className="text-purple-600">{username}</span>
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
            <Link to="/signup" className="text-sm text-gray-500 hover:text-purple-600 transition">
              Want to save links, notes, and tweets like this? <strong className="underline">Get Second Brain Free</strong>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
