import { useEffect, useRef, useCallback, useState } from 'react';
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import Share from "../Share";
import { FriendSuggestionsSlider } from '../FriendSuggestionsSlider';
import { Post } from '@/lib/utils';

interface LoadedPostsState {
  [key: string]: boolean;
}

export const Feed = () => {
  const { 
    fetchPosts, 
    loadMorePosts, 
    isFetchingPosts, 
    isLoadingMore,
    posts, 
    hasMore 
  } = usePostStore();
  
  // Track which posts have finished loading
  const [loadedPosts, setLoadedPosts] = useState<LoadedPostsState>({});
  
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

  
  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach((post: Post, index: number) => {
        setTimeout(() => {
          setLoadedPosts(prev => ({
            ...prev,
            [post._id]: true
          }));
        }, 100 * (index + 1)); 
      });
    }
  }, [posts]);
  
  const renderPosts = () => {
    const chunks: Post[][] = [];
    for (let i = 0; i < posts.length; i += 5) {
      const chunk = posts.slice(i, i + 5);
      chunks.push(chunk);
    }
    
    return chunks.map((chunk: Post[], chunkIndex: number) => (
      <div key={`chunk-${chunkIndex}`}>
        {chunk.map((post: Post, index: number) => (
          <div 
            key={post._id}
            ref={chunkIndex === chunks.length - 1 && index === chunk.length - 1 ? lastPostElementRef : null}
          >
            {/* Show skeleton until post is loaded */}
            {!loadedPosts[post._id] ? (
              <PostCardSkeleton />
            ) : (
              <PostCard post={post} />
            )}
            
            {/* Show FriendSuggestions after 2nd post on mobile/tablet */}
            {chunkIndex === 0 && index === 1 && loadedPosts[post._id] && (
              <div className="lg:hidden">
                <FriendSuggestionsSlider />
              </div>
            )}
          </div>
        ))}
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
          <div className="space-y-4">
            {/* Initial loading state - show multiple skeletons */}
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={`initial-skeleton-${i}`} />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (          
          <>
            {renderPosts()}
            
            {/* Show additional skeleton at the end when loading more */}
            {hasMore && isLoadingMore && (
              <PostCardSkeleton key="bottom-loader" />
            )}
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