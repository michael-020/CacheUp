import { IUser } from "@/lib/utils";

export interface SearchResultItem {
  type: 'Forum' | 'Thread' | 'Post' | 'Comment';
  data: any;
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
}

export interface ForumActions {
  fetchForums: (isAdminRoute: boolean) => Promise<void>;
  deleteForum: (forumId: string, weaviateId: string) => Promise<void>;
  fetchForumDetails: (forumId: string) => Promise<void>;
  fetchThreads: (forumId: string) => Promise<void>;
  createThread: (
    forumId: string,
    weaviateId: string,
    threadData: { title: string; description: string },
    isAdminRoute: boolean
  ) => Promise<void>;
  searchForums: (query: string) => Promise<void>;
  fetchPosts: (threadId: string) => Promise<void>
  createPost: (threadMongo: string, threadWeaviate: string, content:string) => Promise<void>
  toggleLike: (mongoId: string) => Promise<number | undefined>
  isLiked: (postId: string) => boolean;
}

export type ForumStore = ForumState & ForumActions;