import { IAdmin, Post,IUser } from "@/lib/utils";

export type AdminStates = {
    authAdmin: IAdmin | null;
    isAdminSigninIn: boolean;
    isAdminCheckingAuth: boolean;
    isLoggingOut: boolean;
    posts: Post[];
    isDeletingPost: boolean;
    userList: IUser[];
    isFetchingUsers: boolean;
    userError: string | null;
    isGettingReportedPosts: boolean;
    reportedPosts: Post[];
    isDeletingReportedPost: boolean;
    isCreatingForum: boolean;
}

export type AdminActions = {
    signin: (data: {adminId: string, password: string}) => void;
    checkAdminAuth: () => void;
    logout: () => void;
    getPosts: () => void;
    adminDeleteComment: ({ postId, commentId }: { postId: string, commentId: string }) => Promise<void>;
    deletePost: ({ postId }: { postId: string }) => Promise<void>;
    fetchUsers: () => void;
    getReportedPosts: () => void;
    deleteReportedPosts: ({ postId }: { postId: string }) => void;
    createForum: (title: string, description: string) => Promise<void>;
}