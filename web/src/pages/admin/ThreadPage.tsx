
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { type ThreadData, type CommentData, mockThreads, mockComments } from "@/lib/mock-data"
import { CreateCommentForm } from "@/components/forums/create-comment-form"
import { CommentsList } from "@/components/forums/comments-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ThreadPage() {
  const { forumId, threadId } = useParams()
  const [thread, setThread] = useState<ThreadData | null>(null)
  const [comments, setComments] = useState<CommentData[]>([])

  useEffect(() => {
    // Find the thread from mock data
    const foundThread = mockThreads.find((t) => t.id === threadId && t.forumId === forumId)
    if (foundThread) {
      setThread(foundThread)
      // Get comments for this thread
      const threadComments = mockComments.filter((c) => c.threadId === threadId)
      setComments(threadComments)
    }
  }, [threadId, forumId])

  // Function to refresh comments after adding a new one
  const refreshComments = () => {
    const updatedComments = mockComments.filter((c) => c.threadId === threadId)
    setComments(updatedComments)
  }

  if (!thread) {
    return <div className="container mx-auto py-8 px-4">Loading thread...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to={`/forums/${forumId}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forum
        </Button>
      </Link>

      <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          Posted by {thread.createdBy} on {new Date(thread.createdAt).toLocaleDateString()}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p>{thread.content}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <CommentsList comments={comments} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
        <CreateCommentForm threadId={thread?.id || ""} forumId={forumId || ""} onCommentAdded={refreshComments} />
      </div>
    </div>
  )
}

