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

interface PostCardProps {
  post: Post;
  isAdmin?: boolean;
}

export default function PostCard({ post, isAdmin }: PostCardProps) {
  const { toggleLike, toggleSave, addComment, isUplaodingComment, updateComment, deleteComment, getLikedUsers } = usePostStore();
  const { authUser } = useAuthStore()
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const { reportPost, unReportPost } = usePostStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      await new Promise(resolve => setTimeout(resolve, 300));
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
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await getComments(postId);
    setShowCommentInput(true);
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
    await deleteComment(postId, commentId)
    setComments((prevComments) => 
      prevComments.filter((comment) => comment._id !== commentId) 
    );
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

  const deletePostHandler = async () => {
    if (isAdmin) {
      await useAdminStore.getState().deletePost({ postId: post._id });
    } else {
      await usePostStore.getState().deletePost({ postId: post._id });
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
      navigate(`/admin/profile/${post.postedBy}`);
    } else {
      navigate(`/profile/${post.postedBy}`);
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

  return (
    <div
      className="max-w-[700px] mx-auto rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-900 dark:shadow-0 dark:shadow-sm p-4 shadow-lg mb-4 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className="size-12 rounded-full border-2 border-white dark:border-gray-500 shadow-sm overflow-hidden mr-3 cursor-pointer"
            onClick={() => {
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

        {/* Report Button  */}
        <div className="relative z-10" ref={reportRef}>
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setShowReport(!showReport);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 -z-10 dark:hover:bg-gray-700 "
          >
            <Threedot />
          </button>

          {showReport && (
          <div className="bg-white border border-gray-200 dark:bg-neutral-600 dark:border-0 rounded-lg shadow-xl z-[5] overflow-hidden w-48 absolute">
            {(post.postedBy === authUser?._id || isAdmin) && (
              <button
                onClick={() => setIsModalOpen(!isModalOpen)}
                className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <span>Delete Post</span>
                <Trash className="size-4" />
              </button>
            )}
            
            {post.postedBy !== authUser?._id && !isAdmin && (
              <button
                onClick={async (e: React.MouseEvent) => {
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
            className="w-full h-auto aspect-auto object-cover hover:scale-105 transition-all duration-1000 ease-in-out"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center dark:text-neutral-400 dark:border-gray-600 text-sm border-t border-gray-100 pt-3">
      <button
            className={`flex items-center mr-6 transition-colors ${post.isLiked ? "text-red-500" : ""}`}
            onClick={() => toggleLike(post._id)}
          >
            <HeartIcon filled={post.isLiked} />
            <span 
              className={`ml-2 font-medium cursor-pointer hover:underline ${post.isLiked ? "text-red-500" : ""}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                fetchLikedUsers(post._id);
              }}
            >
              {post.likes.length}
            </span>
        </button>


        <button
          className="flex items-center mr-6 hover:text-blue-500 transition-colors"
          onClick={() => handleCommentToggle(post._id)}
        >
          <MessageSquareText />
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

      {/* Likes Modal */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showLikes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {showLikes && (
          <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800">Liked by</h3>
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
        className={`transition-all duration-300 ease-in-out overflow-hidden  ${
          showCommentInput ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
      {showCommentInput && (
        <div className="mt-4 space-y-4 " data-comment-section>
          <div className="bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 p-4 rounded-lg border border-gray-200">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full border dark:bg-neutral-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
              rows={2}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 dark:bg-neutral-700">
              {comments.filter(comment => comment?._id).map((comment) => (
                <div
                  key={comment._id}
                  className="bg-white p-3 rounded-md border border-gray-100 group relative dark:bg-neutral-800"
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
                            onClick={() => deleteCommentHandler(post._id, comment._id)}
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