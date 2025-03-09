import { create } from 'zustand';
import { PostActions, PostState } from './types';
import { axiosInstance } from '../../lib/axios';

export const usePostStore = create<PostState & PostActions>((set) => ({
  posts: [],
  createPost: async (content, image) => {
    const res = await axiosInstance.post("/post/createPost", {
      content,
      image
    })
  },

  toggleLike: (postId) => {

  },

  toggleSave: (postId) => {

  },
  
  addComment: (postId, content) => {

  }
}));