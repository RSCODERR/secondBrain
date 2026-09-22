import { useState, useMemo, useEffect } from "react"
import "../App.css"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Button } from "../components/button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { SideBar, type FilterType } from "../components/SideBar"
import { PlusIcon } from "../icons/PlusIcons"
import { ShareIcon } from "../icons/shareicon"
import { LoaderIcon } from "../icons/loaderIcon"
import { MenuIcon } from "../icons/menuIcon"
import { BrainIcon } from "../icons/brainIcon"
import { useContent } from "../hooks/useContent"
import { ShareBrainModal } from "../components/ShareBrainModel"
import { EditContentModal, type ContentItem } from "../components/EditContentModal"
import { LogoutIcon } from "../icons/logoutIcon"
import { useAuth } from "../context/AuthContext"
import { ThemeToggle } from "../components/ThemeToggle"
import { useTheme } from "../context/ThemeContext"
import { CommandPalette } from "../components/CommandPalette"

function DashBoard() {
  const { logout } = useAuth()
  const { themePreset, accentStyles } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editContent, setEditContent] = useState<ContentItem | null>(null)
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const { contents, loading, error, refetch } = useContent()

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const matchesType = !filterType || item.type === filterType
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesType && matchesSearch
    })
  }, [contents, filterType, searchQuery])


  const handleEdit = (content: ContentItem) => {
    setEditContent(content)
  }

  const handleDelete = async (contentId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, { withCredentials: true })
      refetch()
    } catch {
      alert("Failed to delete content")
    }
  }

  return (
    <div
      data-theme-preset={themePreset}
      style={accentStyles}
      className="dashboard-scope min-h-screen bg-slate-50/70 dark:bg-[#0b110d] text-stone-800 dark:text-stone-100 w-full max-w-full overflow-x-hidden transition-colors duration-200"
    >
      <SideBar
        onSelect={setFilterType}
        selectedType={filterType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="ml-0 lg:ml-72 min-h-screen p-4 md:p-6 lg:p-8 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
        {/* Mobile & Tablet Header Bar */}
        <header className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-emerald-950/70">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-[#142017] border border-stone-200 dark:border-emerald-900/60 hover:bg-stone-50 dark:hover:bg-[#1b2b20] text-stone-700 dark:text-stone-200 cursor-pointer shadow-xs transition"
              aria-label="Open Navigation Menu"
            >
              <MenuIcon size="md" />
            </button>
            <div
              className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-stone-100 cursor-pointer select-none"
              onClick={() => { setFilterType(null); setSearchQuery(""); }}
            >
              <span className="text-[#2d4a31] dark:text-emerald-400"><BrainIcon /></span>
              <span>Second Brain</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-white dark:bg-[#142017] border border-stone-200 dark:border-emerald-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 cursor-pointer shadow-xs transition"
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon size="md" />
            </button>
          </div>
        </header>

        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={refetch}
        />

        <ShareBrainModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />

        <EditContentModal
          open={!!editContent}
          content={editContent}
          onClose={() => setEditContent(null)}
          onSuccess={() => { refetch(); setEditContent(null); }}
        />

        <CommandPalette
          open={cmdPaletteOpen}
          onClose={() => setCmdPaletteOpen(false)}
          contents={contents}
          onAddContent={() => setModalOpen(true)}
          onShareBrain={() => setShareOpen(true)}
          onSetFilter={setFilterType}
          onSetSearch={setSearchQuery}
        />

        {/* Action Controls & Search Bar */}
        <div className="flex flex-col gap-3 mb-6">

          {/* Title + Action Buttons: Stacked on mobile (<sm), Row on tablet/desktop (sm+) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              {filterType ? (
                <div className="flex items-center gap-2 bg-[#2d4a31]/10 dark:bg-emerald-950/60 text-[#2d4a31] dark:text-emerald-300 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-[#2d4a31]/20 dark:border-emerald-800/60 min-w-0">
                  <span className="truncate">Showing: <strong className="capitalize">{filterType}</strong></span>
                  <button
                    onClick={() => setFilterType(null)}
                    className="cursor-pointer hover:text-[#1c2b1e] dark:hover:text-white font-bold ml-0.5 text-sm leading-none shrink-0"
                    title="Clear filter"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight shrink-0">
                  All Notes
                </h1>
              )}
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium bg-stone-200/70 dark:bg-[#152219] dark:border dark:border-emerald-900/40 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                {filteredContents.length} {filteredContents.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Action Buttons: Capsule (tablet/desktop only) + Share Brain + Add Content */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <div className="hidden sm:flex items-center">
                <ThemeToggle />
              </div>

              <Button
                varient="secondary"
                size="md"
                startIcon={<ShareIcon size="md" />}
                text="Share Brain"
                onClick={() => setShareOpen(true)}
                className="flex-1 sm:flex-initial"
              />

              <Button
                varient="primary"
                size="md"
                startIcon={<PlusIcon size="md" />}
                text="Add Content"
                onClick={() => setModalOpen(true)}
                className="flex-1 sm:flex-initial"
              />
            </div>
          </div>

          {/* Row 2: Search bar with Cmd+K hint */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search notes, videos, tweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-28 py-2.5 text-sm bg-white dark:bg-[#121c15] border border-stone-200 dark:border-emerald-950/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d4a31]/25 dark:focus:ring-emerald-500/20 focus:border-[#2d4a31] dark:focus:border-emerald-500 shadow-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-[#1b2b20] cursor-pointer transition-colors"
                title="Clear search"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setCmdPaletteOpen(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-pointer group"
                title="Open command palette (Ctrl+K)"
              >
                <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
                  <span className="text-[9px]">⌘</span>K
                </kbd>
              </button>
            )}
          </div>

        </div>

        {/* Content Cards Grid */}
        <div>
          {loading && (
            <div className="w-full py-20 flex justify-center items-center">
              <LoaderIcon />
            </div>
          )}

          {error && (
            <div className="w-full text-red-500 dark:text-red-400 text-center py-10 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && filteredContents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full min-w-0">
              {filteredContents.map(({ _id, type, link, title, note }) => (
                <Card
                  key={_id}
                  id={_id}
                  type={type}
                  link={link}
                  note={note}
                  title={title}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredContents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 dark:bg-[#121c15]/90 border border-stone-200/80 dark:border-emerald-950/70 rounded-3xl mt-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#2d4a31]/10 dark:bg-emerald-950/70 text-[#2d4a31] dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xs border border-[#2d4a31]/20 dark:border-emerald-800/50">
                {searchQuery ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ) : (
                  <BrainIcon />
                )}
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : filterType
                    ? `No ${filterType} items saved yet`
                    : "Your Second Brain is ready"}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mt-1 mb-5">
                {searchQuery
                  ? "We couldn't find any content matching your search. Try different keywords or clear your search."
                  : filterType
                    ? `You haven't saved any ${filterType} items yet. Click below to add your first one!`
                    : "Collect YouTube videos, Twitter posts, web links, and notes all in one beautiful place."}
              </p>
              {searchQuery ? (
                <Button
                  varient="secondary"
                  size="md"
                  text="Clear Search"
                  onClick={() => setSearchQuery("")}
                />
              ) : (
                <Button
                  varient="primary"
                  size="md"
                  startIcon={<PlusIcon size="lg" />}
                  text="Add Your First Content"
                  onClick={() => setModalOpen(true)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashBoard

