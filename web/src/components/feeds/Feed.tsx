import { useEffect } from 'react';
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import Share from "../Share";
import { FriendSuggestionsSlider } from '../FriendSuggestionsSlider';

export const Feed = () => {
  const { fetchPosts, isFetchingPosts, posts } = usePostStore();
  
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts]);
  
  return (
    <div className="container mx-auto p-4 lg:translate-y-20 translate-y-12">
      {<div className="hidden lg:block">
        <Share />
      </div> }
      <div className="mt-4 -z-10">
        {isFetchingPosts ? (
          <div>
            <PostCardSkeleton />
          </div>
        ) : posts && posts.length > 0 ? (          
          posts.map((post, index) => (
            <>
              <PostCard key={post._id} post={post} />
              {/* Show FriendSuggestions after 6th post on mobile/tablet */}
              {index === 1 && (
                <div className="lg:hidden">
                  <FriendSuggestionsSlider />
                </div>
              )}
            </>
          ))
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