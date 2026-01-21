import { useState } from "react"
import "../App.css"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Button } from "../components/button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { SideBar } from "../components/SideBar"
import { PlusIcon } from "../icons/PlusIcons"
import { ShareIcon } from "../icons/shareicon"
import { LoaderIcon } from "../icons/loaderIcon"
import { useContent } from "../hooks/useContent"
import { ShareBrainModal } from "../components/ShareBrainModel"

function DashBoard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [filterType, setFilterType] =
    useState<"twitter" | "youtube" | "link" | "note" | null>(null)

  const { contents, loading, error, refetch } = useContent()

  async function handleDelete(contentId: string) {
  try {
    await axios.delete(
      `${BACKEND_URL}/api/v1/content/${contentId}`,
      { withCredentials: true }
    )

    refetch() // refresh list
  } catch {
    alert("Failed to delete content")
  }
}


  return (
    <>
      <SideBar onSelect={setFilterType} />

      <div className="p-4 ml-72 min-h-screen bg-zinc-100">

        <CreateContentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={refetch}
        />

        <ShareBrainModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />

        <div className="flex justify-end gap-4">
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
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">

          {loading && (
            <div className="col-span-4 flex justify-center items-center">
              <LoaderIcon />
            </div>
          )}

          {error && (
            <div className="col-span-4 text-red-500 text-center">
              {error}
            </div>
          )}

          {!loading && !error &&
            contents
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
              />
            ))
          }

        </div>
      </div>
    </>
  )
}

export default DashBoard
