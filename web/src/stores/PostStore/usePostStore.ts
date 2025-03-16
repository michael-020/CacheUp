import { create } from "zustand";
import { PostActions, PostState } from "./types";
import { axiosInstance } from "../../lib/axios";

export const usePostStore = create<PostState & PostActions>((set) => ({
  posts: [],
  isLoading: false,
  reportedPosts: [],
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
      set({
        error: error.response?.data?.message || "Failed to load posts",
        isLoading: false,
      });
    }
  },

  createPost: async (formData) => {
    try {
      const res = await axiosInstance.post("/post/createPost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        posts: [res.data.post, ...state.posts],
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
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.likes,
                isLiked: !post.isLiked,
                likesCount: res.data.likes.length,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      set({ error: error.response?.data?.message || "Failed to toggle like" });
    }
  },

  toggleSave: async (postId) => {
    try {
      await axiosInstance.put(`/post/save/${postId}`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isSaved: !post.isSaved,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error toggling save:", error);
      set({ error: error.response?.data?.message || "Failed to toggle save" });
    }
  },

  fetchReportedPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/");
      set({ reportedPosts: res.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load reported posts",
        isLoading: false,
      });
    }
  },

  reportPost: async (postId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.put(`/post/reportPost/${postId}`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, ...res.data.post } : post
        ),
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || "Failed to report post" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  unReportPost: async (postId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.put(`/post/unReportPost/${postId}`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, ...res.data.post } : post
        ),
        reportedPosts: state.reportedPosts.filter(
          (post) => post._id !== postId
        ),
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to unreport post",
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // addComment: async (postId, content) => {
  //   try {
  //     const res = await axiosInstance.put(`/post/comment/${postId}`, {
  //       content,
  //     });
  //     set((state) => ({
  //       posts: state.posts.map((post) =>
  //         post._id === postId
  //           ? {
  //               ...post,
  //               comments: [res.data.processedComment, ...post.comments],
  //             }
  //           : post
  //       ),
  //     }));
  //   } catch (error) {
  //     console.error("Error adding comment:", error);
  //     set({ error: error.response?.data?.message || "Failed to add comment" });
  //   }
  // },

  addComment: async (postId, content) => {
    try {
      const res = await axiosInstance.put(`/post/comment/${postId}`, { content });
      
      // Ensure response contains complete comment data with user info
      const newComment = res.data.processedComment || res.data.comment;
      
      set((state) => ({
        isLoading: false,
        posts: state.posts.map(post => 
          post._id === postId ? {
            ...post,
            comments: [newComment, ...post.comments]
          } : post
        )
      }));
      
      return newComment;
    } catch (error) { /* Error handling */ }
  },

  deleteComment: async (postId: string, commentId: string) => {
    try {
      await axiosInstance.delete(`/post/comment/${postId}/${commentId}`);

      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error deleting comment:", error);
      set({
        error: error.response?.data?.message || "Failed to delete comment",
      });
      throw error;
    }
  },
  
  updateComment: async (
    postId: string,
    commentId: string,
    newContent: string
  ) => {
    try {
      const res = await axiosInstance.put(
        `/post/comment/${postId}/${commentId}`,
        {
          content: newContent,
        }
      );
      
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? {
            ...post,
            comments: post.comments.map(comment => 
              comment._id === commentId ? {
                ...res.data.updatedComment,
                user: comment.user 
              } : comment
            )
          } : post
        )
      }));
    } catch (error) {
      console.error("Error updating comment:", error);
      set({
        error: error.response?.data?.message || "Failed to update comment",
      });
      throw error;
    }
  },

}));
