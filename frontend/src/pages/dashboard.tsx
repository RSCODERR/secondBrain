import { useState } from "react"
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

function DashBoard() {
  const { logout } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>(null)
  const [editContent, setEditContent] = useState<ContentItem | null>(null)

  const { contents, loading, error, refetch } = useContent()

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
    <div className="min-h-screen bg-slate-50/70">
      <SideBar
        onSelect={setFilterType}
        selectedType={filterType}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="ml-0 lg:ml-72 min-h-screen p-4 sm:p-6 lg:p-8 transition-all duration-300">
        {/* Mobile & Tablet Header Bar */}
        <header className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer shadow-xs transition"
              aria-label="Open Navigation Menu"
            >
              <MenuIcon size="md" />
            </button>
            <div
              className="flex items-center gap-2 text-xl font-bold text-gray-900 cursor-pointer select-none"
              onClick={() => setFilterType(null)}
            >
              <span className="text-purple-600"><BrainIcon /></span>
              <span>Second Brain</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 text-red-600 cursor-pointer shadow-xs transition"
            aria-label="Logout"
            title="Logout"
          >
            <LogoutIcon size="md" />
          </button>
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

        {/* Action Controls & Active Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {filterType ? (
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-purple-200">
                <span>Showing: <strong className="capitalize">{filterType}</strong></span>
                <button
                  onClick={() => setFilterType(null)}
                  className="cursor-pointer hover:text-purple-950 font-bold ml-1 text-sm"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                All Notes
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Button
              varient="secondary"
              size="md"
              startIcon={<ShareIcon size="md" />}
              text="Share Brain"
              onClick={() => setShareOpen(true)}
            />

            <Button
              varient="primary"
              size="md"
              startIcon={<PlusIcon size="lg" />}
              text="Add Content"
              onClick={() => setModalOpen(true)}
            />

            <Button
              varient="danger"
              size="md"
              startIcon={<LogoutIcon size="md" />}
              text="Logout"
              onClick={logout}
            />
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="mt-6">
          {loading && (
            <div className="w-full py-20 flex justify-center items-center">
              <LoaderIcon />
            </div>
          )}

          {error && (
            <div className="w-full text-red-500 text-center py-10 font-medium">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {contents
                .filter(content => !filterType || content.type === filterType)
                .map(({ _id, type, link, title, note }) => (
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

          {!loading && !error && contents.filter(c => !filterType || c.type === filterType).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/70 border border-gray-200/80 rounded-3xl mt-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-600 flex items-center justify-center mb-4 shadow-xs border border-purple-200/50">
                <BrainIcon />
              </div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {filterType ? `No ${filterType} items saved yet` : "Your Second Brain is ready"}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1 mb-5">
                {filterType
                  ? `You haven't saved any ${filterType} items yet. Click below to add your first one!`
                  : "Collect YouTube videos, Twitter posts, web links, and notes all in one beautiful place."}
              </p>
              <Button
                varient="primary"
                size="md"
                startIcon={<PlusIcon size="lg" />}
                text="Add Your First Content"
                onClick={() => setModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashBoard
