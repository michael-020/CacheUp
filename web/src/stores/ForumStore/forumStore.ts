import {create} from 'zustand';
import { axiosInstance } from '@/lib/axios';
import type { ForumStore } from '@/stores/ForumStore/types';
import { AxiosError } from "axios";

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
  error: '',
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

  
  fetchForums: async (isAdminRoute) => {
    set({ loadingForums: true, errorForums: '' });
    try {
      const endpoint = isAdminRoute ? '/admin/get-forums' : '/forums/get-forums';
      const response = await axiosInstance.get(endpoint);
      set({ forums: response.data.allForums || [], loadingForums: false });
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set({ 
        errorForums: error.response?.data?.msg || 'Failed to fetch forums',
        loadingForums: false 
      });
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
      const response = await axiosInstance.get(`/forums/${forumId}`);
      set({ currentForum: { ...get().currentForum, title: response.data.forum.title } });
    } catch (err) {
    //   const error = err as AxiosError<{ msg: string }>;
    //   set({ currentForum: { ...get().currentForum, error: error.response?.data?.msg || 'Failed to fetch forum' } });
    }
  },

  fetchThreads: async (forumId) => {
    set({ currentForum: { ...get().currentForum, loading: true } });
    try {
      const response = await axiosInstance.get(`/forums/get-threads/${forumId}`);
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
      get().fetchThreads(forumId);
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
  fetchPosts: async (threadId: string) => {
    if (!threadId) {
      throw new Error("Thread ID is required");
    }
  
    try {
      const response = await axiosInstance.get(`/forums/get-posts/${threadId}`);
  
      console.log("API Response:", response.data); // Debugging
  
      // ✅ Extract the `posts` array
      const fetchedPosts = response.data.posts || []; 
      const threadTitle = response.data.threadTitle
      const threadDescription = response.data.threadDescription 
      const threadMongo = response.data.threadMongo;
      const threadWeaviate = response.data.threadWeaviate
      set({ 
        posts: fetchedPosts,
        threadTitle: threadTitle,
        threadDescription: threadDescription,
        threadMongo: threadMongo,
        threadWeaviate: threadWeaviate,
        loading: false 
      });
  
      return fetchedPosts; // ✅ Return only the posts array
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  

  // Create a new post in a thread
  createPost: async (threadMongo, threadWeaviate, content) => {
    try {
      set({ loading: true });
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
        setTimeout(() => {
          get().fetchPosts(threadMongo);
        }, 300);
      }
    
      return newPost;
    } catch (error) {
      set({ 
        loading: false,
      });
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
  
}));