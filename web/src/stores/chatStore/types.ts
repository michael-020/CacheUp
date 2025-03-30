import { IUser } from "@/lib/utils";
import { IMessageData, IMessages } from "./useChatStore";

export type chatState = {
    messages: IMessages[];
    allMessages: IMessages[];
    users: IUser[];
    selectedUser: IUser | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    unReadMessages: IMessages[]
}

export type chatAction = {
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    getAllMessages: () => void;
    setSelectedUser: (selectedUser: IUser | null) => void;
    sendMessage: (messageData: IMessageData) => Promise<void>;
    addIncomingMessage: (message: IMessages) => void;

    subscribeToMessages: () => void;

    unSubscribeFromMessages: () => void;

    getUnReadMessages: () => void;

    markMessagesAsRead: (messageIds: string[]) => void;

    sendNotification: (data: IMessages) => void;
}