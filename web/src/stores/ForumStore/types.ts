import { IUser } from "@/lib/utils";

export interface ForumRequest {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  requestedBy: IUser;
}

export interface SearchResultItem {
  type: 'Forum' | 'Thread' | 'Post' | 'Comment';
  data: {
    _id: string;
    title?: string;
    content?: string;
    description?: string;
    forum?: string;
    thread?: string;
    post?: string;
    createdAt: Date;
    weaviateId?: string
  };
  certainty: number;
}

export interface ReportStatus {
  [key: string]:boolean
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
  commentsCount: number;
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
  reportedBy?: string[];
  weaviateId: string;
}

export interface Notification {
  _id: string;
  userIds: string[];
  message: string;
  threadId: {
    _id: string;
    title: string;
  };
  postId?: string;
  seenBy: string[];
  createdBy: {
    _id: string;
    username: string;
    id: string;
  } | null;
  createdAt: string;
  __v?: number;
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
  error: string;
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
  isWatched: boolean;
  notifications: Notification[];
  reportLoading: ReportStatus
  requestedForums: ForumRequest[];
  isCreatingPost:boolean;
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
  toggleDislike: (mongoId: string) => Promise<number | undefined>
  isLiked: (postId: string) => boolean;
  fetchComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, postWeaviateId: string, content: string) => Promise<Comment>;
  likeComment: (commentId: string, userId: string) => Promise<void>;
  dislikeComment: (commentId: string, userId: string) => Promise<void>;
  editComment: (commentId: string, weaviateId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string, weaviateId: string) => Promise<void>;
  deleteThread: (threadId: string, weaviateId: string) => void;
  watchThread: (threadId: string) => Promise<void>;
  checkWatchStatus: (threadId: string) => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationRead: (notificationId: string) => Promise<void>
  createForumRequest: (title: string, description: string) => Promise<void>
  reportPost: (postId: string) => Promise<void>
  reportComment: (commentId: string) => Promise<void>
  checkIfPostReported: (post: PostSchema, userId: string) => boolean
  checkIfCommentReported: (comment: Comment, userId: string) => boolean
  fetchRequestedForums: () => Promise<void>;
  deletePost: (postId: string, weaviateId: string, isAdmin?:boolean) => Promise<void>;
  editPost: (mongoId: string, weaviateId: string, content: string) => Promise<void>
  setPosts: (posts: PostSchema[]) => void;
  approveRequest: (id: string) => void;
  denyRequest: (id: string) => void;
}

export type ForumStore = ForumState & ForumActions;