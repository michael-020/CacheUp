import { IMessageData, IMessages, IUser } from "./useChatStore";

export type chatState = {
    messages: IMessages[];
    users: IUser[];
    selectedUser: IUser | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
}

export type chatAction = {
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    setSelectedUser: (selectedUser: IUser | null) => void;
    sendMessage: (messageData: IMessageData) => Promise<void>;
    addIncomingMessage: (message: IMessages) => void;

    subscribeToMessages: () => void;

    unSubscribeFromMessages: () => void;
}