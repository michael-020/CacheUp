import { create } from "zustand";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../AuthStore/useAuthStore";
import { chatAction, chatState } from "./types";
import { AxiosError } from "axios";
import { IUser } from "@/lib/utils";
import { ShowCustomMessageToast } from "@/components/Toast/CustomMessageToast";

export interface IMessages {
    _id: string;
    roomId: string;
    sender: string;
    receiver: string;
    content?: string;
    image?: string;
    isRead?: boolean;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IMessageData {
    content?: string;
    image?: string;
}

export const useChatStore = create<chatState & chatAction>((set, get) => ({
    messages: [],
    allMessages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    unReadMessages: [],
    messagesInitialized: false, 
    activeToasts: new Map(),
    isSendingMessage: false,

    getUsers: async () => {
        // Skip if users are already loaded
        if (get().users.length > 0) return;
        
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/previous-chats");
            set({ users: res.data });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        if (!userId) {
            return;
        }
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/chat/${userId}`);
            const messages = res.data.messages as IMessages[] || [];
            set({ messages });

            const currentUserId = useAuthStore.getState().authUser?._id;
            const unreadMessageIds = messages
                .filter(msg => msg.receiver === currentUserId && !msg.isRead)
                .map(msg => msg._id);

            if (unreadMessageIds.length > 0) {
                get().markMessagesAsRead(unreadMessageIds);
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    getAllMessages: async () => {
        // Skip if already initialized
        if (get().messagesInitialized) return;
        
        try {
            const res = await axiosInstance.get(`/messages/get-all-messages`);
            const currentUserId = useAuthStore.getState().authUser?._id;
            const responseMessages = res.data as IMessages[]
            const receivedMessages = responseMessages.filter(msg => msg.receiver === currentUserId);
            set({ allMessages: receivedMessages });
            
            const unreadMessages = receivedMessages.filter(msg => !msg.isRead);
            set({ unReadMessages: unreadMessages, messagesInitialized: true });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } 
    },

    setSelectedUser: (selectedUser: IUser | null) => {
        set({ selectedUser });
        if (selectedUser) {
            get().getMessages(selectedUser._id);
        }
    },

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            return;
        }
        set({isSendingMessage: true})
        try {
            const res = await axiosInstance.post(`/messages/chat/${selectedUser._id}`, messageData);
            const newMessage = res.data.message;

            set({ messages: [...messages, newMessage] });

            return newMessage;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({isSendingMessage: false})
        }
    },

    addIncomingMessage: (message: IMessages) => {
        const { selectedUser, messages, allMessages, unReadMessages } = get();
        const currentUserId = useAuthStore.getState().authUser?._id;
        
        const isIncomingMessage = message.receiver === currentUserId;
        if (!isIncomingMessage) return;

        const isDuplicateInChat = messages.some(msg => 
            msg._id === message._id || 
            (msg.content === message.content && 
             msg.sender === message.sender &&
             msg.receiver === message.receiver &&
             Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
        );
        
        const isDuplicateInAll = allMessages.some(msg => 
            msg._id === message._id || 
            (msg.content === message.content && 
             msg.sender === message.sender &&
             msg.receiver === message.receiver &&
             Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
        );
        
        if (
            selectedUser && 
            message.sender === selectedUser._id &&
            !isDuplicateInChat
        ) {
            set({ messages: [...messages, message] });
            
            if (!message.isRead) {
                get().markMessagesAsRead([message._id]);
            }
        } 
        else if (isIncomingMessage && !isDuplicateInAll) {
            set({ allMessages: [...allMessages, message] });
            
            if (!message.isRead) {
                const isAlreadyInUnread = unReadMessages.some(msg => msg._id === message._id);
                
                if (!isAlreadyInUnread) {
                    const updatedUnreadMessages = [...unReadMessages, message];
                    set({ unReadMessages: updatedUnreadMessages });
                    
                    get().sendNotification(message);
                }
            }
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        
        // Important: Remove existing handler before adding a new one
        socket.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                
                if (type === "ONLINE_USERS") {
                    useAuthStore.getState().onlineUsers = payload;
                } else if (type === "NEW_MESSAGE") {
                    const currentUserId = useAuthStore.getState().authUser?._id;
                    
                    if (payload.receiver === currentUserId) {
                        get().addIncomingMessage(payload);
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };
    },

    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.onmessage = null; 
        }
    },

    getUnReadMessages: async () => {
        try {
            const res = await axiosInstance.get("/messages/get-unread-messages");
            const unreadMessages = res.data as IMessages[];
            set({ unReadMessages: unreadMessages });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } 
    },

    markMessagesAsRead: async (messageIds) => {
        if (!messageIds || messageIds.length === 0) return;
        
        try {
            await axiosInstance.put("/messages/read-message", { messageIds });
            
            set({
                messages: get().messages.map(message => {
                    if (messageIds.includes(message._id)) {
                        return { ...message, isRead: true };
                    }
                    return message;
                })
            });
            
            set({
                allMessages: get().allMessages.map(message => {
                    if (messageIds.includes(message._id)) {
                        return { ...message, isRead: true };
                    }
                    return message;
                })
            });
            
            set({
                unReadMessages: get().unReadMessages.filter(
                    message => !messageIds.includes(message._id)
                )
            });
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("Failed to mark messages as read");
            }
        }
    },

    sendNotification: (message) => {        
        if (!message) return;
    
    const sender = get().users.find(user => user._id === message.sender);
    if(!sender?.username)
        return

    const senderName = sender.username;
    
    let displayContent = "sent you a message";
    if (message.content) {
        displayContent = `${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`;
    } else if (message.image) {
        displayContent = "sent you an image";
    }
        
    const toastId = ShowCustomMessageToast({
        sender,
        senderName: senderName,
        message: displayContent,
        imageUrl: sender?.profilePicture,
        duration: 5000,
        onClose: () => {
            if (!message.isRead) {
                get().markMessagesAsRead([message._id]);
            }
            
            const activeToasts = new Map(get().activeToasts);
            if (activeToasts.has(message._id)) {
                activeToasts.delete(message._id);
                set({ activeToasts });
            }
        },
        // Add this new prop that will be passed to ShowCustomMessageToast
        onSelectUser: (user) => {
            // Mark message as read
            if (!message.isRead) {
                get().markMessagesAsRead([message._id]);
            }
            
            // Set selected user - this happens BEFORE navigation via the Link component
            get().setSelectedUser(user);
            
            // Clean up the toast from active toasts
            const activeToasts = new Map(get().activeToasts);
            if (activeToasts.has(message._id)) {
                activeToasts.delete(message._id);
                set({ activeToasts });
            }
        }
    });
    
    const activeToasts = new Map(get().activeToasts);
    activeToasts.set(message._id, toastId);
    set({ activeToasts });
    },

    dismissAllToasts: () => {
        const { activeToasts } = get();
        activeToasts.forEach((toastId: string) => {
            toast.dismiss(toastId);
        });
        set({ activeToasts: new Map() });
    },

    addUserToContacts: (user: IUser) => {
        const { users } = get();
        // Check if user already exists in contacts
        if (!users.some(u => u._id === user._id)) {
            set({ users: [...users, user] });
        }
    }
}))