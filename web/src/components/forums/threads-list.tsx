

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { mockThreads, type ThreadData } from "@/lib/mock-data"
import { MessageSquare } from "lucide-react"

interface ThreadsListProps {
  forumId: string
}

export function ThreadsList({ forumId }: ThreadsListProps) {
  const [threads, setThreads] = useState<ThreadData[]>([])

  useEffect(() => {
    // In a real app, you would fetch threads from an API
    const forumThreads = mockThreads.filter((thread) => thread.forumId === forumId)
    setThreads(forumThreads)
  }, [forumId])

  if (threads.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-medium">No threads yet</h3>
        <p className="text-muted-foreground">Be the first to start a discussion!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <Link to={`/forums/${forumId}/${thread.id}`} key={thread.id}>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{thread.title}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="line-clamp-2 text-muted-foreground">{thread.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
              <div className="text-xs text-muted-foreground">
                Posted by {thread.createdBy} on {new Date(thread.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{thread.commentCount} comments</span>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

