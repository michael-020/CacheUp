import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart} from "lucide-react";
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

  const SkeletonPost = () => { 
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

  return (
    <motion.div
      className="pt-16 min-h-screen bg-gray-100 dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="xl:max-w-[700px] md:max-w-[550px] mx-auto p-4">
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
        </div>

        {/* Content */}
        {isFetchingSavedPosts ? (
          <div className={"space-y-4"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonPost key={i} />
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