import { create } from 'zustand';
import { PostActions, PostState } from './types';
import { axiosInstance } from '../../lib/axios';

export const usePostStore = create<PostState & PostActions>((set) => ({
  posts: [],
  isFetchingPosts: false,
  reportedPosts: [],
  isUploadingPost: false,
  error: null,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchPosts: async () => {
    set({ isFetchingPosts: true });
    try {
      const res = await axiosInstance.get("/post/viewPosts/");
      set({ posts: res.data});
    } catch (error) {
      console.error("Error fetching posts:", error);
      // set({ error: error.response?.data?.message || 'Failed to load posts', isLoading: false });
      set({ isFetchingPosts: false })
    }
  },
  
  createPost: async (data) => {
    set({isUploadingPost: true})
    try {
      const res = await axiosInstance.post("/post/createPost", data);
      set((state) => ({
        posts: [res.data.post, ...state.posts] 
      }));
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    } finally {
      set({isUploadingPost: false})
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
      // set({ error: error.response?.data?.message || 'Failed to toggle like' });
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
      // set({ error: error.response?.data?.message || 'Failed to toggle save' });
    }
  },
  

  fetchReportedPosts: async () => {

    try {
      const res = await axiosInstance.get("/");
      set({ reportedPosts: res.data });
    } catch (error) {
      // set({ 
      //   error: error.response?.data?.message || 'Failed to load reported posts',
      //   isLoading: false 
      // });
    }
  },

  reportPost: async (postId) => {
    try {

      const res = await axiosInstance.put(`/post/reportPost/${postId}`);
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? { ...post, ...res.data.post } : post
        )
      }));
    } catch (error) {
      // set({ error: error.response?.data?.message || 'Failed to report post' });

    } finally {

    }
  },

  unReportPost: async (postId) => {
    try {

      const res = await axiosInstance.put(`/post/unReportPost/${postId}`);
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? { ...post, ...res.data.post } : post
        ),
        reportedPosts: state.reportedPosts.filter(post => post._id !== postId)
      }));
    } catch (error) {
      // set({ error: error.response?.data?.message || 'Failed to unreport post' });
      throw error;
    } finally {

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
      // set({ error: error.response?.data?.message || 'Failed to add comment' });
    }
  }
}));