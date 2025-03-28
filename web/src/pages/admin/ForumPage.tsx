

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ThreadsList } from "@/components/forums/threads-list"
import { CreateThreadForm } from "@/components/forums/create-thread-form"
import { type ForumData, mockForums } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export  function ForumPage() {
  const { forumId } = useParams()
  const navigate = useNavigate()
  const [forum, setForum] = useState<ForumData | null>(null)
  const [isCreatingThread, setIsCreatingThread] = useState(false)

  useEffect(() => {
    // Find the forum from mock data
    const foundForum = mockForums.find((f) => f.id === forumId)
    if (foundForum) {
      setForum(foundForum)
    }
  }, [forumId])

  if (!forum) {
    return <div className="container mx-auto py-16 px-4">Loading forum...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/forums">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forums
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{forum.title}</h1>
        <p className="text-muted-foreground mt-2">{forum.description}</p>
        <div className="text-sm text-muted-foreground mt-2">
          Created by {forum.createdBy} on {new Date(forum.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-between items-center mb">
        <h2 className="text-xl font-semibold">Threads</h2>
        <Button onClick={() => setIsCreatingThread(!isCreatingThread)}>
          {isCreatingThread ? "Cancel" : "Create Thread"}
        </Button>
      </div>

      {isCreatingThread && (
        <div className="mb-8">
          <CreateThreadForm forumId={forum.id} onComplete={() => setIsCreatingThread(false)} />
        </div>
      )}

      <ThreadsList forumId={forum.id} />
    </div>
  )
}

