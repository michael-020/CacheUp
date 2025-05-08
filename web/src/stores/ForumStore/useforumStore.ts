import {create} from 'zustand';
import { axiosInstance } from '@/lib/axios';
import type { Comment, ForumStore, PostSchema } from '@/stores/ForumStore/types';
import { AxiosError } from "axios";
import toast from 'react-hot-toast';
import { useAuthStore } from '../AuthStore/useAuthStore';

export const useForumStore = create<ForumStore>((set, get) => ({
  forums: [],
  currentForum: {
    title: '',
    threads: [],
    loading: false,
    error: '',
  },
  loadingForums: false,
  errorForums: '',
  loading: false,
  error: "",
  searchResult: { 
    msg: '',
    searchResults: [] 
  },
  posts: [],
  threadTitle: "",
  threadDescription: "",
  threadMongo: "",
  threadWeaviate: "",
  likedPosts: new Set<string>(),
  isCreatingPost: false,
  comments: {},
  commentsLoading: {},
  commentsError: {},
  isWatched: false,
  notifications: [],
  reportLoading: {},
  requestedForums: [],
  totalPages: 0,
  totalPosts: 0,
  hasNextPage: false,
  reportedComments:[],
  reportedPosts: [],
  reportedThreads: [],

  fetchForums: async (isAdminRoute: boolean) => {
    set((state) => ({ ...state, loadingForums: true, errorForums: '' }));
  
    try {
      let endpoint;
      if(isAdminRoute){
        endpoint = '/admin/get-forums'
      } else if(useAuthStore.getState().authUser){
        endpoint = '/forums/get-forums'
      } else {
        endpoint = "/forums/view-forums"
      }
      const { data } = await axiosInstance.get(endpoint);
  
      set((state) => ({
        ...state,
        forums: data?.allForums ?? [],
        loadingForums: false,
      }));
    } catch (error) {
      const err = error as AxiosError<{ msg?: string }>;
  
      const errorMsg =
        err?.response?.data?.msg ||
        err?.message ||
        'Something went wrong while fetching forums.';
  
      set((state) => ({
        ...state,
        errorForums: errorMsg,
        loadingForums: false,
      }));
    }
  },

  deleteForum: async (forumId, weaviateId) => {
    try {
      await axiosInstance.delete(`/admin/delete-forum/${forumId}/${weaviateId}`);
      set((state) => ({
        forums: state.forums.filter(f => f._id !== forumId)
      }));
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },

  editForum: async (mongoId, weaviateId, { title, description }) => {
    try {
      const response = await axiosInstance.put(
        `/admin/edit-forum/${mongoId}/${weaviateId}`,
        { title, description }
      );
      const updatedForum = response.data.forumMongo;
      set((state) => ({
        forums: state.forums.map((forum) =>
          forum._id === updatedForum._id ? updatedForum : forum
        ),
      }));
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },


  fetchThreads: async (forumId, isAdminRoute) => {
    set({ currentForum: { ...get().currentForum, loading: true } });
    try {
      let endpoint;
      if(isAdminRoute){
        endpoint = `/admin/get-threads/`
      } else if(useAuthStore.getState().authUser){
        endpoint = `/forums/get-threads/`
      } else {
        endpoint = "/forums/view-threads/"
      }
      const response = await axiosInstance.get(`${endpoint + forumId}`);
      set({ currentForum: { ...get().currentForum, title: response.data.forum.title,  threads: response.data.allThreads, loading: false } });
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set({ currentForum: { ...get().currentForum, error: error.response?.data?.msg || 'Failed to fetch threads', loading: false } });
    }
  },

  createThread: async (forumId, weaviateId, threadData, isAdminRoute) => {
    try {
      const endpoint = isAdminRoute 
        ? `/admin/forums/${forumId}/${weaviateId}`
        : `/forums/create-thread/${forumId}/${weaviateId}`;

      await axiosInstance.post(endpoint, threadData);
      get().fetchThreads(forumId, isAdminRoute);
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },

  searchForums: async (query) => {
    set({ loading: true, error: '' });
    try {
      let endpoint;
      if(useAuthStore.getState().authUser){
        endpoint = "/forums/search-forums/"
      } else {
        endpoint = "/forums/search-forums-na/"
      }
      const response = await axiosInstance.get(endpoint + query);
      set({ 
        searchResult: response.data, 
        loading: false 
      });
      
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set({ 
        loading: false 
      });
      throw error;
    }
  },

  fetchPosts: async (threadId: string, page: string, isAdmin?: boolean) => {
    if (!threadId) throw new Error("Thread ID is required");
  
    set((state) => ({ ...state, loading: true }));
  
    try {
      let endpoint;
      if(isAdmin){
        endpoint = "/admin/get-thread-posts/"
      } else if(useAuthStore.getState().authUser){
        endpoint = "/forums/get-posts/"
      } else {
        endpoint = "/forums/view-posts/"
      }
      const { data } = await axiosInstance.get(`${endpoint}${threadId}/${page}`);
  
      const {
        posts = [],
        threadTitle = '',
        threadDescription = '',
        threadMongo = null,
        threadWeaviate = null,
      } = data || {};
  
      set((state) => ({
        ...state,
        posts,
        threadTitle,
        threadDescription,
        threadMongo,
        threadWeaviate,
        loading: false,
        totalPages: data.pagination.totalPages, 
        totalPosts: data.pagination.totalPosts,
        hasNextPage: data.pagination.hasNextPage
      }));
  
      return posts;
    } catch (error) {
      set((state) => ({ ...state, loading: false }));
      throw error;
    }
  },
  
  // Create a new post in a thread
  createPost: async (threadMongo, threadWeaviate, content) => {
    set({ isCreatingPost: true })
    try {
      const response = await axiosInstance.post(`/forums/create-post/${threadMongo}/${threadWeaviate}`, {content}, {withCredentials: true});
      const newPost = response.data.postMongo;
      
      const currentUser = useAuthStore.getState().authUser;
      
      const populatedPost = {
        ...newPost,
        createdBy: {
          _id: currentUser?._id,
          username: currentUser?.username,
          profilePicture: currentUser?.profilePicture
        }
      };
      
      set((state) => ({
        threadTitle: state.threadTitle,
        threadDescription: state.threadDescription,
        threadMongo: state.threadMongo,
        threadWeaviate: state.threadWeaviate,
        posts: [populatedPost, ...state.posts],
        loading: false
      }));
  
      toast.success("Post Created Successfully")
      return populatedPost;
    } catch (error) {
      toast.error("Error Creating Post")
      throw error;
    } finally {
      set({ isCreatingPost: false })
    }
  },

  
  toggleLike: async (postId: string) => {
    try {
      const isLiked = get().likedPosts.has(postId);
      const res = await axiosInstance(`/forums/like-post/${postId}`);

      set((state) => {
        const updated = new Set(state.likedPosts);
        if (isLiked) {
          updated.delete(postId);
        } else {
          updated.add(postId);
        }
        return { likedPosts: updated };
      });

      return res.data.like;
    } catch (err) {
      console.error("Like API error:", err);
    }
  },

  toggleDislike: async (postId: string) => {
    try {
      const response = await axiosInstance.put(`/forums/dislike-post/${postId}`);
      
      set((state) => {
        const posts = state.posts.map(post => {
          if (post._id === postId) {
            const userId = useAuthStore.getState().authUser?._id;
            if (!userId) return post;
            
            const isDisliked = post.disLikedBy?.includes(userId);
            
            return {
              ...post,
              disLikedBy: isDisliked 
                ? post.disLikedBy?.filter(id => id !== userId)
                : [...(post.disLikedBy || []), userId],
              likedBy: post.likedBy?.filter(id => id !== userId)
            };
          }
          return post;
        });
        
        return { posts };
      });
      
      return response.data;
    } catch (err) {
      console.error("Dislike API error:", err);
      throw err;
    }
  },

  setPosts: (posts: PostSchema[]) => {
    set({ posts });
  },

  isLiked: (postId: string) => get().likedPosts.has(postId),

  fetchComments: async (postId, isAdmin?) => {
    if (!postId) return [];
    
    set((state) => ({
      commentsLoading: { ...state.commentsLoading, [postId]: true },
      commentsError: { ...state.commentsError, [postId]: '' }
    }));
    
    try {
      let url; 
      if(isAdmin){
        url = `/admin/get-comments/${postId}`
      } else if(useAuthStore.getState().authUser){
        url = `/forums/get-comments/${postId}`
      } else {
        url = `/forums/view-comments/${postId}`
      }
      const response = await axiosInstance.get(url);
      const fetchedComments = response.data.comments || [];
      
      set((state) => ({
        comments: { ...state.comments, [postId]: fetchedComments },
        commentsLoading: { ...state.commentsLoading, [postId]: false }
      }));
      
      return fetchedComments;
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set((state) => ({
        commentsLoading: { ...state.commentsLoading, [postId]: false },
        commentsError: { 
          ...state.commentsError, 
          [postId]: error.response?.data?.msg || 'Failed to fetch comments' 
        }
      }));
      return [];
    }
  },
  
  createComment: async (postId, postWeaviateId, content) => {
    try {
        const response = await axiosInstance.post(`/forums/create-comment/${postId}/${postWeaviateId}`, {
            content
        });
        
        // Get current user info
        const currentUser = useAuthStore.getState().authUser;
        
        if (!currentUser) {
            throw new Error('User not authenticated');
        }
        
        // Create populated comment with user data
        const commentData = response.data.commentMongo;
        const populatedComment = {
            ...commentData,
            createdBy: {
                _id: currentUser._id,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture || null
            }
        };
        
        // Update both comments and post's comment count
        set((state) => {
            const currentPostComments = state.comments[postId] || [];
            const updatedPosts = state.posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        commentsCount: (post.commentsCount || 0) + 1
                    };
                }
                return post;
            });

            return {
                comments: {
                    ...state.comments,
                    [postId]: [...currentPostComments, populatedComment]
                },
                posts: updatedPosts
            };
        });
        
        return populatedComment;
    } catch (err) {
        console.error("Error creating comment:", err);
        toast.error("Failed to create comment");
        throw err;
    }
},

  likeComment: async (commentId, userId) => {
    try {
      // Optimistically update UI
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? {
                    ...comment,
                    likedBy: comment.likedBy.includes(userId) 
                      ? comment.likedBy.filter(id => id !== userId)  // Unlike
                      : [...comment.likedBy, userId],                // Like
                    disLikedBy: comment.disLikedBy.filter(id => id !== userId) // Remove from dislikes if exists
                  }
                : comment
            )
          ])
        )
      }));
  
      await axiosInstance.put(`/forums/like-comment/${commentId}`);
    } catch (err) {
      // Revert on error
      await get().fetchComments(Object.keys(get().comments)[0]);
      throw err;
    }
  },
  
  dislikeComment: async (commentId, userId) => {
    try {
      // Optimistically update UI
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment =>
              comment._id === commentId
                ? {
                    ...comment,
                    disLikedBy: comment.disLikedBy.includes(userId)
                      ? comment.disLikedBy.filter(id => id !== userId)  // Un-dislike
                      : [...comment.disLikedBy, userId],                // Dislike
                    likedBy: comment.likedBy.filter(id => id !== userId) // Remove from likes if exists
                  }
                : comment
            )
          ])
        )
      }));
  
      await axiosInstance.put(`/forums/dislike-comment/${commentId}`);
    } catch (err) {
      // Revert on error
      await get().fetchComments(Object.keys(get().comments)[0]);
      throw err;
    }
  },
  
  editComment: async (commentId: string, weaviateId: string, content: string) => {
    try {
      const response = await axiosInstance.put(`/forums/edit-comment/${commentId}/${weaviateId}`, { content });
      const updatedComment = response.data.commentMongo;
      
      // Update both comments and post state
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? {
                    ...comment,
                    content,
                    updatedAt: new Date().toISOString()
                  }
                : comment
            )
          ])
        )
      }));

      toast.success("Comment updated successfully");
      return updatedComment;
    } catch (err) {
      console.error("Error updating comment:", err);
      toast.error("Failed to update comment");
      throw err;
    }
  },
  
  deleteComment: async (commentId, weaviateId, isAdmin? ) => {
    try {
        const url = isAdmin ? "/admin/delete-comment" : "/forums/delete-comment"
        await axiosInstance.delete(`${url}/${commentId}/${weaviateId}`);
        
        // Find which post this comment belongs to
        set((state) => {
            let postId: string | null = null;
            
            // Find the post that contains this comment
            for (const [pid, comments] of Object.entries(state.comments)) {
                if (comments.some(c => c._id === commentId)) {
                    postId = pid;
                    break;
                }
            }
            
            if (!postId) return state;

            // Update both comments and post count
            const updatedComments = {
                ...state.comments,
                [postId]: state.comments[postId].filter(c => c._id !== commentId)
            };

            const updatedPosts = state.posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        commentsCount: Math.max((post.commentsCount || 0) - 1, 0)
                    };
                }
                return post;
            });

            return {
                comments: updatedComments,
                posts: updatedPosts
            };
        });
        set((state) => ({
          ...state,
          reportedComments: state.reportedComments.filter((comment) => comment._id !== commentId)
        }))
    } catch (err) {
        const error = err as AxiosError<{ msg: string }>;
        throw error;
    }
},

  deleteThread: async (threadId: string, weaviateId: string) => {
    try {
      await axiosInstance.delete(`/admin/delete-thread/${threadId}/${weaviateId}`)
      
      set((state) => ({
        currentForum: {
          ...state.currentForum,
          threads: state.currentForum.threads.filter(
            (thread) => thread._id !== threadId
          )
        },
        reportedThreads: state.reportedThreads.filter(
          (thread) => thread._id !== threadId
        )
      }))
  
      toast.success("Thread deleted successfully")
    } catch (error) {
      toast.error("Could not delete the thread")
      console.error(error)
    }
  },
  
  watchThread : async (threadId: string) => {
    try{
      const response = await axiosInstance.put(`/forums/watch-thread/${threadId}`)
      const toastMessage = response.data.msg === "Subscirbed" ? set({ isWatched : true}) : set({  isWatched: false })
      if(typeof(toastMessage) !== "string")
        return
      toast.success(toastMessage)
    }catch(error){
      toast.error("Error in subscribing/unsubscribing thread")
      console.error(error)
    }
  },

  checkWatchStatus : async (threadId: string) => {
    try{
      const response = await axiosInstance.get(`/forums/watch-status/${threadId}`)
      set({ isWatched: response.data.isWatched })
    }catch(error){
      console.error(error)
    }
  },

  fetchNotifications : async () => {
    set({ loading: true })
    try {
      if(!useAuthStore.getState().authUser){
        return
      }
      const response = await axiosInstance.get(`/forums/notification`)
      set({ notifications: response.data.notifications})
    }catch(error){
      console.error(error)
      toast.error("Error in fetching notifications")
    }finally{
      set({loading: false})
    }
  },

  markNotificationRead: async (notificationId) => {
    try{
      await axiosInstance.put(`/forums/notification/${notificationId}`)
    }catch(err){
      console.error(err)
    }
  },

  createForumRequest: async (title, description) => {
    set({ loading: true })
    try {
      const response = await axiosInstance.post(`/forums/request-forum`,{ title, description })
      toast.success(response.data.msg)
    }catch(error){
      console.error(error)
      toast.error("Request Unsuccessful")
    }finally{
      set({ loading: false })
    }
  },

  reportPost: async(postId: string) => {
    try {
      set((state) => ({
        reportLoading: { ...state.reportLoading, [postId]: true }
      }));

      const response = await axiosInstance.put(`/forums/report-post/${postId}`);
      const userId = useAuthStore.getState().authUser?._id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (response.status === 200) {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post._id === postId) {
              const isCurrentlyReported = post.reportedBy?.includes(userId);
              return {
                ...post,
                reportedBy: isCurrentlyReported 
                  ? post.reportedBy?.filter(id => id !== userId)
                  : [...(post.reportedBy || []), userId],
                reportCount: isCurrentlyReported 
                  ? (post.reportedBy?.length || 1) - 1 
                  : (post.reportedBy?.length || 0) + 1
              };
            }
            return post;
          })
        }));

        return response.data;
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Failed to report post");
      throw error;
    } finally {
      set((state) => ({
        reportLoading: { ...state.reportLoading, [postId]: false }
      }));
    }
  },

  deletePost: async (postId, weaviateId, isAdmin?) => {
    try {
      const url = isAdmin ? `/admin/delete-post/${postId}/${weaviateId}` : `/forums/delete-post/${postId}/${weaviateId}`
      await axiosInstance.delete(url);
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        reportedPosts: state.reportedPosts.filter((post) => post._id !== postId)
      }));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  },

reportComment: async (commentId: string) => {
  try {
    set((state) => ({
      reportLoading: { ...state.reportLoading, [commentId]: true }
    }));
    
    const response = await axiosInstance.put(`/forums/report-comment/${commentId}`);
    
    if (response.status === 200) {
      set((state) => {
        const updatedComments = { ...state.comments };

        Object.keys(updatedComments).forEach(postId => {
          updatedComments[postId] = updatedComments[postId].map((comment: Comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                reportedBy: response.data.reportCount > 0 ?
                  [...(comment.reportedBy || []), 'current-user'] :
                  (comment.reportedBy || []).filter(id => id !== 'current-user')
              };
            }
            return comment;
          });
        });
        
        return { comments: updatedComments };
      });
      
      return response.data;
    }
  } catch (error) {
    console.error("Error reporting comment:", error);
    throw error;
  } finally {
    set((state) => ({
      reportLoading: { ...state.reportLoading, [commentId]: false }
    }));
  }
},

checkIfPostReported: (post: PostSchema, userId: string) => {
  return post.reportedBy?.some((id: string) => id.toString() === userId.toString()) || false;
},

checkIfCommentReported: (comment: Comment, userId: string) => {
  return comment.reportedBy?.some((id: string) => id.toString() === userId.toString()) || false;
},

fetchRequestedForums: async() => {
  try {
    set({ loading: true, error: "" });
    const res = await axiosInstance.get("/admin/requested-forums");
    set({ requestedForums: res.data.requestedForums, loading: false });
  } catch (err) {
    set({error: "Something went wrong"});
    console.log(err)
  } finally {
    set({loading: false, error: ""})
  }
},

editPost: async (mongoId: string, weaviateId: string, content: string) => {
  try {
    await axiosInstance.put(`/forums/edit-post/${mongoId}/${weaviateId}`, { content });
    
    const currentUser = useAuthStore.getState().authUser;
    
    if (!currentUser?._id) {
      throw new Error('User not authenticated');
    }
    
    set((state) => ({
      ...state,
      posts: state.posts.map((post) => {
        if (post._id === mongoId) {
          return {
            ...post,
            content,
            updatedAt: new Date().toISOString(),
            createdBy: {
              _id: currentUser._id,
              username: currentUser.username || '',
              profilePicture: currentUser.profilePicture || ''
            }
          } as PostSchema;
        }
        return post;
      })
    }));
    
    toast.success("Post updated successfully");
  } catch (err) {
    console.error("Failed to update post:", err);
    toast.error("Failed to update post");
  }
},

approveRequest: async  (id: string) => {
  try {
    const res = await axiosInstance.post(`/admin/approve-forum/${id}`)
    const forum = res.data.requestedForum
    set((state) => ({
      ...state,
      requestedForums: state.requestedForums.filter((r) => {
        if(r._id !== forum._id){
          return r;
        }
      })
    }))

    toast.success("Forum Approved")
  } catch (error) {
    console.error(error)
    toast.error("Error while approving request")
  }
},

denyRequest: async (id: string) => {
  try {
    const res = await axiosInstance.post(`/admin/reject-forum/${id}`)
    const forum = res.data.requestedForum
    set((state) => ({
      ...state,
      requestedForums: state.requestedForums.filter((r) => {
        if(r._id !== forum._id){
          return r;
        }
      })
    }))

    toast.success("Forum Denied")
  } catch (error) {
    console.error(error)
    toast.error("Error while denying request")
  }
},

fetchReportedContent: async () => {
  try {
    set({loading: true})
    const res = await axiosInstance.get("/admin/reported-content")
    set({reportedComments: res.data.reportedComments, reportedPosts: res.data.reportedPosts, reportedThreads: res.data.reportedThreads})
  } catch (error) {
    console.error(error)
    toast.error("Error while fetching reported posts")
  } finally{
    set({loading: false})
  }
},

unreportContent: async (type, id) => {
  try {
    await axiosInstance.put(`/admin/unreport-content/${id}`, { type })
    set((state) => ({
      ...state,
      ...(type === 'thread' && {
        reportedThreads: state.reportedThreads.filter(thread => thread._id !== id)
      }),
      ...(type === 'post' && {
        reportedPosts: state.reportedPosts.filter(post => post._id !== id)
      }),
      ...(type === 'comment' && {
        reportedComments: state.reportedComments.filter(comment => comment._id !== id)
      }),
    }))
    toast.success("Kept successfully")
  } catch (error) {
    console.error(error)
    toast.error("Error in keeping")
  }
},

reportThread: async (id: string, userId: string) => {
  try {
    await axiosInstance.put(`/forums/report-thread/${id}`);

    const { currentForum } = get();
    const updatedThreads = currentForum.threads.map((thread) => {
      if (thread._id === id) {
        const alreadyReported = thread.reportedBy.includes(userId);
        const updatedReportedBy = alreadyReported
          ? thread.reportedBy.filter((uid) => uid !== userId) // unreport
          : [...thread.reportedBy, userId]; // report

        return { ...thread, reportedBy: updatedReportedBy };
      }
      return thread;
    });

    set({
      currentForum: {
        ...currentForum,
        threads: updatedThreads,
      },
    });
  } catch (error) {
    console.error('Failed to report/unreport thread:', error);
  }
}


}));
  