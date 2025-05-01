import { useEffect, useState, useRef, useCallback } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import CreatePostModal from "@/components/forums/CreatePostModalForums"; 
import { Button } from "@/components/ui/button"; 
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import { axiosInstance } from "@/lib/axios";
import { ArrowLeft, EllipsisVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PostSchema } from "@/stores/ForumStore/types";
import ForumComment from "@/components/forums/ForumComment";
import { motion } from "framer-motion"
import { routeVariants } from "@/lib/routeAnimation";
import {ThreadSkeleton} from "@/components/skeletons/ThreadSkeleton"
import { DeleteModal } from "@/components/DeleteModal";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { SearchBar } from "@/components/forums/search-bar";
import { Helmet } from "react-helmet-async";

export const Thread = () => {
  const { id } = useParams();
  const { page } = useParams();
  const { fetchPosts, posts, loading, error, threadTitle, threadDescription, threadWeaviate, isWatched, watchThread, checkWatchStatus, deletePost, totalPages, totalPosts, hasNextPage } = useForumStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authAdmin } = useAdminStore();
  const [likeLoading, setLikeLoading] = useState<{[key: string]: boolean}>({});
  const postRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<{[key: string]: boolean}>({});
  const { authUser } = useAuthStore();
  const isAdmin = Boolean(authAdmin);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [editingPostId, setEditingPostId] = useState<{[key: string]: boolean}>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState<{[key: string]: boolean}>({});
  const [paginationInput, setPaginationInput] = useState(page?.toString());

  const toggleMenu = (postId: string) => {
    setMenuOpen(prev => {
      const isOpening = !prev[postId];
      if (!isOpening) {
        setEditingPostId(prev => ({ ...prev, [postId]: false }));
        setDeleteModalOpen(prev => ({ ...prev, [postId]: false }));
      }
      return {
        ...prev,
        [postId]: !prev[postId]
      };
    });
  };

  useEffect(() => {
    if((typeof(id) !== "string") || (typeof(page) !== "string"))
      return;
    fetchPosts(id, page, isAdmin);
    checkWatchStatus(id);
  }, [id, page, fetchPosts, checkWatchStatus, isAdmin]);

  useEffect(() => {
    setPaginationInput(page?.toString());
  }, [page]);

  const useQuery = () => {
    return new URLSearchParams(useLocation().search)
  }

  const query = useQuery()
  const postQuery = query.get("post")

  const scrollToPost = (postId: string) => {
    const element = document.getElementById(`post-${postId}`)
    if(element){
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  useEffect(() => {
    if(postQuery){
      setTimeout(() => {
        scrollToPost(postQuery)
      }, 300)
    }    
  },[])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(menuOpen).forEach(([postId, isOpen]) => {
        if (isOpen && menuRefs.current[postId] && !menuRefs.current[postId]?.contains(event.target as Node)) {
          setMenuOpen(prev => ({
            ...prev,
            [postId]: false
          }));
        }
      });
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const currentUserId = authUser?._id;

  const checkIfLiked = (post: PostSchema) => {
    if (!currentUserId || !post.likedBy) return false;
    return post.likedBy.some((id: string) => id.toString() === currentUserId.toString());
  };
    
  const checkIfDisliked = (post: PostSchema) => {
    if (!currentUserId || !post.disLikedBy) return false;
    return post.disLikedBy.some((id: string) => id.toString() === currentUserId.toString());
  };

  const handleLikePost = useCallback(async (postId: string) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      
      const response = await axiosInstance.put(`/forums/like-post/${postId}`);
      
      if (response.status === 200) {
        const userId = authUser?._id;
        if (!userId) return;
        
        const updatedPosts = posts.map(post => {
          if (post._id === postId) {
            const isAlreadyLiked = post.likedBy?.includes(userId);
            
            return {
              ...post,
              likedBy: isAlreadyLiked 
                ? post.likedBy?.filter(id => id !== userId)
                : [...(post.likedBy || []), userId],
              disLikedBy: post.disLikedBy?.filter(id => id !== userId)
            };
          }
          return post;
        });
        
        useForumStore.getState().setPosts(updatedPosts);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  }, [posts, authUser, setLikeLoading]);

  const handleDislikePost = useCallback(async (postId: string) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      await useForumStore.getState().toggleDislike(postId);
    } catch (error) {
      console.error("Error disliking post:", error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  }, []);

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

  // Pagination handlers
  const goToFirstPage = () => {
    isAdmin ? navigate(`/admin/forums/thread/${id}/1`) : navigate(`/forums/thread/${id}/1`);
  };
  
  const goToPreviousPage = () => {
    if (Number(page) > 1) {
      isAdmin ? navigate(`/admin/forums/thread/${id}/${Number(page) - 1}`) : navigate(`/forums/thread/${id}/${Number(page) - 1}`);
    }
  };

  const goToNextPage = () => {
    if (Number(page) < totalPages) {
      isAdmin ? navigate(`/admin/forums/thread/${id}/${Number(page) + 1}`) : navigate(`/forums/thread/${id}/${Number(page) + 1}`);
    }
  };

  const goToLastPage = () => {
    isAdmin ? navigate(`/forums/thread/${id}/${totalPages}`) : navigate(`/forums/thread/${id}/${totalPages}`);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPaginationInput(value);
    }
  };

  const goToPage = () => {
    const pageNumber = Number(paginationInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      isAdmin ? navigate(`/admin/forums/thread/${id}/${pageNumber}`) : navigate(`/forums/thread/${id}/${pageNumber}`);
    } else {
      setPaginationInput(page?.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      goToPage();
    }
  };

  const generateMetaDescription = () => {
    let description = threadDescription;
    const canonicalUrl = `${window.location.origin}/forums/thread/${id}/${page}`
    if(posts.length > 0){
      return { posts, description, canonicalUrl }
    }else{
      return {description, canonicalUrl}
    }
  }

  if (loading) {
    return <ThreadSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 mx-auto max-w-3xl bg-red-50 border border-red-200 rounded-lg text-center">
        <div className="text-red-600 text-lg font-medium mb-2">Error Loading Posts</div>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (<>
      <Helmet>
      <title>{`${threadTitle} | Forum Discussion`}</title>
      <meta name="description" content={`${threadDescription}`} />
      </Helmet>
      <div className="p-8 mx-auto max-w-3xl bg-gray-50 dark:bg-neutral-800 translate-y-20 dark:border-neutral-600 border border-gray-200 rounded-lg text-center mt-16">
        <SearchBar />
        <div className="text-gray-500 text-lg dark:text-white">No posts found in Thread {threadTitle}</div>
        <div className="text-gray-600 dark:text-gray-200 mb-2">{threadDescription}</div>
        <div className="mt-4 text-sm text-gray-400">Be the first to post in this discussion</div>
        <div className="flex gap-4 flex-wrap justify-center">
        <Button
                onClick={() => watchThread(id as string)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-800 mt-3"
              >
                {isWatched ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a 1 1 0 001.414-1.414l-14-14zM10 18a8 8 0 100-16 8 8 0 000 16zm-2.293-7.707l-1-1A1 1 0 118.707 8.293l1 1a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                    </svg>
                    Unwatch
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-2 8a2 2 0 114 0 2 2 0 01-4 0z" />
                    </svg>
                    Watch Thread
                  </>
                )}
              </Button>
        {!hasNextPage && <Button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-3">
          + New Post
        </Button>}

        </div>
        {isModalOpen && (
          <CreatePostModal 
            threadMongo={id as string} 
            threadWeaviate={threadWeaviate} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            mode="create"
          />
        )}
      </div>
      </>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ")
      .map(part => part[0] || '')
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

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
      <Helmet>
        <title>{`${threadTitle} | Forum Discussion`}</title>
        <meta name="description" content={`${generateMetaDescription()}`} />
        <meta property="og:title" content={threadTitle} />
        <meta property="og:description" content={`${generateMetaDescription()}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={generateMetaDescription().canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={threadTitle} />
        <meta name="twitter:description" content={`${generateMetaDescription()}`} />
        <meta name="keywords" content={`${threadTitle}, ${threadDescription}, forum, description, ${posts.map(post => post.content).join(', ')}`} />
      </Helmet>
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-20 lg:pb-10">
      <SearchBar />
        <div className="mb-4 border-b pb-4">
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700 "
            >
              <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-3xl font-bold mb-2">{threadTitle}</h1>       
          </div>

          <p className="text-gray-600 mb-2">{threadDescription}</p>  

          {/* Post count + Centered Button Row */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-gray-500 text-sm">
              {totalPosts ? `${totalPosts} post${totalPosts !== 1 ? "s" : ""}` : `${posts.length} post${posts.length !== 1 ? "s" : ""}`}
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button
                onClick={() => watchThread(id as string)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-800"
              >
                {isWatched ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a 1 1 0 001.414-1.414l-14-14zM10 18a8 8 0 100-16 8 8 0 000 16zm-2.293-7.707l-1-1A1 1 0 118.707 8.293l1 1a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                    </svg>
                    Un-Subscribe
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-2 8a2 2 0 114 0 2 2 0 01-4 0z" />
                    </svg>
                    Subscribe
                  </>
                )}
              </Button>

              {!hasNextPage && <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + New Post
              </Button>}
            </div>
          </div>
        </div>

        {/* Post modal */}
        {isModalOpen && (
          <CreatePostModal 
            threadMongo={id as string} 
            threadWeaviate={threadWeaviate} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            mode="create"
          />
        )}

        {/* Pagination Controls - Top */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-6 bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Button 
                onClick={goToFirstPage} 
                disabled={page === '1'}
                variant="outline"
                size="icon"
                className={`${page === '1' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={goToPreviousPage} 
                disabled={page === '1'}
                variant="outline"
                size="icon"
                className={`${page === '1' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page
              </span>
              <div className="flex items-center">
                <input
                  type="text"
                  value={paginationInput}
                  onChange={handlePageInputChange}
                  onKeyPress={handleKeyPress}
                  onBlur={goToPage}
                  className="w-12 h-8 text-center border border-gray-300 dark:border-neutral-600 rounded dark:bg-neutral-800"
                  aria-label="Page number"
                />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                  of {totalPages}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={goToNextPage} 
                disabled={page === `${totalPages}`}
                variant="outline"
                size="icon"
                className={`${page === `${totalPages}` ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                onClick={goToLastPage} 
                disabled={page === `${totalPages}`}
                variant="outline"
                size="icon"
                className={`${page === `${totalPages}` ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
          
        <div className="space-y-6">
          {posts.map((post, index) => {
            const author = post.createdBy.username;
              const profileImage = post.createdBy.profilePicture;
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
                className={`rounded-lg shadow border dark:bg-neutral-800 bg-white" ${index === 0 && page === '1' ? "border-blue-600 dark:border-blue-900" : "border-gray-100 dark:border-neutral-700"} transition-all duration-300 ${
                  isHighlighted ? "ring-4 ring-blue-300 ring-opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-3 p-4 dark:bg-neutral-800 rounded-t-lg">
                  {profileImage ? (
                    <Link 
                      to={authAdmin ? `/admin/profile/${post.createdBy._id}` : `/profile/${post.createdBy._id}`} 
                    >
                      <img 
                        src={profileImage} 
                        alt={`${author}'s profile`} 
                        className="w-10 h-10 rounded-full object-cover cursor-pointer duration-200 ease-in-out border border-gray-200" 
                      />
                    </Link>
                  ) : (
                    <Link 
                      to={authAdmin ? `/admin/profile/${post.createdBy?._id}` : `/profile/${post.createdBy?._id}`}
                    >
                      <div className={`w-10 h-10 rounded-full cursor-pointer items-center justify-center text-white flex ${getUserColor(author)}`}>
                        <h3>{getInitials(author)}</h3>
                      </div>
                    </Link>
                  )}
                  <div className="flex-1">
                    <Link to={authAdmin ? `/admin/profile/${post.createdBy?._id}` : `/profile/${post.createdBy?._id}`}>
                      <div className="font-medium text-blue-600 hover:underline cursor-pointer">{author}</div>
                    </Link>
                    <div className="text-xs text-gray-500">{formatDate(post.createdAt)}</div>
                    <div className="flex-1">
                </div>

                  </div>
                 
                  {/* Add this menu button */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(post._id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700"
                  >
                    <EllipsisVertical className="h-5 w-5 text-gray-500" />
                  </button>
                  
                
                  {menuOpen[post._id] && (
                    <div 
                      ref={el => menuRefs.current[post._id] = el}
                      className="absolute right-0 translate-y-1 xl:left-2 z-40 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg  border border-gray-200 dark:border-neutral-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="">
                        {(post.createdBy._id === authUser?._id) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingPostId(prev => ({ ...prev, [post._id]: true }));
                                setMenuOpen(prev => ({ ...prev, [post._id]: false }));
                              }}
                              className="block w-full text-left border-b dark:border-neutral-700 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                            >
                              Edit Post
                            </button>
                            

                            <button
                              onClick={() => {
                                setDeleteModalOpen(prev => ({ ...prev, [post._id]: true }));
                                setMenuOpen(prev => ({ ...prev, [post._id]: false }));
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
                            >
                              Delete Post
                            </button>
                          </>
                        )}
                        
                        {authAdmin && post.createdBy._id !== currentUserId && (
                          <button
                            onClick={() => {
                              setDeleteModalOpen(prev => ({ ...prev, [post._id]: true }));
                              setMenuOpen(prev => ({ ...prev, [post._id]: false }));
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
                          >
                            Delete Post (Admin)
                          </button>
                        )}
                        {/* Report/Unreport for others - Only show if user is NOT the post owner and NOT an admin */}
                        {(post.createdBy._id !== currentUserId) && !authAdmin && (
                          <button
                            onClick={() => {
                              useForumStore.getState().reportPost(post._id);
                              setMenuOpen({});
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700"
                          >
                            {post.reportedBy?.includes(currentUserId as string) ? 'Unreport Post' : 'Report Post'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                </div>

                <div className="p-5">
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
                
                <div className="flex items-center gap-4 px-5 py-3 rounded-b-lg  dark:border-neutral-600 bg-gray-50 border-t text-sm text-gray-500 dark:bg-neutral-800">
                  
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
                        onClick={() => {
                          if (likeLoading[post._id]) return;
                          handleDislikePost(post._id);
                        }}
                        disabled={likeLoading[post._id]}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                        >
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span>{post.disLikedBy?.length || 0}</span>
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
                    <span>{post.commentsCount || 0}</span>
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
                {editingPostId[post._id] && (
                  <CreatePostModal 
                    postId={post._id} 
                    isOpen={editingPostId[post._id]} 
                    mode="edit" 
                    weaviateId={post.weaviateId} 
                    initialContent={post.content} 
                    onClose={() => setEditingPostId(prev => ({ ...prev, [post._id]: false }))} 
                  />
                )}

                {deleteModalOpen[post._id] && (
                  <DeleteModal 
                    deleteHandler={() => deletePost(post._id, post.weaviateId, isAdmin)}
                    isModalOpen={deleteModalOpen[post._id]}
                    setIsModalOpen={(isOpen) => {
                      setDeleteModalOpen(prev => ({ ...prev, [post._id]: isOpen }));
                    }}
                    content="Are you sure you want to delete this post? This action cannot be undone."
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white dark:bg-neutral-900 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
            <div className="sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  Showing <span className="font-medium">{posts.length}</span> results
                  {totalPosts && (
                    <>
                      {" "}- Page <span className="font-medium">{page}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-3 sm:mt-0">
                <Button
                  onClick={goToFirstPage}
                  disabled={page === '1'}
                  variant="outline"
                  size="sm"
                  className={`${page === '1' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronsLeft className="h-4 w-4 mr-1" />
                  First
                </Button>
                <Button
                  onClick={goToPreviousPage}
                  disabled={page === '1'}
                  variant="outline"
                  size="sm"
                  className={`${page === '1' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {/* Page number input */}
                <div className="flex items-center px-2">
                  <input
                    type="text"
                    value={paginationInput}
                    onChange={handlePageInputChange}
                    onKeyPress={handleKeyPress}
                    onBlur={goToPage}
                    className="w-12 h-8 text-center border border-gray-300 dark:border-neutral-600 rounded dark:bg-neutral-800"
                    aria-label="Page number"
                  />
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    / {totalPages}
                  </span>
                  <Button 
                    onClick={goToPage}
                    size="sm" 
                    variant="ghost"
                    className="ml-1"
                  >
                    Go
                  </Button>
                </div>
                
                <Button
                  onClick={goToNextPage}
                  disabled={page === `${totalPages}`}
                  variant="outline"
                  size="sm"
                  className={`${page === `${totalPages}` ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  onClick={goToLastPage}
                  disabled={page === `${totalPages}`}
                  variant="outline"
                  size="sm"
                  className={`${page === `${totalPages}` ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Last
                  <ChevronsRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Thread;