import { useEffect, useState } from "react";
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import Share from "../Share";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function Feed() {
  const { posts, fetchPosts } = usePostStore();
  const [isLoading, setIsLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)'); 

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
      {/* Desktop-only Share Section */}
      {isDesktop && (
        <div className="w-full md:w-[700px] mx-auto mb-6">
          <Share/>
        </div>
      )}

      {/* Posts List */}
      <div className="mt-4">
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