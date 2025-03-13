import { IAdmin, IPost } from "@/lib/utils";

export type AdminStates = {
    authAdmin: IAdmin | null;
    isAdminSigninIn: boolean;
    isAdminCheckingAuth: boolean;
    posts: IPost[] | null;
    isDeletingPost: boolean;
}

export type AdminActions = {
    signin: (data: {adminId: string, password: string}) => void;
    checkAdminAuth: () => void;
    getPosts: () => void;
    deletePost: () => void;
    deleteComment: () => void;
}