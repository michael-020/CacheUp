import { create } from 'zustand';
import { PostActions, PostState } from './types';
import { axiosInstance } from '../../lib/axios';

export const usePostStore = create<PostState & PostActions>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/post/viewPosts/");
      set({ posts: res.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ error: error.response?.data?.message || 'Failed to load posts', isLoading: false });
    }
  },

  // createPost: async (formData) => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const res = await axiosInstance.post("/post/createPost", formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     });
      
  //     set((state) => ({ 
  //       posts: [res.data, ...state.posts],
  //       isLoading: false
  //     }));
  //   } catch (error) {
  //     console.error("Error creating post:", error);
  //     set({ error: error.response?.data?.message || 'Failed to create post', isLoading: false });
  //     throw error;
  //   }
  // },

  createPost: async (formData) => {
    try {
      const res = await axiosInstance.post("/post/createPost", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      set((state) => ({
        posts: [res.data.post, ...state.posts] 
      }));
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },
  
  toggleLike: async (postId) => {
    try {
      const res = await axiosInstance.put(`/post/like/${postId}`);
      set((state) => ({
        posts: state.posts.map(post => post._id === postId ? {
          ...post,
          likes: res.data.likes,
          isLiked: !post.isLiked,
          likesCount: res.data.likes.length
        } : post)
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      set({ error: error.response?.data?.message || 'Failed to toggle like' });
    }
  },

  toggleSave: async (postId) => {
    try {
      await axiosInstance.put(`/post/save/${postId}`);
      set((state) => ({
        posts: state.posts.map(post => post._id === postId ? {
          ...post,
          isSaved: !post.isSaved
        } : post)
      }));
    } catch (error) {
      console.error("Error toggling save:", error);
      set({ error: error.response?.data?.message || 'Failed to toggle save' });
    }
  },
  
  addComment: async (postId, content) => {
    try {
      const res = await axiosInstance.post(`/post/comment/${postId}`, { content });
      set((state) => ({
        posts: state.posts.map(post => post._id === postId ? {
          ...post,
          comments: [res.data, ...post.comments],
         // commentsCount: post.commentsCount + 1
        } : post)
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
      set({ error: error.response?.data?.message || 'Failed to add comment' });
    }
  }
}));