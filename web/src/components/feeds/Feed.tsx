import { usePostStore } from "../../stores/postStore";
import PostCard from "../PostCard";
import Share from "../Share";

export  function Feed() {
  const { posts } = usePostStore();

  return (
    <div className="container mx-auto p-4">
      <Share />
      <div className="mt-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}