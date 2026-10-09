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
import { MenuIcon } from "../icons/menuIcon"
import { BrainIcon } from "../icons/brainIcon"
import { useContent } from "../hooks/useContent"
import { ShareBrainModal } from "../components/ShareBrainModel"
import { CardSkeletonGrid } from "../components/skeletons"
import { EditContentModal, type ContentItem } from "../components/EditContentModal"
import { LogoutIcon } from "../icons/logoutIcon"
import { useAuth } from "../context/AuthContext"
import { ThemeToggle } from "../components/ThemeToggle"
import { useTheme } from "../context/ThemeContext"
import { CommandPalette } from "../components/CommandPalette"
import { getTagColorClass } from "../utils/tagColors"
import { AIChatDrawer } from "../components/AIChatDrawer"
import { AIFloatingButton } from "../components/AIFloatingButton"
import { SparkleIcon } from "../icons/sparkleIcon"

function DashBoard() {
  const { logout } = useAuth()
  const { themePreset, accentStyles } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [showOnlyPinned, setShowOnlyPinned] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSemanticSearch, setIsSemanticSearch] = useState(false)
  const [semanticLoading, setSemanticLoading] = useState(false)
  const [semanticMatches, setSemanticMatches] = useState<{ id: string; relevanceScore: number; reason: string }[]>([])
  const [editContent, setEditContent] = useState<ContentItem | null>(null)
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)

  // Global Shortcuts: Cmd+K (Palette), Cmd+J (Ask Brain AI)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdPaletteOpen((prev) => !prev)
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "j" || e.key === "J")) {
        e.preventDefault()
        setAiDrawerOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const { contents, loading, error, refetch } = useContent()

  // Extract all distinct tags with counts from user's contents
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, number>()
    contents.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t: any) => {
          const title = typeof t === "string" ? t : t?.title
          if (title) {
            const clean = title.trim().toLowerCase()
            tagMap.set(clean, (tagMap.get(clean) || 0) + 1)
          }
        })
      }
    })
    return Array.from(tagMap.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
  }, [contents])

  const pinnedCount = useMemo(() => {
    return contents.filter((c) => Boolean(c.pinned)).length
  }, [contents])

  const handleRunSemanticSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? searchQuery).trim()
    if (!q) return

    setIsSemanticSearch(true)
    setSemanticLoading(true)
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/ai/semantic-search`,
        {
          query: q,
          contents,
        },
        { withCredentials: true }
      )

      if (Array.isArray(res.data?.matches)) {
        setSemanticMatches(res.data.matches)
      } else {
        setSemanticMatches([])
      }
    } catch (err) {
      console.error("Semantic search failed:", err)
      setSemanticMatches([])
    } finally {
      setSemanticLoading(false)
    }
  }

  const filteredContents = useMemo(() => {
    // Conceptual Semantic Search mode active
    if (isSemanticSearch && searchQuery.trim() && !semanticLoading) {
      const matchMap = new Map<string, number>()
      semanticMatches.forEach((m, idx) => {
        matchMap.set(m.id, idx)
      })

      return contents
        .filter((item) => {
          const isMatched = matchMap.has(item._id)
          const matchesType = !filterType || item.type === filterType
          const matchesPinned = !showOnlyPinned || Boolean(item.pinned)
          const itemTags = (item.tags || []).map((t: any) =>
            (typeof t === "string" ? t : t.title || "").toLowerCase()
          )
          const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.every((st) => itemTags.includes(st.toLowerCase()))
          return isMatched && matchesType && matchesPinned && matchesTags
        })
        .sort((a, b) => {
          const rankA = matchMap.get(a._id) ?? 999
          const rankB = matchMap.get(b._id) ?? 999
          return rankA - rankB
        })
    }

    return contents
      .filter((item) => {
        const matchesType = !filterType || item.type === filterType
        const matchesPinned = !showOnlyPinned || Boolean(item.pinned)

        const itemTags = (item.tags || []).map((t: any) =>
          (typeof t === "string" ? t : t.title || "").toLowerCase()
        )

        // Multi-tag matching: every selected tag must be present
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((st) => itemTags.includes(st.toLowerCase()))

        const query = searchQuery.trim().toLowerCase()
        const matchesSearch =
          query === "" ||
          item.title.toLowerCase().includes(query) ||
          (item.note && item.note.toLowerCase().includes(query)) ||
          itemTags.some((t: string) => t.includes(query))

        return matchesType && matchesPinned && matchesTags && matchesSearch
      })
      .sort((a, b) => {
        // Locked at top of dashboard
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return 0
      })
  }, [contents, filterType, showOnlyPinned, selectedTags, searchQuery, isSemanticSearch, semanticMatches, semanticLoading])

  const handleTogglePin = async (contentId: string) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/v1/content/${contentId}/pin`,
        {},
        { withCredentials: true }
      )
      refetch()
    } catch (patchErr) {
      console.warn("PATCH pin failed, attempting PUT fallback:", patchErr)
      try {
        await axios.put(
          `${BACKEND_URL}/api/v1/content/${contentId}/pin`,
          {},
          { withCredentials: true }
        )
        refetch()
      } catch (err) {
        console.error("Failed to update pin state:", err)
        alert("Failed to update pin state. Please try again.")
        refetch()
      }
    }
  }

  const handleToggleTag = (tag: string) => {
    const norm = tag.trim().toLowerCase()
    setSelectedTags((prev) =>
      prev.includes(norm) ? prev.filter((t) => t !== norm) : [...prev, norm]
    )
  }

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

  const handleSelectCardFromAI = (cardId: string) => {
    setSearchQuery("")
    setFilterType(null)
    setShowOnlyPinned(false)
    setSelectedTags([])
    setTimeout(() => {
      const el = document.getElementById(cardId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.classList.add("ring-4", "ring-emerald-500", "scale-[1.02]")
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-emerald-500", "scale-[1.02]")
        }, 3000)
      }
    }, 150)
  }

  return (
    <div
      data-theme-preset={themePreset}
      style={accentStyles}
      className="dashboard-scope min-h-screen bg-slate-50/70 dark:bg-[#0b110d] text-stone-800 dark:text-stone-100 w-full max-w-full overflow-x-hidden transition-colors duration-200"
    >
      <SideBar
        onSelect={(type) => {
          setFilterType(type)
          if (type) setShowOnlyPinned(false)
        }}
        selectedType={filterType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showOnlyPinned={showOnlyPinned}
        onToggleFavorites={() => {
          setShowOnlyPinned((prev) => !prev)
          if (!showOnlyPinned) setFilterType(null)
        }}
        pinnedCount={pinnedCount}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={handleToggleTag}
        onClearTags={() => setSelectedTags([])}
        loading={loading}
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
              onClick={() => { setFilterType(null); setShowOnlyPinned(false); setSelectedTags([]); setSearchQuery(""); }}
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
          onOpenAI={() => setAiDrawerOpen(true)}
          onSemanticSearch={(q) => {
            setSearchQuery(q)
            handleRunSemanticSearch(q)
          }}
        />

        <AIChatDrawer
          open={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          onSelectCard={handleSelectCardFromAI}
        />

        {/* Action Controls & Search Bar */}
        <div className="flex flex-col gap-3 mb-6">

          {/* Title + Action Buttons: Stacked on mobile (<sm), Row on tablet/desktop (sm+) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              {showOnlyPinned ? (
                <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-amber-500/30 dark:border-amber-800/60 min-w-0">
                  <span className="truncate flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Favorites / Pinned</span>
                  </span>
                  <button
                    onClick={() => setShowOnlyPinned(false)}
                    className="cursor-pointer hover:text-amber-950 dark:hover:text-white font-bold ml-0.5 text-sm leading-none shrink-0"
                    title="Clear favorites filter"
                  >
                    ✕
                  </button>
                </div>
              ) : filterType ? (
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
                {loading ? (
                  <span className="inline-block w-12 h-3.5 bg-stone-300 dark:bg-emerald-900/60 rounded animate-pulse align-middle" />
                ) : (
                  `${filteredContents.length} ${filteredContents.length === 1 ? "item" : "items"}`
                )}
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

          {/* Row 2: Search bar with Semantic Search button & Cmd+K hint */}
          <div className="relative w-full flex items-center">
            <input
              type="text"
              placeholder={isSemanticSearch ? "Search conceptually with AI (e.g. clean architecture, productivity)..." : "Search notes, tags (#react), videos, tweets..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (isSemanticSearch) {
                  setSemanticMatches([])
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  e.preventDefault()
                  handleRunSemanticSearch()
                }
              }}
              className={`w-full pl-9 pr-36 sm:pr-40 py-2.5 text-sm bg-white dark:bg-[#121c15] border rounded-xl focus:outline-none focus:ring-2 shadow-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all ${
                isSemanticSearch
                  ? "border-emerald-500/80 dark:border-emerald-500/80 ring-2 ring-emerald-500/20"
                  : "border-stone-200 dark:border-emerald-950/80 focus:ring-[#2d4a31]/25 dark:focus:ring-emerald-500/20 focus:border-[#2d4a31] dark:focus:border-emerald-500"
              }`}
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

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSemanticMatches([])
                  }}
                  className="text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-[#1b2b20] cursor-pointer transition-colors"
                  title="Clear search"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (isSemanticSearch) {
                    setIsSemanticSearch(false)
                    setSemanticMatches([])
                  } else if (searchQuery.trim()) {
                    handleRunSemanticSearch()
                  } else {
                    setIsSemanticSearch(true)
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                  isSemanticSearch
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                }`}
                title={isSemanticSearch ? "Click to switch to keyword match" : "Search conceptually with AI"}
              >
                <SparkleIcon size="sm" className={semanticLoading ? "animate-spin text-current" : isSemanticSearch ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
                <span className="hidden sm:inline">{semanticLoading ? "Searching..." : isSemanticSearch ? "Semantic" : "✨ Semantic"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCmdPaletteOpen(true)}
                className="hidden md:flex items-center gap-1 cursor-pointer group"
                title="Open command palette (Ctrl+K)"
              >
                <kbd className="flex items-center gap-0.5 text-[10px] font-medium text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-[#1b2b20] px-1.5 py-0.5 rounded border border-stone-200 dark:border-emerald-900/40 group-hover:text-stone-600 dark:group-hover:text-stone-400 transition-colors">
                  <span className="text-[9px]">⌘</span>K
                </kbd>
              </button>
            </div>
          </div>

          {/* Semantic Search Active Banner */}
          {isSemanticSearch && searchQuery.trim() && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent dark:from-emerald-950/60 dark:via-teal-950/30 dark:to-transparent border border-emerald-500/25 dark:border-emerald-800/50 shadow-2xs animate-cmd-fade flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">
                  <SparkleIcon size="sm" className={semanticLoading ? "animate-spin" : ""} />
                </span>
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  {semanticLoading
                    ? `Searching conceptual memories for "${searchQuery}" with AI...`
                    : `AI Semantic Search: Found ${semanticMatches.length} conceptual ${semanticMatches.length === 1 ? "memory" : "memories"} for "${searchQuery}"`}
                </span>
              </div>

              {!semanticLoading && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRunSemanticSearch()}
                    className="text-xs text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white underline cursor-pointer font-medium"
                  >
                    Refresh
                  </button>
                  <span className="text-stone-300 dark:text-stone-700">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSemanticSearch(false)
                      setSemanticMatches([])
                    }}
                    className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer font-medium"
                  >
                    Switch to exact keywords
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Multi-Tag & State Filter Bar */}
          {(selectedTags.length > 0 || showOnlyPinned || filterType) && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-white/80 dark:bg-[#121c15]/90 border border-stone-200/90 dark:border-emerald-950/70 shadow-2xs">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold select-none flex items-center gap-1.5 pl-1 shrink-0">
                <span>Active Filters:</span>
              </span>

              {showOnlyPinned && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs animate-cmd-fade">
                  <span>⭐ Favorites</span>
                  <button
                    type="button"
                    onClick={() => setShowOnlyPinned(false)}
                    className="cursor-pointer hover:text-amber-900 dark:hover:text-white ml-0.5"
                    title="Remove favorites filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              {filterType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2d4a31]/10 dark:bg-emerald-950/70 text-[#2d4a31] dark:text-emerald-300 border border-[#2d4a31]/20 dark:border-emerald-800/60 shadow-2xs animate-cmd-fade capitalize">
                  <span>Type: {filterType}</span>
                  <button
                    type="button"
                    onClick={() => setFilterType(null)}
                    className="cursor-pointer hover:text-[#1c2b1e] dark:hover:text-white ml-0.5"
                    title="Remove type filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs animate-cmd-fade ${getTagColorClass(
                    tag
                  )}`}
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className="cursor-pointer opacity-70 hover:opacity-100 hover:text-red-500 ml-0.5"
                    title={`Remove #${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSelectedTags([])
                  setShowOnlyPinned(false)
                  setFilterType(null)
                }}
                className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 px-2.5 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#18261e] cursor-pointer transition-colors ml-auto shrink-0"
              >
                Clear all filters
              </button>
            </div>
          )}

        </div>

        {/* Content Cards Grid */}
        <div>
          {(loading || semanticLoading) && (
            <CardSkeletonGrid count={6} />
          )}

          {error && !loading && (
            <div className="w-full text-red-500 dark:text-red-400 text-center py-10 font-medium">
              {error}
            </div>
          )}

          {!loading && !semanticLoading && !error && filteredContents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full min-w-0">
              {filteredContents.map(({ _id, type, link, title, note, tags, pinned }) => {
                const semanticReason = semanticMatches.find((m) => m.id === _id)?.reason
                return (
                  <Card
                    key={_id}
                    id={_id}
                    type={type}
                    link={link}
                    note={note}
                    title={title}
                    tags={tags}
                    pinned={pinned}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onTogglePin={handleTogglePin}
                    onTagClick={handleToggleTag}
                    semanticReason={semanticReason}
                  />
                )
              })}
            </div>
          )}

          {!loading && !semanticLoading && !error && filteredContents.length === 0 && (
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
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <Button
                    varient="secondary"
                    size="md"
                    text="Clear Search"
                    onClick={() => {
                      setSearchQuery("")
                      setSemanticMatches([])
                    }}
                  />
                  {!isSemanticSearch && (
                    <button
                      type="button"
                      onClick={() => handleRunSemanticSearch()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <SparkleIcon size="sm" />
                      <span>Try AI Semantic Search</span>
                    </button>
                  )}
                </div>
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

      {/* Floating AI Assistant Trigger */}
      <AIFloatingButton
        onClick={() => setAiDrawerOpen((prev) => !prev)}
        isOpen={aiDrawerOpen}
      />
    </div>
  )
}

export default DashBoard

