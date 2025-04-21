import {create} from 'zustand';
import { axiosInstance } from '@/lib/axios';
import type { Comment, ForumStore, PostSchema } from '@/stores/ForumStore/types';
import { AxiosError } from "axios";
import toast from 'react-hot-toast';

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

  comments: {},
  commentsLoading: {},
  commentsError: {},
  isWatched: false,
  notifications: [],
  reportLoading: {},
  requestedForums: [],

  
  fetchForums: async (isAdminRoute: boolean) => {
    set((state) => ({ ...state, loadingForums: true, errorForums: '' }));
  
    try {
      const endpoint = isAdminRoute ? '/admin/get-forums' : '/forums/get-forums';
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

  
  fetchForumDetails: async (forumId) => {
    set({ currentForum: { ...get().currentForum, loading: true, error: '' } });
    try {
      const response = await axiosInstance.get(`/get-threads/${forumId}`);
      set({ currentForum: { ...get().currentForum, title: response.data.forum.title } });
    } catch (err) {
    //   const error = err as AxiosError<{ msg: string }>;
    //   set({ currentForum: { ...get().currentForum, error: error.response?.data?.msg || 'Failed to fetch forum' } });
      console.error(err)
    }
  },

  fetchThreads: async (forumId, isAdminRoute) => {
    set({ currentForum: { ...get().currentForum, loading: true } });
    try {
      const endpoint = isAdminRoute 
        ? `/admin/get-threads/`
        : `/forums/get-threads/`;
      const response = await axiosInstance.get(`${endpoint + forumId}`);
      set({ currentForum: { ...get().currentForum, threads: response.data.allThreads, loading: false } });
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
      const response = await axiosInstance.get(`/forums/search-forums/${query}`);
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

  fetchPosts: async (threadId: string, isAdmin = false) => {
    if (!threadId) throw new Error("Thread ID is required");
  
    set((state) => ({ ...state, loading: true }));
  
    try {
      const endpoint = isAdmin ? "/admin/get-thread-posts/" : "/forums/get-posts/";
      const { data } = await axiosInstance.get(`${endpoint}${threadId}`);
  
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
      }));
  
      return posts;
    } catch (error) {
      set((state) => ({ ...state, loading: false }));
      throw error;
    }
  },
  
  

  // Create a new post in a thread
  createPost: async (threadMongo, threadWeaviate, content) => {
    try {
      const response = await axiosInstance.post(`/forums/create-post/${threadMongo}/${threadWeaviate}`, {content}, {withCredentials: true});
      const newPost = response.data.postMongo;
      
      set((state) => ({
        threadTitle: state.threadTitle,
        threadDescription: state.threadDescription,
        threadMongo: state.threadMongo,
        threadWeaviate: state.threadWeaviate,
        posts: [...state.posts, newPost],
        loading: false
      }));
  
      if (threadMongo) {
        get().fetchPosts(threadMongo);
      }
    
      return newPost;
    } catch (error) {
      toast.error("Error Creating Post")
      throw error;
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

  isLiked: (postId: string) => get().likedPosts.has(postId),

  fetchComments: async (postId) => {
    if (!postId) return [];
    
    set((state) => ({
      commentsLoading: { ...state.commentsLoading, [postId]: true },
      commentsError: { ...state.commentsError, [postId]: '' }
    }));
    
    try {
      const response = await axiosInstance.get(`/forums/get-comments/${postId}`);
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
      
      const newComment = response.data.comment;
      
      set((state) => {
        const currentPostComments = state.comments[postId] || [];
        return {
          comments: {
            ...state.comments,
            [postId]: [...currentPostComments, newComment]
          }
        };
      });
      
      get().fetchComments(postId);
      
      return newComment;
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },
  
  likeComment: async (commentId, userId) => {
    try {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? {
                    ...comment,
                    likedBy: [...comment.likedBy, userId],
                    disLikedBy: comment.disLikedBy.filter(id => id !== userId)
                  }
                : comment
            )
          ])
        )
      }));
  
      await axiosInstance.put(`/forums/like-comment/${commentId}`);
    } catch (err) {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? {
                    ...comment,
                    likedBy: comment.likedBy.filter(id => id !== userId)
                  }
                : comment
            )
          ])
        )
      }));
      throw err;
    }
  },
  
  dislikeComment: async (commentId, userId) => {
    try {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment =>
              comment._id === commentId
                ? {
                    ...comment,
                    disLikedBy: [...comment.disLikedBy, userId],
                    likedBy: comment.likedBy.filter(id => id !== userId)
                  }
                : comment
            )
          ])
        )
      }));
  
      await axiosInstance.put(`/forums/dislike-comment/${commentId}`);
    } catch (err) {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment =>
              comment._id === commentId
                ? {
                    ...comment,
                    disLikedBy: comment.disLikedBy.filter(id => id !== userId)
                  }
                : comment
            )
          ])
        )
      }));
      throw err;
    }
  },
  
  editComment: async (commentId, weaviateId, content) => {
    try {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? { ...comment, content }
                : comment
            )
          ])
        )
      }));
  
      await axiosInstance.put(`/forums/edit-comment/${commentId}/${weaviateId}`, { content });
    } catch (err) {
      set(state => ({
        comments: Object.fromEntries(
          Object.entries(state.comments).map(([postId, comments]) => [
            postId,
            comments.map(comment => 
              comment._id === commentId
                ? { ...comment, content: comment.content } 
                : comment
            )
          ])
        )
      }));
      throw err;
    }
  },
  
  deleteComment: async (commentId, weaviateId) => {
    try {
      await axiosInstance.delete(`/forums/delete-comment/${commentId}/${weaviateId}`);
      
      const comments = get().comments;
      for (const postId in comments) {
        if (comments[postId].some(comment => comment._id === commentId)) {
          get().fetchComments(postId);
        }
      }
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },

  deleteThread : async (threadId: string) => {
    try {
      await axiosInstance.delete(`/admin/forums/thread/${threadId}`)

    } catch (error) {
      toast.error("Could not delete the thread")
      console.error(error)
    }
  },

  watchThread : async (threadId: string) => {
    try{
      const response = await axiosInstance.put(`/forums/watch-thread/${threadId}`)
      const toastMessage = response.data.msg === "Watched" ? set({ isWatched : true}) : set({  isWatched: false })
      if(typeof(toastMessage) !== "string")
        return
      toast.success(toastMessage)
    }catch(error){
      toast.error("Error in watching/unwatching thread")
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
    try{
      set((state) => ({
        reportLoading: { ...state.reportLoading, [postId]: true}
      }))

      const response = await axiosInstance.put(`/forums/report-post/${postId}`)
      if (response.status === 200) {
        set((state) => {
          const updatedPosts = state.posts.map((post: PostSchema) => {
            if (post._id === postId) {
              return {
                ...post,
                reportedBy: response.data.reportCount > 0 ? 
                  [...(post.reportedBy || []), 'current-user'] : 
                  (post.reportedBy || []).filter(id => id !== 'current-user')
              };
            }
            return post;
          });
          
          return { posts: updatedPosts };
        });
        
        return response.data;
    }
  }catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  } finally {
    set((state) => ({
      reportLoading: { ...state.reportLoading, [postId]: false }
    }));
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
  } catch (err: any) {
    set({
      error: err?.response?.data?.msg || "Something went wrong",
    });
  } finally {
    set({loading: false, error: ""})
  }
},

}));
  