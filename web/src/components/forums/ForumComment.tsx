import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useForumStore } from "@/stores/ForumStore/forumStore";
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

interface Comment {
  _id: string;
  content: string;
  createdAt: Date;
  createdBy: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likedBy: string[];
  disLikedBy: string[];
  reportedBy: string[];
  weaviateId: string;
}

interface CommentSectionProps {
  postId: string;
  postWeaviateId: string;
  focusOnLoad?: boolean;
}

const ForumComment: React.FC<CommentSectionProps> = ({ postId, postWeaviateId, focusOnLoad = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{id: string, weaviateId: string} | null>(null);
  
  const { authUser } = useAuthStore();
  const { 
    fetchComments: storeFetchComments, 
    comments: storeComments,
    likeComment,
    dislikeComment,
    editComment,
    deleteComment
  } = useForumStore();
  const currentUserId = authUser?._id || null;
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  const [localLikedComments, setLocalLikedComments] = useState<Set<string>>(new Set());
  const [localDislikedComments, setLocalDislikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    if (focusOnLoad && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [focusOnLoad]);

  useEffect(() => {
    if (storeComments[postId]) {
      setComments(storeComments[postId]);
      
      const liked = new Set<string>();
      const disliked = new Set<string>();
      
      storeComments[postId].forEach(comment => {
        if (currentUserId && comment.likedBy && comment.likedBy.includes(currentUserId)) {
          liked.add(comment._id);
        }
        if (currentUserId && comment.disLikedBy && comment.disLikedBy.includes(currentUserId)) {
          disliked.add(comment._id);
        }
      });
      
      setLocalLikedComments(liked);
      setLocalDislikedComments(disliked);
      setLoading(false);
    }
  }, [storeComments, postId, currentUserId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await storeFetchComments(postId);
      const sortedComments = (fetchedComments || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await axiosInstance.post(`/forums/create-comment/${postId}/${postWeaviateId}`, {
        content: commentText
      });
      setCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (actionLoading[commentId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));
      
      setLocalLikedComments(prev => {
        const updated = new Set(prev);
        if (updated.has(commentId)) {
          updated.delete(commentId);
        } else {
          updated.add(commentId);
          // Remove from disliked if it was there
          setLocalDislikedComments(disliked => {
            const updatedDisliked = new Set(disliked);
            updatedDisliked.delete(commentId);
            return updatedDisliked;
          });
        }
        return updated;
      });
      
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === commentId) {
            const isCurrentlyLiked = comment.likedBy && comment.likedBy.includes(currentUserId || "");
            const newLikedBy = isCurrentlyLiked
              ? comment.likedBy.filter(id => id !== currentUserId)
              : [...(comment.likedBy || []), currentUserId || ""];
            
            const newDislikedBy = !isCurrentlyLiked && comment.disLikedBy
              ? comment.disLikedBy.filter(id => id !== currentUserId)
              : comment.disLikedBy || [];
              
            return {
              ...comment,
              likedBy: newLikedBy,
              disLikedBy: newDislikedBy
            };
          }
          return comment;
        })
      );
      
      await likeComment(commentId);
    } catch (error) {
      console.error("Error liking comment:", error);
      fetchComments();
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDislikeComment = async (commentId: string) => {
    if (actionLoading[commentId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));
      
      setLocalDislikedComments(prev => {
        const updated = new Set(prev);
        if (updated.has(commentId)) {
          updated.delete(commentId);
        } else {
          updated.add(commentId);
          setLocalLikedComments(liked => {
            const updatedLiked = new Set(liked);
            updatedLiked.delete(commentId);
            return updatedLiked;
          });
        }
        return updated;
      });
      
      setComments(prev => 
        prev.map(comment => {
          if (comment._id === commentId) {
            const isCurrentlyDisliked = comment.disLikedBy && comment.disLikedBy.includes(currentUserId || "");
            const newDislikedBy = isCurrentlyDisliked
              ? comment.disLikedBy.filter(id => id !== currentUserId)
              : [...(comment.disLikedBy || []), currentUserId || ""];
            
            const newLikedBy = !isCurrentlyDisliked && comment.likedBy
              ? comment.likedBy.filter(id => id !== currentUserId)
              : comment.likedBy || [];
              
            return {
              ...comment,
              disLikedBy: newDislikedBy,
              likedBy: newLikedBy
            };
          }
          return comment;
        })
      );
      
      await dislikeComment(commentId);
    } catch (error) {
      console.error("Error disliking comment:", error);
      fetchComments();
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleEditComment = async (commentId: string, weaviateId: string) => {
    if (!editText.trim()) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [commentId]: true }));
      
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, content: editText } 
            : comment
        )
      );
      
      await editComment(commentId, weaviateId, editText);
      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
      fetchComments(); // Revert changes on error
    } finally {
      setActionLoading(prev => ({ ...prev, [commentId]: false }));
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
      setActionLoading(prev => ({ ...prev, [id]: true }));
      
      setComments(prev => prev.filter(comment => comment._id !== id));
      
      await deleteComment(id, weaviateId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      fetchComments(); 
    } finally {
      if (commentToDelete) {
        setActionLoading(prev => ({ ...prev, [commentToDelete.id]: false }));
      }
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const cancelDeleteComment = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const isCommentLiked = (comment: Comment) => {
    return localLikedComments.has(comment._id);
  };

  const isCommentDisliked = (comment: Comment) => {
    return localDislikedComments.has(comment._id);
  };

  const isCommentOwner = (comment: Comment) => {
    return !!currentUserId && comment.createdBy?._id === currentUserId;
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0] || '')
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserColor = (username?: string) => {
    if (!username) return "bg-gray-400"; 

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="px-5 py-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      
      {/* Comment Form */}
      <form id={`comment-form-${postId}`} onSubmit={handleSubmitComment} className="mb-6">
        <Textarea
          ref={commentInputRef}
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-3 border rounded-lg mb-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <Button 
          type="submit"
          disabled={submitting || !commentText.trim()} 
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 && !loading ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border rounded-lg p-4 dark:bg-neutral-800 bg-white">
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
                  <span className="font-medium">
                    {comment.createdBy?.username || "Anonymous User"}
                  </span>
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
                    className="w-full p-2 border rounded mb-2"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditComment(comment._id, comment.weaviateId)}
                      disabled={actionLoading[comment._id]}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3"
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingComment(null)}
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
              
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={actionLoading[comment._id]}
                  className={`flex items-center gap-1 ${isCommentLiked(comment) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{comment.likedBy?.length || 0}</span>
                </button>
                
                <button
                  onClick={() => handleDislikeComment(comment._id)}
                  disabled={actionLoading[comment._id]}
                  className={`flex items-center gap-1 ${isCommentDisliked(comment) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  <span>{comment.disLikedBy?.length || 0}</span>
                </button>
                
                {isCommentOwner(comment) && (
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.content);
                      }}
                      disabled={actionLoading[comment._id]}
                      className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => showDeleteConfirmation(comment._id, comment.weaviateId)}
                      disabled={actionLoading[comment._id]}
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
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteComment}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ForumComment;