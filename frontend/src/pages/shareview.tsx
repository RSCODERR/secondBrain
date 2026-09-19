import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Card } from "../components/Card"
import { LoaderIcon } from "../icons/loaderIcon"
import { BrainIcon } from "../icons/brainIcon"
import { Button } from "../components/button"
import { TwitterIcon } from "../icons/twitterIcon"
import { YoutubeIcon } from "../icons/youTubeIcon"
import { LinkIcon } from "../icons/linkIcon"
import { NoteIcon } from "../icons/noteIcon"
import { ThemeToggle } from "../components/ThemeToggle"

type FilterType = "all" | "youtube" | "twitter" | "link" | "note"

interface ContentItem {
  _id: string
  title: string
  link?: string | null
  note?: string | null
  type: "youtube" | "twitter" | "link" | "note"
}

export default function ShareView() {
  const { shareLink } = useParams()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchSharedBrain() {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/brain/${shareLink}`
        )
        setUsername(res.data.username)
        setContents(res.data.contents || [])
      } catch {
        setError("This share link is either invalid or has expired.")
      } finally {
        setLoading(false)
      }
    }

    if (shareLink) {
      fetchSharedBrain()
    }
  }, [shareLink])

  const counts = useMemo(() => {
    return {
      all: contents.length,
      youtube: contents.filter(c => c.type === "youtube").length,
      twitter: contents.filter(c => c.type === "twitter").length,
      link: contents.filter(c => c.type === "link").length,
      note: contents.filter(c => c.type === "note").length,
    }
  }, [contents])

  const filteredContents = useMemo(() => {
    return contents.filter(item => {
      const matchesType = filter === "all" || item.type === filter
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesType && matchesSearch
    })
  }, [contents, filter, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-[#0b110d] transition-colors">
        <LoaderIcon />
        <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400 animate-pulse">Loading shared brain...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col justify-center items-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#121c15] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Brain Not Found</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{error}</p>
          <Link to="/">
            <Button text="Go to Homepage" varient="primary" size="md" fullWidth />
          </Link>
        </div>
      </div>
    )
  }

  const userInitial = username ? username.charAt(0).toUpperCase() : "U"

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0b110d] flex flex-col text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="flex justify-between items-center px-4 sm:px-8 py-3.5 bg-white/95 dark:bg-[#0e1610]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-30 shadow-xs transition-colors">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-gray-900 dark:text-white">
          <span className="text-[#2d4a31] dark:text-emerald-400">
            <BrainIcon />
          </span>
          <span>Second Brain</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/signin" className="hidden sm:block">
            <Button text="Login" size="sm" varient="secondary" />
          </Link>
          <Link to="/signup">
            <Button text="Build Your Brain" size="sm" varient="primary" />
          </Link>
        </div>
      </nav>

      {/* Profile Header Banner */}
      <header className="bg-white dark:bg-[#121c15] border-b border-gray-200 dark:border-white/5 py-8 px-4 sm:px-8 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-tr from-[#2d4a31] to-[#48734e] dark:from-emerald-700 dark:to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#2d4a31] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Shared Brain
                </span>
                <span className="text-xs text-gray-400 dark:text-zinc-500">Read-only</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {username}'s Second Brain
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Exploring {contents.length} saved {contents.length === 1 ? "memory" : "memories"}
              </p>
            </div>
          </div>

          {/* Type stats chips */}
          <div className="flex flex-wrap items-center gap-2">
            {counts.note > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-[#16231a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                <NoteIcon /> {counts.note} {counts.note === 1 ? "Note" : "Notes"}
              </span>
            )}
            {counts.youtube > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-[#16231a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                <YoutubeIcon /> {counts.youtube} {counts.youtube === 1 ? "Video" : "Videos"}
              </span>
            )}
            {counts.twitter > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-[#16231a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                <TwitterIcon /> {counts.twitter} {counts.twitter === 1 ? "Tweet" : "Tweets"}
              </span>
            )}
            {counts.link > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-[#16231a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-emerald-200 text-xs px-3 py-1.5 rounded-lg font-medium">
                <LinkIcon /> {counts.link} {counts.link === 1 ? "Link" : "Links"}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Filter & Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                filter === "all"
                  ? "bg-[#2d4a31] dark:bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#141f17] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1a2b20] border border-gray-200 dark:border-white/10"
              }`}
            >
              All ({counts.all})
            </button>

            {counts.note > 0 && (
              <button
                onClick={() => setFilter("note")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  filter === "note"
                    ? "bg-[#2d4a31] dark:bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#141f17] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1a2b20] border border-gray-200 dark:border-white/10"
                }`}
              >
                <NoteIcon /> Notes ({counts.note})
              </button>
            )}

            {counts.youtube > 0 && (
              <button
                onClick={() => setFilter("youtube")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  filter === "youtube"
                    ? "bg-[#2d4a31] dark:bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#141f17] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1a2b20] border border-gray-200 dark:border-white/10"
                }`}
              >
                <YoutubeIcon /> YouTube ({counts.youtube})
              </button>
            )}

            {counts.twitter > 0 && (
              <button
                onClick={() => setFilter("twitter")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  filter === "twitter"
                    ? "bg-[#2d4a31] dark:bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#141f17] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1a2b20] border border-gray-200 dark:border-white/10"
                }`}
              >
                <TwitterIcon /> Twitter ({counts.twitter})
              </button>
            )}

            {counts.link > 0 && (
              <button
                onClick={() => setFilter("link")}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  filter === "link"
                    ? "bg-[#2d4a31] dark:bg-emerald-600 text-white shadow-xs"
                    : "bg-white dark:bg-[#141f17] text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1a2b20] border border-gray-200 dark:border-white/10"
                }`}
              >
                <LinkIcon /> Links ({counts.link})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search in this brain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-[#141f17] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#2d4a31] dark:focus:ring-emerald-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {/* Card Grid */}
        {filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredContents.map(({ _id, title, link, type, note }) => (
              <Card
                key={_id}
                id={_id}
                title={title}
                link={link}
                note={note}
                type={type}
                readonly
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#121c15] rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center max-w-md mx-auto my-12">
            <div className="text-gray-400 dark:text-zinc-500 text-4xl mb-3">🔍</div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1">No matching content</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
              {searchQuery
                ? `No memories found matching "${searchQuery}"`
                : "No items in this category"}
            </p>
            {(searchQuery || filter !== "all") && (
              <button
                onClick={() => {
                  setFilter("all")
                  setSearchQuery("")
                }}
                className="text-xs font-semibold text-[#2d4a31] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* Footer CTA Banner */}
        <section className="mt-16 bg-linear-to-r from-[#2d4a31] to-[#3b6140] dark:from-[#132819] dark:to-[#1a3823] dark:border dark:border-emerald-800/30 text-white rounded-2xl p-6 sm:p-10 text-center shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Create Your Own Second Brain
          </h2>
          <p className="mt-2 text-emerald-100 dark:text-emerald-200 text-sm sm:text-base max-w-xl mx-auto">
            Organize tweets, YouTube videos, websites, and personal notes all in one place.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/signup">
              <Button text="Get Started — It's Free" size="md" varient="secondary" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
