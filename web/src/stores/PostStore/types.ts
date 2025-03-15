import { Post } from "../../lib/utils";

export interface PostState {
  posts: Post[];
  reportedPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

export interface PostActions {
  createPost: (formData: FormData) => Promise<void>;
  fetchPosts: () => Promise<void>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  fetchReportedPosts: () => Promise<void>;
  reportPost: (postId: string) => Promise<void>;
  unReportPost: (postId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}