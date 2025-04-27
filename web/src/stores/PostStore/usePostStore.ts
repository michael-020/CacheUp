import { create } from 'zustand';
import { PostActions, PostState } from './types';
import { axiosInstance } from '../../lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Comment, IUser, Post } from '@/lib/utils';
import { useAuthStore } from '../AuthStore/useAuthStore';

export const usePostStore = create<PostState & PostActions>((set,get) => ({
  posts: [],
  isFetchingPosts: false,
  reportedPosts: [],
  isUploadingPost: false,
  isUplaodingComment: false,
  isUpdatingComment: false,
  isDeletingComment: false,
  error: null,
  isPostDeleting: false,
  savedPosts: [],
  isFetchingSavedPosts: false,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchPosts: async (isAdmin) => {
    set({ isFetchingPosts: true });
    try {
      const url = isAdmin ? "/admin/view-posts" : "/post/viewPosts/"
      const res = await axiosInstance.get(url);
      const posts = res.data as Post[]
      const postsWithLikeStatus = posts.map(post  => {
        return {
          ...post,
          isLiked: post.isLiked !== undefined ? post.isLiked : false
        };
      });
      
      set({ posts: postsWithLikeStatus, isFetchingPosts: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ isFetchingPosts: false })
    }
  },
  
  createPost: async (data) => {
    set({isUploadingPost: true})
    try {
      const res = await axiosInstance.post("/post/createPost", data);
      set((state) => ({
        posts: [res.data.post, ...state.posts],
      }));
      toast.success("Post uploaded successfully")
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof AxiosError && error.response?.data?.msg) {
          toast.error(error.response.data.msg as string);
      } else {
          toast.error("An unexpected error occurred.");
      }
    } finally {
      set({isUploadingPost: false})
    }
  },

  toggleLike: async (postId) => {
    try {
      const userId = useAuthStore.getState().authUser?._id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
  
      const res = await axiosInstance.put(`/post/like/${postId}`);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: res.data.likes || [],
                isLiked: res.data.likes.some((id: string) => id === userId),
              }
            : post
        ),
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  },

  toggleSave: async (postId) => {
    const state = get(); // ⬅ moved out
    const originalPost = state.posts.find(p => p._id === postId); // ⬅ moved out
    const originalIsSaved = originalPost?.isSaved ?? false; // ⬅ moved out
  
    try {
      set({
        posts: state.posts.map(post => 
          post._id === postId ? { ...post, isSaved: !originalIsSaved } : post
        ),
        savedPosts: originalIsSaved
          ? state.savedPosts.filter(p => p._id !== postId)
          : [...state.savedPosts, state.posts.find(p => p._id === postId)!]
      });
  
      await (originalIsSaved 
        ? axiosInstance.delete(`/post/save/${postId}`)
        : axiosInstance.post(`/post/save/${postId}`));
  
      const { data } = await axiosInstance.get("/post/save");
      set({
        savedPosts: data,
        posts: state.posts.map(post => ({
          ...post,
          isSaved: data.some((saved: Post) => saved._id === post._id)
        }))
      });
  
    } catch (error) {
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? { ...post, isSaved: originalIsSaved } : post
        ),
        savedPosts: originalIsSaved
          ? [...state.savedPosts, originalPost!]
          : state.savedPosts.filter(p => p._id !== postId)
      }));
      console.error("Save error:", error);
    }
  },
  
  clearSavedPosts: () => set({ savedPosts: [] }),

  
  
  fetchSavedPosts: async () => {
    try {
      const { data } = await axiosInstance.get("/post/save");
      set((state) => ({
        savedPosts: data,
        posts: state.posts.map(post => ({
          ...post,
          isSaved: data.some((saved: Post) => saved._id === post._id)
        }))
      }));
      usePostStore.getState().posts.forEach((p, index) => {
        if (data.some((saved: Post) => saved._id === p._id)) {
          usePostStore.getState().posts[index].isSaved = true;
        }
      });
    } catch (error) {
      console.error("Fetch saved error:", error);
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
      console.error("Fetch saved error:", error);
    }
  },

  reportPost: async (postId) => {
    try {

      const res = await axiosInstance.put(`/post/reportPost/${postId}`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, ...res.data.post } : post
        ),
      }));
    } catch (error) {
      // set({ error: error.response?.data?.message || 'Failed to report post' });
      console.error("Fetch saved error:", error);
    }
  },

  unReportPost: async (postId) => {
    try {

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
      // set({ error: error.response?.data?.message || 'Failed to unreport post' });
      console.error("Fetch saved error:", error);
    } 
  },

  addComment: async (postId, content): Promise<Comment | null> => {
    set({ isUplaodingComment: true });
  
    try {
      const res = await axiosInstance.put(`/post/comment/${postId}`, { content });
      const newComment: Comment = res.data;
  
      set((state) => ({
        isUploadingComment: false,  
        posts: state.posts.map(post => 
          post._id === postId 
            ? { ...post, comments: [ ...post.comments, newComment] }
            : post
        )
      }));
  
      toast.success("Comment uploaded successfully");
      return newComment;
  
    } catch (error) {
      console.error("Error uploading comment:", error);
  
      if (error instanceof AxiosError && error.response?.data?.msg) {
        toast.error(error.response.data.msg as string);
      } else {
        toast.error("An unexpected error occurred.");
      }
  
      return null;
  
    } finally {
      set({ isUplaodingComment: false });  // ✅ Correct key
    }
  }
  ,

  deleteComment: async (postId: string, commentId: string) => {
    set({isDeletingComment: true})
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
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Error deleting comment:", error);
      if (error instanceof AxiosError && error.response?.data?.msg) {
          toast.error(error.response.data.msg as string);
      } else {
          toast.error("An unexpected error occurred.");
      }
    } finally {
      set({isDeletingComment: false})
    }
  },
  
  updateComment: async (
    postId: string,
    commentId: string,
    newContent: string
  ) => {
    set({isUpdatingComment: true})
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
      toast.success("Comment Edited Successfully")
    } catch (error) {
      console.error("Error updating comment:", error);
      if (error instanceof AxiosError && error.response?.data?.msg) {
          toast.error(error.response.data.msg as string);
      } else {
          toast.error("An unexpected error occurred.");
      }
    } finally {
      set({isUpdatingComment: false})
    }
  },

  deletePost: async (data) => {
    set({isPostDeleting: true})
    try {
      await axiosInstance.delete(`/post/deletePost/${data.postId}`);
            set((state) => ({
        posts: state.posts.filter(post => post._id !== data.postId),
      }));
      
      toast.success("Post deleted successfully")
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error instanceof AxiosError && error.response?.data?.msg) {
          toast.error(error.response.data.msg as string);
      } else {
          toast.error("An unexpected error occurred.");
      }
    } finally {
      set({isPostDeleting: false})
    }
  },
  
  getLikedUsers: async (postId: string) => {
    try {
      const response = await axiosInstance.get(`/post/like/${postId}`);
      if (response.data && Array.isArray(response.data.likedUsers)) {
        return response.data.likedUsers.map((user: IUser) => ({
          _id: user._id,
          username: user.username,
          profileImagePath: user.profilePicture || "/avatar.jpeg" 
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching liked users:", error);
      return [];
    }
  }
  
}));