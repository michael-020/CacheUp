import { IAdmin, Post } from "@/lib/utils";

export type AdminStates = {
    authAdmin: IAdmin | null;
    isAdminSigninIn: boolean;
    isAdminCheckingAuth: boolean;
    isLoggingOut: boolean;
    posts: Post[];
    isDeletingPost: boolean;
}

export type AdminActions = {
    signin: (data: {adminId: string, password: string}) => void;
    checkAdminAuth: () => void;
    logout: () => void;
    getPosts: () => void;
    deletePost: () => void;
    deleteComment: () => void;
}