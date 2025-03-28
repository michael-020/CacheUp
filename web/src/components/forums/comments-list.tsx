import type { CommentData } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface CommentsListProps {
  comments: CommentData[]
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-lg mb-8">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-8">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* <Avatar>
                <AvatarFallback>{comment.createdBy.charAt(0)}</AvatarFallback>
              </Avatar> */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{comment.createdBy}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

