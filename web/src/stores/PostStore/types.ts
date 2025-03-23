import { Post } from "../../lib/utils";

export interface PostState {
  posts: Post[];
  reportedPosts: Post[];
  isFetchingPosts: boolean;
  isUploadingPost: boolean;
  isUplaodingComment: boolean;
  isUpdatingComment: boolean;
  isDeletingComment: boolean;
  error: string | null;
  isPostDeleting: boolean;
}

export interface PostActions {
  createPost: (data: {text: string, image: string}) => Promise<void>;
  fetchPosts: () => Promise<void>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  fetchReportedPosts: () => Promise<void>;
  reportPost: (postId: string) => Promise<void>;
  unReportPost: (postId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;

  deletePost: (data: {postId: string}) => Promise<void>;
  
  updateComment: (
    postId: string,
    commentId: string,
    newContent: string
  ) => Promise<void>;
  
  deleteComment: (
    postId: string,
    commentId: string
  ) => Promise<void>;

}

