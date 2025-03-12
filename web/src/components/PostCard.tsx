import { useState, useEffect } from "react";
import HeartIcon from "../icons/HeartIcon";
import MessageIcon from "../icons/MessageIcon";
import SaveIcon from "../icons/SaveIcon";
import { usePostStore } from "../stores/PostStore/usePostStore";
import Threedot from "../icons/Threedot";
import { Post } from "../lib/utils";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleSave, addComment } = usePostStore();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showReport, setShowReport] = useState(false);

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      addComment(post._id, commentText);
      setCommentText("");
      setShowCommentInput(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest(".relative")) {
        setShowReport(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="max-w-[700px] mx-auto rounded-xl bg-white p-4 shadow-lg mb-4 border border-gray-200"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("[data-comment-section]")) {
          setShowCommentInput(false);
        }
      }}
    >
      {/* Profile Section */}
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full border-2 border-white shadow-sm overflow-hidden mr-3">
          <img
            src={post.userImagePath}
            alt="Profile"
            className="w-full h-full object-cover bg-gray-100"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800 text-base">
            {post.username}
          </span>
        </div>

        <div className="top-4 right-4">
          <button
            onClick={() => setShowReport(!showReport)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <div className="ml-[520px]">
              <Threedot />
            </div>
          </button>

          {showReport && (
            <div className="absolute right-0 mt-2 w-32 mr-96 bg-white rounded-md shadow-lg border border-gray-200">
              <button
                onClick={() => {
                  console.log("Reported post:", post._id);
                  setShowReport(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text Content */}
      {post.text && (
        <div className="mb-4 text-gray-800 text-[15px] leading-relaxed">
          {post.text}
        </div>
      )}

      {/* Post Image */}
      {post.postsImagePath && (
        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
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
      <div className="flex items-center text-gray-500 text-sm border-t border-gray-100 pt-3">
        <button
          className="flex items-center mr-6 hover:text-red-500 transition-colors"
          onClick={() => toggleLike(post._id)}
        >
          <HeartIcon
            filled={post.isLiked}
            className={post.isLiked ? "text-red-600" : "text-gray-500"}
          />
          <span className="ml-2 font-medium">{post.likes.length}</span>
        </button>

        <button
          className="flex items-center mr-6 hover:text-blue-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowCommentInput(!showCommentInput);
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </div>

          {post.comments.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              {post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-white p-3 rounded-md border border-gray-100"
                >
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-gray-700">
                      {comment.user.username} {/* Assume populated user */}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-xs">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-snug">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}