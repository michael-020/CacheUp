import { IUser } from "@/lib/utils";

export interface SearchResultItem {
  type: 'Forum' | 'Thread' | 'Post' | 'Comment';
  data: any;
  certainty: number;
}

export interface SearchResponseData {
  msg: string;
  searchResults: SearchResultItem[];
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
  loading: boolean,
  error: '',
  searchResult: SearchResponseData
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
}

export type ForumStore = ForumState & ForumActions;