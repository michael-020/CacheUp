import { useState, useRef, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useForumStore} from "@/stores/ForumStore/forumStore";
import { Comment } from "@/stores/ForumStore/types";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import { Loader } from "lucide-react";
import { LoginPromptModal } from "@/components/modals/LoginPromptModal";

interface CommentSectionProps {
  postId: string;
  postWeaviateId: string;
  focusOnLoad?: boolean;
}

const ForumComment: React.FC<CommentSectionProps> = memo(({ postId, postWeaviateId, focusOnLoad = false }) => {
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{id: string, weaviateId: string} | null>(null);
  const [editLoading, setEditLoading] = useState<{[key: string]: boolean}>({});
  const { authAdmin } = useAdminStore()
  const isAdmin = Boolean(authAdmin)
  const { authUser } = useAuthStore();
  const { 
    fetchComments,
    comments,
    commentsLoading,
    likeComment,
    dislikeComment,
    editComment,
    deleteComment,
    createComment
  } = useForumStore();
  
  const currentUserId = authUser?._id || null;
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchComments(postId, isAdmin);
  }, [postId, fetchComments]);

  useEffect(() => {
    if (focusOnLoad && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [focusOnLoad]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await createComment(postId, postWeaviateId, commentText);
      setCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!authUser || actionLoading[commentId]) return;
  
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));
      await likeComment(commentId, authUser._id);
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };
  
  
  const handleDislikeComment = async (commentId: string) => {
    if (!authUser || actionLoading[commentId]) return;
  
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));
      await dislikeComment(commentId, authUser._id);
    } catch (error) {
      console.error("Error disliking comment:", error);
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };
  

  const handleEditComment = async (commentId: string, weaviateId: string) => {
    if (!editText.trim()) return;
    
    try {
      setEditLoading(prev => ({ ...prev, [commentId]: true }));
      await editComment(commentId, weaviateId, editText);
      setEditingComment(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    } finally {
      setEditLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const showDeleteConfirmation = (commentId: string, weaviateId: string) => {
    setCommentToDelete({ id: commentId, weaviateId });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      const { id, weaviateId } = commentToDelete;
      setActionLoading(prev => ({ ...prev, [id]: true}));
      await deleteComment(id, weaviateId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const isCommentLiked = (comment: Comment) => 
    currentUserId ? comment.likedBy.includes(currentUserId) : false;

  const isCommentDisliked = (comment: Comment) => 
    currentUserId ? comment.disLikedBy.includes(currentUserId) : false;

  const isCommentOwner = (comment: Comment) => 
    !!currentUserId && comment.createdBy?._id === currentUserId;

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ")
      .map(part => part[0] || '')
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserColor = (username?: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const hash = username?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: Date) => 
    new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const sortedComments = [...(comments[postId] || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="px-5 py-4 dark:bg-neutral-800 rounded-b-2xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        Comments {sortedComments.length > 0 && `(${sortedComments.length})`}
      </h3>

      <form onSubmit={handleSubmitComment} className="mb-6">
        <Textarea
          ref={commentInputRef}
          placeholder={authUser ? "Add a comment..." : "Sign in to comment"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none mb-2"
          rows={3}
        />
        <Button 
          type="submit"
          disabled={submitting || (!authUser && !commentText.trim())}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors translate-y-1"
        >
          {submitting ? <div className="px-10">
              <Loader className="animate-spin size-8" />
          </div> : "Post Comment"}
        </Button>
      </form>

      {commentsLoading[postId] && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="space-y-4">
        {sortedComments.length === 0 && !commentsLoading[postId] ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          sortedComments.map((comment) => (
            comment?.createdBy && (
            <div key={comment._id} className="border rounded-lg p-4 dark:bg-neutral-800 bg-white">
              {/* Comment header and content */}
              <div className="flex items-center gap-3 mb-3">
                {comment.createdBy?.profilePicture ? (
                  <Link to={`/profile/${comment.createdBy?._id}`}>
                    <img 
                      src={comment.createdBy.profilePicture} 
                      alt={`${comment.createdBy.username}'s profile`} 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  </Link>
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getUserColor(comment.createdBy?.username)}`}>
                    {getInitials(comment.createdBy?.username)}
                  </div>
                )}
                <div>
                <Link to={`/profile/${comment.createdBy?._id}`}>
                  <h2 className="font-medium hover:underline">
                    {comment.createdBy?.username}
                  </h2>
                </Link>
                <div className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </div>
                </div>
              </div>

              {editingComment === comment._id ? (
                <div className="mb-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 resize-none border rounded mb-2 dark:bg-neutral-700"
                    rows={2}
                    autoFocus
                    disabled={editLoading[comment._id]}
                  />
                  <div className="flex gap-2 translate-y-1">
                    <Button
                      onClick={() => handleEditComment(comment._id, comment.weaviateId)}
                      disabled={editLoading[comment._id]}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3"
                      size="sm"
                    >
                      {editLoading[comment._id] ? (
                        <div className="flex items-center gap-2">
                          <Loader size={12} />
                        </div>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText("");
                      }}
                      disabled={editLoading[comment._id]}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mb-3 whitespace-pre-wrap">{comment.content}</p>
              )}

              {/* Comment actions */}
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={actionLoading[comment._id]}
                  className={`flex items-center gap-1 ${isCommentLiked(comment) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{comment.likedBy.length}</span>
                </button>

                <button
                  onClick={() => handleDislikeComment(comment._id)}
                  disabled={actionLoading[comment._id]}
                  className={`flex items-center gap-1 ${isCommentDisliked(comment) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>{comment.disLikedBy.length}</span>
                </button>

                {isCommentOwner(comment) && (
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.content);
                      }}
                      className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => showDeleteConfirmation(comment._id, comment.weaviateId)}
                      className="text-gray-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Sign In Required"
        content="Please sign in to comment on forums."
      />
    </div>
  );
});

export default ForumComment;