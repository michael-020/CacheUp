

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { mockForums, type ForumData } from "@/lib/mock-data"
import { MessageSquare, Users } from "lucide-react"

export function ForumsList() {
  const [forums, setForums] = useState<ForumData[]>([])

  useEffect(() => {
    // In a real app, you would fetch forums from an API
    setForums(mockForums)
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {forums.map((forum) => (
        <Link to={`/forums/${forum.id}`} key={forum.id}>
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{forum.title}</CardTitle>
              <CardDescription>{forum.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{forum.memberCount} members</span>
                <MessageSquare className="h-4 w-4 ml-4 mr-1" />
                <span>{forum.threadCount} threads</span>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Created by {forum.createdBy} on {new Date(forum.createdAt).toLocaleDateString()}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

