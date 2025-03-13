import { useEffect } from "react";
import PostCard from "../PostCard";
import Share from "../Share";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";


export function AdminFeed() {
  const { posts, getPosts } = useAdminStore();
  
  useEffect(() => {
    getPosts();
  }, [getPosts]);
  
  return (
    <div className="container mx-auto p-4 mt-16">
      <Share />
      <div className="mt-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard isAdmin={true} key={post._id} post={post} />
          ))
        ) : (
          <p>Loading posts...</p> 
        )}
      </div>
    </div>
  );
}