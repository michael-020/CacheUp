

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockComments } from "@/lib/mock-data"

interface CreateCommentFormProps {
  threadId: string
  forumId: string
  onCommentAdded: () => void
}

export function CreateCommentForm({ threadId, forumId, onCommentAdded }: CreateCommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, you would send this data to your API
    setTimeout(() => {
      // Create a new comment with mock data
      const newComment = {
        id: `comment-${Date.now()}`,
        threadId,
        content,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
      }

      // Add to mock data
      mockComments.push(newComment)

      setIsSubmitting(false)
      setContent("")
      onCommentAdded()
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
        rows={4}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  )
}

