import { useEffect, useRef, useCallback } from 'react';
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import Share from "../Share";
import { FriendSuggestionsSlider } from '../FriendSuggestionsSlider';

export const Feed = () => {
  const { 
    fetchPosts, 
    loadMorePosts, 
    isFetchingPosts, 
    isLoadingMore,
    posts, 
    hasMore 
  } = usePostStore();
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingPosts) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMorePosts();
      }
    }, { threshold: 0.5 });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingPosts, isLoadingMore, hasMore, loadMorePosts]);
  
  useEffect(() => {
    fetchPosts();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchPosts]);
  
  const renderPosts = () => {
    const chunks = [];
    for (let i = 0; i < posts.length; i += 5) {
      const chunk = posts.slice(i, i + 5);
      chunks.push(chunk);
    }
    
    return chunks.map((chunk, chunkIndex) => (
      <div key={`chunk-${chunkIndex}`}>
        {chunk.map((post, index) => (
          <div 
            key={post._id}
            ref={chunkIndex === chunks.length - 1 && index === chunk.length - 1 ? lastPostElementRef : null}
          >
            <PostCard post={post} />
            {/* Show FriendSuggestions after 2nd post on mobile/tablet */}
            {chunkIndex === 0 && index === 1 && (
              <div className="lg:hidden">
                <FriendSuggestionsSlider />
              </div>
            )}
          </div>
        ))}
        
        {/* Show skeleton loader after each chunk except the last one if we're at the end */}
        {chunkIndex === chunks.length - 1 && hasMore && isLoadingMore && (
          <PostCardSkeleton key={`skeleton-${chunkIndex}`} />
        )}
      </div>
    ));
  };
  
  return (
    <div className="container mx-auto p-4 lg:translate-y-20 translate-y-12">
      {/* Only show Share component for authenticated users */}

      <div className="hidden lg:block">
        <Share />
      </div>
      
      <div className="mt-4 -z-10">
        {isFetchingPosts && posts.length === 0 ? (
          <div>
            <PostCardSkeleton />
          </div>
        ) : posts && posts.length > 0 ? (          
          <>
            {renderPosts()}
          </>
        ) : (
          <div className="min-h-screen">
            <div className="text-center xl:max-w-[700px] md:max-w-[550px] sm:max-w-[500px] mx-auto py-12 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
              <p className="text-gray-600 dark:text-gray-300">No posts available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};