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
  currentPage: 1,
  hasMore: true,
  isLoadingMore: false,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  fetchPosts: async (isAdmin = false) => {
    set({ 
      isFetchingPosts: true,
      currentPage: 1 
    });
    
    try {
      let url = "" 
      if(isAdmin){
        url = `/admin/view-posts?page=1&limit=5` 
      } else if(useAuthStore.getState().authUser){
        url = `/post/viewPosts?page=1&limit=5`
      } else {
        url = "/post/get-posts"
      }
      const res = await axiosInstance.get(url);
      const { posts, hasMore } = res.data;
      
      const postsWithLikeStatus = posts.map((post: { isLiked?: boolean }) => {
        return {
          ...post,
          isLiked: post.isLiked !== undefined ? post.isLiked : false
        };
      });
      
      set({ 
        posts: postsWithLikeStatus,
        hasMore,
        isFetchingPosts: false,
        currentPage: 1
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      set({ isFetchingPosts: false });
    }
  },
  
  loadMorePosts: async (isAdmin = false) => {
    const { hasMore, currentPage, isLoadingMore } = get();
    
    if (!hasMore || isLoadingMore) return;
    
    set({ isLoadingMore: true });
    
    try {
      const nextPage = currentPage + 1;
      const url = isAdmin 
        ? `/admin/view-posts?page=${nextPage}&limit=5` 
        : `/post/viewPosts?page=${nextPage}&limit=5`;
        
      const res = await axiosInstance.get(url);
      const { posts, hasMore: morePostsAvailable } = res.data;
      
      const postsWithLikeStatus = posts.map((post: { isLiked?: boolean }) => {
        return {
          ...post,
          isLiked: post.isLiked !== undefined ? post.isLiked : false
        };
      });
      
      set(state => ({ 
        posts: [...state.posts, ...postsWithLikeStatus],
        hasMore: morePostsAvailable,
        currentPage: nextPage,
        isLoadingMore: false
      }));
    } catch (error) {
      console.error("Error loading more posts:", error);
      set({ isLoadingMore: false });
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
  const state = get();
  const originalPost = state.posts.find(p => p._id === postId);
  const originalSavedPost = state.savedPosts.find(p => p._id === postId);
  
  const originalIsSaved = originalPost?.isSaved ?? (originalSavedPost ? true : false);

  try {
    set({
      posts: state.posts.map(post => 
        post._id === postId ? { ...post, isSaved: !originalIsSaved } : post
      ),
      savedPosts: originalIsSaved 
        ? state.savedPosts.filter(post => post._id !== postId)
        : originalSavedPost 
          ? state.savedPosts 
          : originalPost 
            ? [...state.savedPosts, { ...originalPost, isSaved: true }] 
            : state.savedPosts
    });

    if (originalIsSaved) {
      await axiosInstance.delete(`/post/save/${postId}`);
    } else {
      await axiosInstance.post(`/post/save/${postId}`);
      if (!originalSavedPost) {
        await get().fetchSavedPosts();
      }
    }

  } catch (error) {
    set({
      posts: state.posts.map(post => 
        post._id === postId ? { ...post, isSaved: originalIsSaved } : post
      ),
      savedPosts: originalIsSaved 
        ? (originalSavedPost ? [...state.savedPosts, originalSavedPost] : state.savedPosts)
        : state.savedPosts.filter(post => post._id !== postId)
    });
    console.error("Save error:", error);
    throw error;
  }
},


fetchSavedPosts: async () => {
  const state = get();
  
  if (state.isFetchingSavedPosts) return;
  
  set({ isFetchingSavedPosts: true });
  
  try {
    const { data } = await axiosInstance.get("/post/save");
    
    set((currentState) => ({
      savedPosts: data,
      isFetchingSavedPosts: false,
      posts: currentState.posts.map(post => ({
        ...post,
        isSaved: data.some((saved: Post) => saved._id === post._id)
      }))
    }));
    
  } catch (error) {
    console.error("Fetch saved error:", error);
    set({ isFetchingSavedPosts: false });
  }
},

unsavePost: async (postId: string) => {
  const state = get();
  const originalSavedPosts = state.savedPosts;
  
  try {
    set({
      savedPosts: state.savedPosts.filter(post => post._id !== postId),
      posts: state.posts.map(post => 
        post._id === postId ? { ...post, isSaved: false } : post
      )
    });

    await axiosInstance.delete(`/post/save/${postId}`);
    
  } catch (error) {
    set({
      savedPosts: originalSavedPosts,
      posts: state.posts.map(post => 
        post._id === postId ? { ...post, isSaved: true } : post
      )
    });
    console.error("Unsave error:", error);
    throw error;
  }
},

clearSavedPosts: () => set({ savedPosts: [] }),

setSavedPosts: (posts) => set({ savedPosts: posts }),

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

  addComment: async (postId, content) => {
    set({ isUplaodingComment: true });
  
    try {
      const res = await axiosInstance.put(`/post/comment/${postId}`, { content });
      const newComment: Comment = res.data;
      console.log("comments before: ", get().posts[0].comments)
      set((state) => ({
        posts: state.posts.map(post => 
          post._id === postId ? {
            ...post,
            comments: [newComment, ...post.comments]
          } : post
        )
      }));
     
      console.log("comments after: ", get().posts[0].comments)
      toast.success("Comment uploaded successfully");  
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