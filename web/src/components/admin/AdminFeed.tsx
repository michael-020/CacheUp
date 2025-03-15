import { useEffect } from "react";
import PostCard from "../PostCard";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";


export function AdminFeed() {
  const { posts, getPosts } = useAdminStore();
  
  useEffect(() => {
    getPosts();
  }, [getPosts]);
  
  return (
    <div className="container mt-24">
      {/* <Share /> */}
      <div className="">
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