import { IAdmin, IPost } from "@/lib/utils";

export type AdminStates = {
    authAdmin: IAdmin | null;
    isAdminSigninIn: boolean;
    posts: IPost[] | null;
    isDeletingPost: boolean;
}

export type AdminActions = {
    signin: (data: {adminId: string, password: string}) => void;
    getPosts: () => void;
    deletePost: () => void;
    deleteComment: () => void;
}