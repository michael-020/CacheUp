import { useEffect, useState } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { useParams } from "react-router-dom";

export const Thread = () => {
  const { id } = useParams();
  const { fetchPosts, posts: responseData, loading, error } = useForumStore();
  
  console.log("Full API response:", responseData);  // Debugging
  
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
  
  // Check if we're getting the posts directly or in a nested structure
  const posts = responseData?.posts || responseData || [];
  
  if (!Array.isArray(posts)) {
    console.error("Invalid data type for posts:", posts);
    return (
      <div className="p-6 mx-auto max-w-3xl bg-red-50 border border-red-200 rounded-lg text-center">
        <div className="text-red-600 text-lg font-medium">Invalid data format received</div>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="p-8 mx-auto max-w-3xl bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="text-gray-500 text-lg">No posts found in this thread</div>
        <div className="mt-4 text-sm text-gray-400">Be the first to post in this discussion</div>
      </div>
    );
  }
  
  // Helper function to extract author name
  const getAuthorName = (createdBy) => {
    if (typeof createdBy === 'string') {
      return createdBy;
    } else if (createdBy && typeof createdBy === 'object') {
      return createdBy.username || 'Unknown User';
    }
    return 'Unknown User';
  };

  // Helper function to get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Helper function to get a deterministic color based on username
  const getUserColor = (username) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    
    // Simple hash function to get consistent colors for the same username
    const hash = username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  // Format date nicely
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">Thread Discussion</h1>
        <div className="text-gray-500">{posts.length} {posts.length === 1 ? 'post' : 'posts'} in this thread</div>
      </div>
      
      <div className="space-y-6">
        {posts.map((post, index) => {
          const author = getAuthorName(post.createdBy);
          
          return (
            <div 
              key={post._id} 
              className={`rounded-lg shadow-sm border ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} overflow-hidden`}
            >
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getUserColor(author)}`}>
                  {getInitials(author)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{author}</div>
                  <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                </div>
                {index === 0 && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Original Post</div>
                )}
              </div>
              
              <div className="p-5">
                <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>
              </div>
              
              <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 011 1v10a1 1 0 01-1 1H6a3 3 0 01-3-3V6zm3-1a1 1 0 00-1 1v8a1 1 0 001 1h10V5H6z" clipRule="evenodd" />
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