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
}

export type AdminActions = {
    signin: (data: {adminId: string, password: string}) => void;
    checkAdminAuth: () => void;
    logout: () => void;
    getPosts: () => void;
    deletePost: (data: {id: string}) => void;
    deleteComment: () => void;
    fetchUsers: () => Promise<void>;
}