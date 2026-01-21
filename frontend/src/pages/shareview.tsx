import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Card } from "../components/Card"
import { LoaderIcon } from "../icons/loaderIcon"

export default function ShareView() {
  const { shareLink } = useParams()
  const [contents, setContents] = useState<any[]>([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSharedBrain() {
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/v1/brain/${shareLink}`
        )

        setUsername(res.data.username)
        setContents(res.data.contents)
      } catch (err) {
        setError("Invalid or expired share link")
      } finally {
        setLoading(false)
      }
    }

    fetchSharedBrain()
  }, [shareLink])

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderIcon />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          {username}'s Second Brain
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map(({_id, title, link, type, note }) => (
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
      </div>
    </div>
  )
}
