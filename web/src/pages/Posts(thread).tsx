import { useEffect, useState, useRef } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import CreatePostModal from "@/components/forums/CreatePostModalForums"; 
import { Button } from "@/components/ui/button"; 
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import { axiosInstance } from "@/lib/axios";
import { ArrowLeft } from "lucide-react";
import { PostSchema } from "@/stores/ForumStore/types";
import ForumComment from "@/components/forums/ForumComment";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";

export const Thread = () => {
  const { id } = useParams();
  const location = useLocation();
  const { fetchPosts, posts: responseData, loading, error, threadTitle, threadDescription, threadWeaviate, isWatched, watchThread, checkWatchStatus } = useForumStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authAdmin } = useAdminStore();
  const [likeLoading, setLikeLoading] = useState<{[key: string]: boolean}>({});
  const postRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate()
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts(id as string);
    checkWatchStatus (id as string)
  }, [id, fetchPosts]);

  useEffect(() => {
    if (!loading && responseData && responseData.length > 0) {
      const pathParts = location.pathname.split('/');
      const searchParams = new URLSearchParams(location.search);
      let postId = null;
      
      const postIndex = pathParts.indexOf('post');
      if (postIndex !== -1 && postIndex < pathParts.length - 1) {
        postId = pathParts[postIndex + 1];
      }
      
      if (!postId) {
        postId = searchParams.get('post');
      }
      
      if (!postId && location.search) {
        if (location.search.includes('post/')) {
          const matches = location.search.match(/post\/([^/?&]+)/);
          if (matches && matches[1]) {
            postId = matches[1];
          }
        }
      }
      
      if (postId) {
        const scrollTimeout = setTimeout(() => {
          if (postRefs.current[postId]) {
            postRefs.current[postId]?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
            
            setHighlightedPostId(postId);
            setExpandedPosts(prev => ({...prev, [postId]: true}));
            setTimeout(() => {
              setHighlightedPostId(null);
            }, 2000);
          }
        }, 500);
        
        return () => clearTimeout(scrollTimeout);
      }
    }
  }, [location, loading, responseData]);

  const currentUserId = authAdmin?._id || null;

  const checkIfLiked = (post: PostSchema) => {
    if (!currentUserId || !post.likedBy) return false;
    return post.likedBy.some((id: string) => id.toString() === currentUserId.toString());
  };
    
  const checkIfDisliked = (post: PostSchema) => {
    if (!currentUserId || !post.disLikedBy) return false;
    return post.disLikedBy.some((id: string) => id.toString() === currentUserId.toString());
  };

  const handleLikePost = async (postId: string) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      const response = await axiosInstance.put(`/forums/like-post/${postId}`);
      
      if (response.status === 200) {
        fetchPosts(id as string);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDislikePost = async (postId: string) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      const response = await axiosInstance.put(`/forums/dislike-post/${postId}`);

      if (response.status === 200) {
        fetchPosts(id as string);
      }
    } catch (error) {
      console.error("Error disliking post:", error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleExpandPost = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleComments = (postId: string) => {
    const newState = !expandedComments[postId];
    setExpandedComments(prev => ({
      ...prev,
      [postId]: newState
    }));
    
    if (newState) {
      setReplyingTo(postId);
    } else {
      setReplyingTo(null);
    }
  };



  const truncateContent = (content: string, postId: string) => {
    if (content.length <= 500 || expandedPosts[postId]) {
      return content;
    }
    return content.substring(0, 500);
  };

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

  const posts = Array.isArray(responseData) ? responseData : [];

  if (posts.length === 0) {
    return (
      <div className="p-8 mx-auto max-w-3xl bg-gray-50 border border-gray-200 rounded-lg text-center mt-16">
        <div className="text-gray-500 text-lg">No posts found in this thread</div>
        <div className="mt-4 text-sm text-gray-400">Be the first to post in this discussion</div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-3">
          + New Post
        </Button>
        {isModalOpen && (
          <CreatePostModal 
            threadMongo={id as string} 
            threadWeaviate={threadWeaviate} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
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
    if (!username) return "bg-gray-400"; 

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
    <motion.div 
      className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"  
    >
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-10">
        <div className="mb-4 border-b pb-4">
          <div className="flex">
              <button
                onClick={() => navigate(`/forums/${id}/${threadWeaviate}`)}
                className="mr-4 px-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700 "
              >
                <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
              </button>
            <h1 className="text-3xl font-bold mb-2">{threadTitle}</h1>

            <Button
      onClick={() => watchThread(id as string)}
      className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-800"
    >
      {isWatched ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
          <span>Unwatch</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>Watch</span>
        </>
      )}
    </Button>
            
          </div>
          <p className="text-gray-600 mb-3">{threadDescription}</p>    
          <div className="flex items-center justify-between">
            <div className="text-gray-500">{posts.length} {posts.length === 1 ? "post" : "posts"} in this thread</div>
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Post
            </Button>
          </div>
        </div>

        {isModalOpen && (
          <CreatePostModal 
            threadMongo={id as string} 
            threadWeaviate={threadWeaviate} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
          
        <div className="space-y-6">
          {posts.map((post, index) => {
            const author = post.createdBy?.username || "Unknown User";
            const profileImage = post.createdBy?.profilePicture || null;
            const isLiked = checkIfLiked(post)
            const isDisliked = checkIfDisliked(post)
            const isHighlighted = highlightedPostId === post._id;
            const isExpanded = expandedPosts[post._id] || false;
            const contentIsTruncated = post.content.length > 500;
            
            return (
              <div
                key={post._id}
                ref={(el) => postRefs.current[post._id] = el}
                id={`post-${post._id}`}
                className={`rounded-lg shadow border ${index === 0 ? "border-blue-200 dark:bg-neutral-800" : "border-gray-100 bg-white"} overflow-hidden transition-all duration-300 ${
                  isHighlighted ? "ring-4 ring-blue-300 ring-opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-3 p-4 dark:bg-neutral-950 ">
                  {profileImage ? (
                    <Link 
                      to={authAdmin ? `/admin/profile/${post.createdBy._id}` : `/profile/${post.createdBy._id}`} 
                    >
                      <img 
                        src={profileImage} 
                        alt={`${author}'s profile`} 
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-110 duration-200 ease-in-out border border-gray-200" 
                      />
                    </Link>
                  ) : (
                    <Link 
                      to={authAdmin ? `/admin/profile/${post.createdBy?._id}` : `/profile/${post.createdBy?._id}`}
                    >
                      <div className={`w-10 h-10 rounded-full cursor-pointer items-center justify-center text-white flex ${getUserColor(author)}`}>
                        <h3>{getInitials(author)} !</h3>
                      </div>
                    </Link>
                  )}
                  <div className="flex-1">
                    <Link to={authAdmin ? `/admin/profile/${post.createdBy?._id}` : `/profile/${post.createdBy?._id}`}>
                      <div className="font-medium text-blue-600 hover:underline cursor-pointer">{author}</div>
                    </Link>
                    <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                  </div>
                  {index === 0 && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Latest Post</div>
                  )}
                </div>

                <div className="p-5 dark:bg-neutral-950">
                  <div className="prose max-w-none whitespace-pre-wrap text-gray-800 dark:text-white">
                    {truncateContent(post.content, post._id)}
                    {contentIsTruncated && !isExpanded && (
                      <span 
                        className="text-blue-600 font-medium cursor-pointer ml-1 hover:underline"
                        onClick={() => toggleExpandPost(post._id)}
                      >
                        ... See more
                      </span>
                    )}
                    {contentIsTruncated && isExpanded && (
                      <span 
                        className="text-blue-600 font-medium cursor-pointer block mt-2 hover:underline"
                        onClick={() => toggleExpandPost(post._id)}
                      >
                        Show less
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 px-5 py-3  dark:border-neutral-600 bg-gray-50 border-t text-sm text-gray-500 dark:bg-neutral-950">
                  
                  <button 
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors dark:text-gray-300 ${
                      isLiked 
                        ? 'text-blue-600 fill-blue-600' 
                        : 'text-gray-500 fill-gray-500 hover:text-blue-600 hover:fill-blue-600'
                    }`}
                    onClick={() => {
                      if (likeLoading[post._id]) return;
                      handleLikePost(post._id);
                    }}
                    disabled={likeLoading[post._id]}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                    >
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span>{post.likedBy?.length || 0}</span>
                                </button>
                  <button 
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors mt-1 dark:text-gray-300 ${
                      isDisliked 
                        ? 'text-red-600 fill-red-600' 
                        : 'text-gray-500 fill-gray-500 hover:text-red-600 hover:fill-red-600'
                    }`}
                    onClick={() => handleDislikePost(post._id)}
                    disabled={likeLoading[post._id]}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                    >
                      <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                    </svg>
                    <span>{likeLoading[post._id] ? 'Updating...' : `${post.disLikedBy?.length || 0}`}</span>
                  </button>

                  <button 
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                      expandedComments[post._id] 
                        ? 'text-blue-600 fill-blue-600' 
                        : 'text-gray-600 fill-gray-600 hover:text-blue-600 hover:fill-blue-600'
                    }`}
                    onClick={() => toggleComments(post._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span>{expandedComments[post._id] ? "" : ""}</span>
                  </button>
                  
                
                </div>

                {expandedComments[post._id] && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <ForumComment 
                      postId={post._id} 
                      postWeaviateId={post.weaviateId} 
                      focusOnLoad={replyingTo === post._id}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Thread;