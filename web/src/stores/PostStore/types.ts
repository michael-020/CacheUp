import { Post } from "../../lib/utils";

export interface PostState {
  posts: Post[];
}

export interface PostActions {
  createPost: (content: string, image?: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
}