import { useEffect, useState } from "react";
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import Share from "../Share";

export function Feed() {
  const { posts, fetchPosts } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        await fetchPosts();
        
        const elapsedTime = Date.now() - startTime;
        const minimumLoadingTime = 200; 
        
        if (elapsedTime < minimumLoadingTime) {
          await new Promise(resolve => 
            setTimeout(resolve, minimumLoadingTime - elapsedTime)
          );
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, [fetchPosts]);

  return (
    <div className="container mx-auto p-4 mt-16">
      {/* Desktop-only Share Section - hidden on mobile */}
      <div className="hidden lg:block w-full max-w-[700px] mx-auto mb-6">
        <Share />
      </div>

      {/* Posts List */}
      <div className="mt-4 lg:max-w-[700px] mx-auto">
        {isLoading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <div className="text-center p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
            <p className="text-gray-600 dark:text-gray-300">No posts available</p>
          </div>
        )}
      </div>
    </div>
  );
}