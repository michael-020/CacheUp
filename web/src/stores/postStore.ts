import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  author: string;
  username: string;
  likesCount: number;
  comments: Comment[];
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

interface PostState {
  posts: Post[];
  createPost: (content: string, image?: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  createPost: (content, image) => set((state) => ({
    posts: [{
      id: uuidv4(),
      content,
      image,
      author: "Amy",
      username: "@amyjunior",
      likesCount: 0,
      comments: [],
      isLiked: false,
      isSaved: false,
      createdAt: new Date()
    }, ...state.posts]
  })),
  toggleLike: (postId) => set((state) => ({
    posts: state.posts.map(post => post.id === postId ? {
      ...post,
      isLiked: !post.isLiked,
      likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
    } : post)
  })),
  toggleSave: (postId) => set((state) => ({
    posts: state.posts.map(post => post.id === postId ? {
      ...post,
      isSaved: !post.isSaved
    } : post)
  })),
  addComment: (postId, content) => set((state) => ({
    posts: state.posts.map(post => post.id === postId ? {
      ...post,
      comments: [{
        id: uuidv4(),
        author: "Current User", 
        content,
        createdAt: new Date()
      }, ...post.comments]
    } : post)
  }))
}));