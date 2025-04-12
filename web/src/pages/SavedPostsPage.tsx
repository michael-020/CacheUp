// src/pages/SavedPostsPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { usePostStore } from "@/stores/PostStore/usePostStore";
import PostCard from "@/components/PostCard";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";

export default function SavedPostsPage() {
  const navigate = useNavigate();
  const { savedPosts, fetchSavedPosts, isFetchingSavedPosts } = usePostStore();

  useEffect(() => {
    const controller = new AbortController();
    fetchSavedPosts();
  
    return () => {
      controller.abort();
      usePostStore.getState().clearSavedPosts();
    };
  }, [fetchSavedPosts]);

  

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
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Saved Posts</h1>
          </div>
        </div>

        {/* Posts */}
        {isFetchingSavedPosts ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No saved posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}