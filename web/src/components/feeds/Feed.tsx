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
      
      try {
        fetchPosts();
        
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, [fetchPosts]);
  
  return (
    <div className="container mx-auto p-4 lg:translate-y-20 translate-y-12">
      {<div className="hidden lg:block">
        <Share />
      </div> }
      <div className="mt-4 -z-10">
        {isLoading ? (
          <>
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