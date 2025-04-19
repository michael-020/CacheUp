import { useState, useEffect, useRef } from "react";
import HeartIcon from "@/icons/HeartIcon";
import SaveIcon from "../icons/SaveIcon";
import { usePostStore } from "../stores/PostStore/usePostStore";
import Threedot from "../icons/Threedot";
import { Comment, Post, LikedUser } from "../lib/utils";
import { axiosInstance } from "@/lib/axios";
import { Loader, MessageSquareText, Pencil, SendHorizonal, Trash, X } from "lucide-react";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import { DeleteModal } from "./DeleteModal";
import { Textarea } from "./ui/textarea";

interface PostCardProps {
  post: Post;
  isAdmin?: boolean;
  onPostUpdate?: (updatedPost: Post) => void; // Add new prop for callback
}

export default function PostCard({ post, isAdmin, onPostUpdate }: PostCardProps) {
  const { toggleLike, toggleSave, addComment, isUplaodingComment, updateComment, deleteComment, getLikedUsers, reportPost, unReportPost } = usePostStore();
  const { authUser } = useAuthStore()
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Local state for tracking post properties
  const [localPost, setLocalPost] = useState<Post>(post);
  
  // Update local post when prop changes
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const getComments = async (postId: string) => {
    if(isAdmin){
      const res = await axiosInstance.get(`/admin/comment/${postId}`)
      setComments(res.data);
    }
    else {
      const res = await axiosInstance.get(`/post/comment/${postId}`)
      setComments(res.data)
    }
  }

  const fetchLikedUsers = async (postId: string) => {
    if (showLikes) {
      setShowLikes(false);
      return;
    }
    
    if (showCommentInput) {
      setShowCommentInput(false);
    }

    setIsLoadingLikes(true);
    try {
      setLikedUsers([]); 
      const users = await getLikedUsers(postId);
      
      if (users && users.length > 0) {
        setLikedUsers(users);
        setShowLikes(true);
      } else {
        setShowLikes(true); 
      }
    } catch (error) {
      console.error("Failed to fetch liked users:", error);
      setShowLikes(true); 
    } finally {
      setIsLoadingLikes(false);
    }
  };

  const handleCommentToggle = async (postId: string) => {
    if (showCommentInput) {
      setShowCommentInput(false);
      return;
    }
    
    if (showLikes) {
      setShowLikes(false);
    }
    
    await getComments(postId);
    setShowCommentInput(true);
  };

  const handleSaveToggle = async (postId: string) => {
    await toggleSave(postId);
    
    // Update local state with new saved status - create a new object to avoid mutation
    const updatedPost = { ...localPost, isSaved: !localPost.isSaved };
    setLocalPost(updatedPost);
    
    // Notify parent component if callback exists
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };
  
  const handleLikeToggle = async (postId: string) => {
    await toggleLike(postId);
    
    // Update local state with new liked status and count
    const newLikedStatus = !localPost.isLiked;
    
    // Create a new object to avoid mutation
    const updatedPost = {
      ...localPost,
      isLiked: newLikedStatus,
      likes: newLikedStatus 
        ? [...localPost.likes, authUser?._id || "temp-id"] 
        : localPost.likes.filter(id => id !== authUser?._id)
    };
    
    setLocalPost(updatedPost);
    
    // Notify parent component if callback exists
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
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
    
    setComments((prevComments) => 
      prevComments.filter((comment) => comment._id !== commentId) 
    );
    
    // Update local post comment count - maintain Post type integrity
    const updatedPost = {
      ...localPost,
      comments: localPost.comments.filter(comment => comment._id !== commentId)
    };
    
    setLocalPost(updatedPost);
    
    // Notify parent component if callback exists
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
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
          comment._id === commentId 
            ? { ...comment, content: editCommentText } 
            : comment
        )
      );
      
      // Reset edit state
      setEditingCommentId(null);
      setEditCommentText("");
    }
  }

  const handleReportToggle = async (postId: string) => {
    try {
      if (localPost.isReported) {
        await unReportPost(postId);
      } else {
        await reportPost(postId);
      }
      
      // Update local state with new report status
      const updatedPost = {
        ...localPost,
        isReported: !localPost.isReported,
        reportCount: localPost.isReported 
          ? (localPost.reportCount || 1) - 1 
          : (localPost.reportCount || 0) + 1
      };
      
      setLocalPost(updatedPost);
      
      // Notify parent component if callback exists
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
    } catch (error) {
      console.error("Report action failed:", error);
    }
    setShowReport(false);
  };

  const deletePostHandler = async () => {
    if (isAdmin) {
      await useAdminStore.getState().deletePost({ postId: localPost._id });
    } else {
      await usePostStore.getState().deletePost({ postId: localPost._id });
    }
    
    setShowReport(false);
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setShowReport(false);
      }
    };
  
    if (showReport) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showReport]);

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate(`/admin/profile/${localPost.postedBy}`);
    } else {
      navigate(`/profile/${localPost.postedBy}`);
    }
  };

  const handleLikedUserProfileClick = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdmin) {
      navigate(`/admin/profile/${userId}`);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const isOwnPost = authUser?._id === localPost.postedBy;

  return (
    <div
      className="xl:max-w-[700px] md:max-w-[550px] mx-auto rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-900 dark:shadow-0 dark:shadow-sm p-4 shadow-lg mb-4 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="size-12 rounded-full border-2 border-white dark:border-gray-500 shadow-sm overflow-hidden mr-3 cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={localPost.userImagePath ? localPost.userImagePath : "/avatar.jpeg"}
              alt="Profile"
              className="w-full h-full object-cover bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <span
              className="font-semibold text-gray-800 dark:text-gray-300 text-base cursor-pointer hover:underline"
              onClick={handleProfileClick}
            >
              {localPost.username}
            </span>
          </div>
        </div>

        {/* Report Button  */}
        <div className="relative z-10" ref={reportRef}>
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setShowReport(!showReport);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 -z-10 dark:hover:bg-gray-700"
          >
            <Threedot />
          </button>

          {showReport && (
          <div className="bg-white border border-gray-200 dark:bg-neutral-600 dark:border-0 rounded-lg shadow-xl z-[5] overflow-hidden w-48 absolute">
            {(localPost.postedBy === authUser?._id || isAdmin) && (
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <span>Delete Post</span>
                <Trash className="size-4" />
              </button>
            )}
            
            {localPost.postedBy !== authUser?._id && !isAdmin && (
              <button
                onClick={() => handleReportToggle(localPost._id)}
                className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between
                  ${localPost.isReported ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
                  transition-colors duration-150`}
              >
                <span>{localPost.isReported ? "Unreport Post" : "Report Post"}</span>
                <span className="text-xs font-medium text-gray-400">
                  {localPost.reportCount || 0}
                </span>
              </button>
            )}
          </div>
        )}
              </div>
            </div>

      {/* Text Content */}
      {localPost.text && (
        <div className="mb-4 ml-1 text-gray-800 dark:text-gray-300 text-[15px] leading-relaxed">
          {localPost.text}
        </div>
      )}

      {/* Post Image */}
      {localPost.postsImagePath && (
        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-gray-700">
          <img
            src={localPost.postsImagePath}
            alt="Post content"
            className="w-full h-auto aspect-auto object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center dark:text-neutral-400 dark:border-gray-600 text-sm border-t border-gray-100 pt-3">
        <button
          className={`flex items-center mr-6 transition-colors ${localPost.isLiked ? "text-red-500" : ""}`}
          onClick={() => handleLikeToggle(localPost._id)}
        >
          <HeartIcon filled={localPost.isLiked} />
          <span 
            className={`ml-2 font-medium cursor-pointer hover:underline ${localPost.isLiked ? "text-red-500" : ""}`}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              fetchLikedUsers(localPost._id);
            }}
          >
            {localPost.likes.length}
          </span>
        </button>

        <button
          className="flex items-center mr-6 hover:text-blue-500 transition-colors"
          onClick={() => handleCommentToggle(localPost._id)}
        >
          <MessageSquareText />
          <span className="ml-2 font-medium">{localPost.comments.length}</span>
        </button>

        {/* Show save button only if the post is not by the current user */}
        {!isOwnPost && (
          <button
            className={`ml-auto transition-colors ${localPost.isSaved ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}`}
            onClick={() => handleSaveToggle(localPost._id)}
          >
            <SaveIcon
              filled={localPost.isSaved}
              className={localPost.isSaved ? "text-blue-500" : "text-gray-500 hover:text-blue-500"}
            />
          </button>
        )}
      </div>

      {/* Likes Modal */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showLikes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {showLikes && (
          <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative dark:bg-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800 dark:text-gray-50">Liked by</h3>
              <button
                onClick={() => setShowLikes(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>
            
            {isLoadingLikes ? (
              <div className="flex justify-center py-4">
                <Loader className="animate-spin size-6 text-blue-500" />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {likedUsers.length > 0 ? (
                  likedUsers.map(user => (
                    <div 
                      key={user._id} 
                      className="flex items-center py-2 hover:bg-gray-100 px-2 rounded-md transition-colors cursor-pointer"
                      onClick={(e: React.MouseEvent) => handleLikedUserProfileClick(user._id, e)}
                    >
                      <img 
                        src={user.profileImagePath || "/avatar.jpeg"} 
                        alt={user.username}
                        className="size-8 rounded-full mr-3 object-contain"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          (e.target as HTMLImageElement).src = "/avatar.jpeg";
                        }}
                      />
                      <span className="text-gray-700 font-medium">{user.username}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No likes yet</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Section */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden border border-gray-200 dark:border-neutral-700 rounded-lg mt-4 pb-2 ${
          showCommentInput ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
      {showCommentInput && (
        <div className="mt-4 space-y-4 " data-comment-section>
          <div className={`dark:border-neutral-700 p-4 ${comments.length === 0 ? "border-0" : "border-b"}`}>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full resize-none border bg-gray-50 placeholder:text-neutral-300 dark:placeholder:text-neutral-400 dark:bg-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={(e: React.MouseEvent) => {
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
            <div className=" px-4 rounded-lg  border-gray-200 dark:border-0 space-y-3 ">
              {comments.filter(comment => comment?._id).map((comment) => (
                <div
                  key={comment._id}
                  className={`${comment._id === comments[comments.length-1]._id ? "border-0" : "border-b"} p-3 border-gray-100 dark:border-neutral-700 group relative`}
                >
                {editingCommentId === comment._id ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <img
                          src={
                            comment.user.profileImagePath || "/avatar.jpeg"
                          }
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
                        onClick={() => submitEditedComment(localPost._id, comment._id)}
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
                          src={
                            comment.user.profileImagePath || "/avatar.jpeg"
                          }
                          className="w-5 h-5 rounded-full mr-2 cursor-pointer"
                          alt={comment.user.username}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(`/profile/${comment.user._id}`);
                          }}
                        />
                        <span className="font-semibold text-gray-700 cursor-pointer"
                         onClick={(e: React.MouseEvent) => {
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
                      {(authUser?._id === comment.user._id || isAdmin) && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => deleteCommentHandler(localPost._id, comment._id)}
                          >
                            <Trash className="text-red-600 size-4" />
                          </button>
                          <button
                            onClick={() => editCommentHandler(comment._id, comment.content)}
                          >
                            <Pencil className={`text-blue-400 size-4 ${isAdmin ? "hidden" : "block" }`} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      {comment.content}
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
      {isModalOpen && <DeleteModal deleteHandler={deletePostHandler} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </div>
  );
}