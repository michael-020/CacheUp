

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { mockThreads } from "@/lib/mock-data"

interface CreateThreadFormProps {
  forumId: string
  onComplete: () => void
}

export function CreateThreadForm({ forumId, onComplete }: CreateThreadFormProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, you would send this data to your API
    setTimeout(() => {
      // Create a new thread with mock data
      const newThread = {
        id: `thread-${Date.now()}`,
        forumId,
        title,
        content,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        commentCount: 0,
      }

      // Add to mock data
      mockThreads.push(newThread)

      setIsSubmitting(false)
      onComplete()
      navigate(`/forums/${forumId}/${newThread.id}`)
    }, 500)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Thread</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thread title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thread content here..."
              rows={5}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Thread"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

