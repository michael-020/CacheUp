import { IUser } from "@/lib/utils";

export interface SearchResultItem {
  type: 'Forum' | 'Thread' | 'Post' | 'Comment';
  data: string;
  certainty: number;
}

export interface CreatedBy {
  _id: string;
  username: string;
  profilePicture: string
}

export interface SearchResponseData {
  msg: string;
  searchResults: SearchResultItem[];
}

export interface PostSchema {
  _id: string;
  content: string;
  thread: string;
  createdAt: Date;
  createdBy: CreatedBy
  likedBy?: string[];
  disLikedBy?: string[];
  reportedBy?: string[];
  weaviateId: string;
}

export interface Thread {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  weaviateId: string;
  createdBy: IUser;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: Date;
  createdBy: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  likedBy: string[];
  disLikedBy: string[];
  reportedBy: string[];
  weaviateId: string;
}

export interface Forum {
        _id: string;
        title: string;
        description: string;
        createdAt: string;
        isAdmin?: boolean;
        weaviateId: string;
      }

export interface ForumState {
  forums: Forum[];
  currentForum: {
    title: string;
    threads: Thread[];
    loading: boolean;
    error: string;
  };
  loadingForums: boolean;
  errorForums: string;
  loading: boolean;
  error: '';
  searchResult: SearchResponseData
  posts: PostSchema[] ;
  threadTitle: string;
  threadDescription: string;
  threadMongo: string;
  threadWeaviate: string;
  likedPosts: Set<string>;
  comments: {[postId: string]: Comment[]};
  commentsLoading: {[postId: string]: boolean};
  commentsError: {[postId: string]: string};
}

export interface ForumActions {
  fetchForums: (isAdminRoute: boolean) => Promise<void>;
  deleteForum: (forumId: string, weaviateId: string) => Promise<void>;
  editForum: (
    mongoId: string, 
    weaviateId: string, 
    data: { title: string; description: string }
  ) => Promise<void>;
  fetchForumDetails: (forumId: string) => Promise<void>;
  fetchThreads: (forumId: string, isAdminRoute: boolean) => Promise<void>;
  createThread: (
    forumId: string,
    weaviateId: string,
    threadData: { title: string; description: string },
    isAdminRoute: boolean
  ) => Promise<void>;
  searchForums: (query: string) => Promise<void>;
  fetchPosts: (threadId: string, isAdmin?: boolean) => Promise<void>
  createPost: (threadMongo: string, threadWeaviate: string, content:string) => Promise<void>
  toggleLike: (mongoId: string) => Promise<number | undefined>
  isLiked: (postId: string) => boolean;
  fetchComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, postWeaviateId: string, content: string) => Promise<Comment>;
  likeComment: (commentId: string) => Promise<void>;
  dislikeComment: (commentId: string) => Promise<void>;
  editComment: (commentId: string, weaviateId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, weaviateId: string) => Promise<void>;
  deleteThread: (threadId: string) => void;
}

export type ForumStore = ForumState & ForumActions;