import { useEffect } from "react";
import { usePostStore } from "../../stores/PostStore/usePostStore";
import PostCard from "../PostCard";
import Share from "../Share";


export function Feed() {
  const { posts, fetchPosts } = usePostStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  return (
    <div className="container mx-auto p-4 mt-16">
      <Share />
      <div className="mt-4 -z-10">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <p>Loading posts...</p> 
        )}
      </div>
    </div>
  );
}