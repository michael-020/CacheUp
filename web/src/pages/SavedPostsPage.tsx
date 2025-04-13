import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Rows, LayoutGrid, Heart, MessageCircle, X } from "lucide-react";
import { usePostStore } from "@/stores/PostStore/usePostStore";
import PostCard from "@/components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { Post } from "@/lib/utils";

export default function SavedPostsPage() {
  const navigate = useNavigate();
  const { savedPosts, fetchSavedPosts, isFetchingSavedPosts } = usePostStore();
  const [view, setView] = useState<"list" | "grid">("grid");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchSavedPosts();
    return () => {
      controller.abort();
      usePostStore.getState().clearSavedPosts();
    };
  }, [fetchSavedPosts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectedPost && e.target instanceof Element && e.target.id === "popup-overlay") {
        setSelectedPost(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedPost]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPost) {
        setSelectedPost(null);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [selectedPost]);

  const SkeletonPost = ({ isGrid }: { isGrid: boolean }) => {
    if (isGrid) {
      return (
        <div className="aspect-square rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-gray-300 dark:bg-neutral-600 rounded animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="w-8 h-3 bg-gray-300 dark:bg-neutral-600 rounded animate-pulse"></div>
                <div className="w-8 h-3 bg-gray-300 dark:bg-neutral-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="xl:max-w-[700px] md:max-w-[550px] mx-auto rounded-xl bg-white dark:bg-neutral-800 p-4 shadow-lg border border-gray-200 dark:border-neutral-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="size-12 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse mr-3"></div>
            <div className="w-24 h-5 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
        </div>
        
        <div className="mb-4 space-y-2">
          <div className="w-full h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          <div className="w-5/6 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
          <div className="w-4/6 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        </div>
        
        <div className="rounded-xl overflow-hidden mb-4 h-64 bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-600">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mr-2"></div>
              <div className="w-6 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mr-2"></div>
              <div className="w-6 h-4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  };

  const GridPost = ({ post }: { post: Post }) => {
    return (
      <div
        key={post._id}
        className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg shadow-sm transition-transform duration-200 hover:shadow-md hover:scale-[1.02]"
        onClick={() => setSelectedPost(post)}
      >
        {post.postsImagePath ? (
          <>
            <img
              src={post.postsImagePath}
              alt="post"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
              <div className="flex gap-4 items-center mb-2">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5 text-red-500 drop-shadow-md" />
                  <span className="text-white font-medium drop-shadow-md">{post.likes.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5 text-blue-400 drop-shadow-md" />
                  <span className="text-white font-medium drop-shadow-md">{post.comments.length}</span>
                </div>
              </div>
              <button
                className="text-sm text-white hover:text-gray-200 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm transition-colors"
              >
                @{post.username}
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center p-4 text-center relative group">
            <p className="text-gray-800 dark:text-gray-100 text-sm line-clamp-4">{post.text}</p>
            <div className="absolute inset-0 bg-black/20 dark:bg-white/10 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200 rounded-lg">
              <div className="flex gap-4 items-center mb-2">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-gray-800 dark:text-white font-medium">{post.likes.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-800 dark:text-white font-medium">{post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PostPopup = ({ post, onClose }: { post: Post, onClose: () => void }) => {
    return (
      <div 
        id="popup-overlay"
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div 
          className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 bg-black/20 hover:bg-black/40 text-white rounded-full p-1 z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="p-2">
            <PostCard post={post} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="pt-16 min-h-screen bg-gray-100 dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Saved Posts</h1>
          </div>
          <button
            onClick={() => setView(view === "list" ? "grid" : "list")}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label={view === "list" ? "Switch to grid view" : "Switch to list view"}
          >
            {view === "list" ? (
              <LayoutGrid className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Rows className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Content */}
        {isFetchingSavedPosts ? (
          <div className={`${view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-4" : "space-y-4"}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPost key={i} isGrid={view === "grid"} />
            ))}
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 text-center">
            <div className="my-8">
              <Heart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No saved posts yet</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">Posts you save will appear here</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {savedPosts.map((post) => (
              <GridPost key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPost && (
          <PostPopup post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}