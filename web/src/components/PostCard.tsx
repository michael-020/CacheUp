import { useState, useEffect } from "react";
import LikeIcon from "@/icons/LikeIcon";
import MessageIcon from "../icons/MessageIcon";
import SaveIcon from "../icons/SaveIcon";
import { usePostStore } from "../stores/PostStore/usePostStore";
import Threedot from "../icons/Threedot";
import { Comment, Post } from "../lib/utils";
import { axiosInstance } from "@/lib/axios";
import { Loader, Pencil, SendHorizonal, Trash } from "lucide-react";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface PostCardProps {
  post: Post;
  isAdmin?: boolean;
  onPostDelete?: (postId: string) => void;
}

export default function PostCard({ post, isAdmin, onPostDelete }: PostCardProps) {
  const { toggleLike, toggleSave, addComment, isUplaodingComment, updateComment, deleteComment } = usePostStore();
  const { authUser } = useAuthStore();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { reportPost, unReportPost } = usePostStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const navigate = useNavigate();

  const getComments = async (postId: string) => {
    if (isAdmin) {
      const res = await axiosInstance.get(`/admin/comment/${postId}`);
      setComments(res.data);
    } else {
      const res = await axiosInstance.get(`/post/comment/${postId}`);
      setComments(res.data);
    }
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      const result = await addComment(post._id, commentText);
      const newComment = result as unknown as Comment | null;

      if (newComment) {
        setComments((prevComments) => [newComment, ...prevComments]);
        setCommentText("");
      } else {
        console.error("Failed to add comment.");
        await getComments(post._id);
      }
    }
  };

  async function deleteCommentHandler(postId: string, commentId: string) {
    await deleteComment(postId, commentId);
    setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
  }

  async function editCommentHandler(commentId: string, content: string) {
    if (editingCommentId === commentId) {
      setEditingCommentId(null);
      setEditCommentText("");
    } else {
      setEditingCommentId(commentId);
      setEditCommentText(content);
    }
  }

  async function submitEditedComment(postId: string, commentId: string) {
    if (editCommentText.trim()) {
      await updateComment(postId, commentId, editCommentText);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, content: editCommentText } : comment
        )
      );

      setEditingCommentId(null);
      setEditCommentText("");
    }
  }

  const handleDeletePost = async () => {
    try {
      if (isAdmin) {
        await useAdminStore.getState().deletePost({ postId: post._id });
      } else {
        await usePostStore.getState().deletePost({ postId: post._id });
      }
      if (onPostDelete) {
        onPostDelete(post._id);
      }
    } catch (error) {
      console.error("Delete post failed:", error);
    }
    setShowDeleteConfirmation(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest(".relative")) {
        setShowReport(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [comments]);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (isAdmin) {
      navigate(`/admin/profile/${post.postedBy}`);
    } else {
      navigate(`/profile/${post.postedBy}`);
    }
  };

  return (
    <div
      className="max-w-[700px] mx-auto rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-900 dark:shadow-0 dark:shadow-sm p-4 shadow-lg mb-4 border border-gray-200"

      
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="size-12 rounded-full border-2 border-white dark:border-gray-500 shadow-sm overflow-hidden mr-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.postedBy}`);
            }}
          >
            <img
              src={post.userImagePath ? post.userImagePath : "/avatar.jpeg"}
              alt="Profile"
              className="w-full h-full object-cover bg-gray-100"
              onClick={handleProfileClick}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="font-semibold text-gray-800 dark:text-gray-300 text-base cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {post.username}
            </span>
          </div>
        </div>

        {/* Report Button */}
        <div className="relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReport(!showReport);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 -z-10 dark:hover:bg-gray-700"
          >
            <Threedot />
          </button>

          {showReport && (
            <div className="bg-white border border-gray-200 dark:bg-neutral-600 dark:border-0 rounded-lg shadow-xl z-[5] overflow-hidden w-48 absolute">
              {(post.postedBy === authUser?._id || isAdmin) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirmation(true);
                    setShowReport(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <span>Delete Post</span>
                  <Trash className="size-4" />
                </button>
              )}

              {post.postedBy !== authUser?._id && !isAdmin && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      if (post.isReported) {
                        await unReportPost(post._id);
                      } else {
                        await reportPost(post._id);
                      }
                    } catch (error) {
                      console.error("Report action failed:", error);
                    }
                    setShowReport(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                    ${post.isReported ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
                    transition-colors duration-150`}
                >
                  <span>{post.isReported ? "Unreport Post" : "Report Post"}</span>
                  <span className="text-xs font-medium text-gray-400">
                    {post.reportCount || 0}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Text Content */}
      {post.text && (
        <div className="mb-4 text-gray-800 dark:text-gray-300 text-[15px] leading-relaxed">
          {post.text}
        </div>
      )}

      {/* Post Image */}
      {post.postsImagePath && (
        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-gray-700">
          <img
            src={post.postsImagePath}
            alt="Post content"
            className="w-full h-auto aspect-video object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center text-gray-500 dark:text-neutral-400 dark:border-gray-600 text-sm border-t border-gray-100 pt-3">
        <button
          className="flex items-center mr-6 hover:text-red-600 transition-colors"
          onClick={() => toggleLike(post._id)}
        >
          <LikeIcon />
          <span className="ml-2 font-medium">{post.likes.length}</span>
        </button>

        <button
          className="flex items-center mr-6 hover:text-blue-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowCommentInput(!showCommentInput);
            getComments(post._id);
          }}
        >
          <MessageIcon />
          <span className="ml-2 font-medium">{post.comments.length}</span>
        </button>

        <button
          className="ml-auto hover:text-blue-500 transition-colors"
          onClick={() => toggleSave(post._id)}
        >
          <SaveIcon
            filled={post.isSaved}
            className={post.isSaved ? "text-blue-500" : "text-gray-500"}
          />
        </button>
      </div>

      {/* Comment Section */}
      {showCommentInput && (
        <div className="mt-4 space-y-4" data-comment-section>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommentSubmit();
                }}
                className={`px-4 py-2 ${
                  isUplaodingComment ? "bg-blue-300" : "bg-blue-500"
                } text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors`}
                disabled={isUplaodingComment}
              >
                {isUplaodingComment ? (
                  <div className="px-10">
                    <Loader className="animate-spin size-5" />
                  </div>
                ) : (
                  "Post Comment"
                )}
              </button>
            </div>
          </div>

          {comments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              {comments
                .filter((comment) => comment?._id)
                .map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-white p-3 rounded-md border border-gray-100 group relative"
                  >
                    {editingCommentId === comment._id ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <img
                              src={comment.user.profileImagePath || "/avatar.jpeg"}
                              className="w-5 h-5 rounded-full mr-2"
                              alt={comment.user.username}
                            />
                            <span className="font-semibold text-gray-700">
                              {comment.user.username}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-xs">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="w-full pt-1 flex gap-2">
                          <input
                            type="text"
                            className="px-2 py-1 placeholder:text-sm border rounded-lg w-full"
                            placeholder="Edit your comment..."
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                          />
                          <button
                            className="bg-blue-500 p-2 rounded-md"
                            onClick={() => submitEditedComment(post._id, comment._id)}
                          >
                            <SendHorizonal className="size-5 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <img
                              src={comment.user.profileImagePath || "/avatar.jpeg"}
                              className="w-5 h-5 rounded-full mr-2 cursor-pointer"
                              alt={comment.user.username}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${comment.user._id}`);
                              }}
                            />
                            <span
                              className="font-semibold text-gray-700 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${comment.user._id}`);
                              }}
                            >
                              {comment.user.username}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-xs">
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                          {((authUser?._id === comment.user._id || isAdmin)) && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => deleteCommentHandler(post._id, comment._id)}
                              >
                                <Trash className="text-red-600 size-4" />
                              </button>
                              <button
                                onClick={() => editCommentHandler(comment._id, comment.content)}
                              >
                                <Pencil className={`text-blue-400 size-4 ${isAdmin ? "hidden" : "block"}`} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div>{comment.content}</div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeletePost}
        isDeleting={useAdminStore.getState().isDeletingPost}
      />
    </div>
  );
}