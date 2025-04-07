import { useEffect } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { useParams } from "react-router-dom";

export const Thread = () => {
  const { id } = useParams();
  const { fetchPosts, posts: responseData, loading, error } = useForumStore();

  console.log("Full API response:", responseData); // Debugging

  useEffect(() => {
    if (!id) {
      console.error("No thread ID found in URL.");
      return;
    }
    fetchPosts(id);
  }, [id, fetchPosts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-3xl bg-red-50 border border-red-200 rounded-lg text-center">
        <div className="text-red-600 text-lg font-medium mb-2">Error Loading Posts</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Ensure responseData is an array
  const posts = Array.isArray(responseData) ? responseData : [];
  console.log("Processed posts:", posts); // Debugging

  if (posts.length === 0) {
    return (
      <div className="translate-y-24 p-8 mx-auto max-w-3xl bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="text-gray-500 text-lg">No posts found in this thread</div>
        <div className="mt-4 text-sm text-gray-400">Be the first to post in this discussion</div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserColor = (username?: string) => {
    if (!username) return "bg-gray-400"; // Default color for missing usernames

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl translate-y-20">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">Thread Discussion</h1>
        <div className="text-gray-500">{posts.length} {posts.length === 1 ? "post" : "posts"} in this thread</div>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => {
          const author = post.createdBy?.username || "Unknown User";
          const profileImage = post.createdBy?.profilePicture || null;

          console.log("Post Author:", author); // Debugging

          return (
            <div
              key={post._id}
              className={`rounded-lg shadow-sm border ${index === 0 ? "border-gray-100 bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700" : "border-gray-200 dark:border-neutral-800"} overflow-hidden`}
            >
              <div className="flex items-center gap-3 p-4 ">
                {profileImage ? (
                  <img src={profileImage} alt={`${author}'s profile`} className="w-10 h-10 rounded-full object-cover" />
                ) : null}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getUserColor(author)}`}
                  style={{ display: profileImage ? "none" : "flex" }}
                >
                  {getInitials(author)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{author}</div>
                  <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                </div>
                {index === 0 && <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Original Post</div>}
              </div>

              <div className="p-5">
                <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
              </div>

              <div className="flex items-center gap-4 px-4 py-3 text-sm text-gray-500">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  Like ({post.likedBy?.length || 0})
                </button>
                
                <button className="flex items-center gap-1 hover:text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  Dislike ({post.disLikedBy?.length || 0})
                </button>
                
                <button className="flex items-center gap-1 hover:text-gray-700 ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="20" height="20" viewBox="0 0 32 32" id="comment">
                <g fill="#1C1C1C">
                    <path d="M8.5 15h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1 0-1zM8.5 12h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1 0-1zM8.5 9h15a.5.5 0 0 1 0 1h-15a.5.5 0 0 1 0-1z"></path>
                    <path d="M0 2v21a2 2 0 0 0 2 2h18l8 7v-7h2a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2zm1 1a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v19a2 2 0 0 1-2 2h-2v6l-5.833-5L20 24H3a2 2 0 0 1-2-2V3z"></path>
                </g>
                </svg>                  
                Reply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Thread;
