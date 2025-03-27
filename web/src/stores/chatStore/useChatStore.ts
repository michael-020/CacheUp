import { create } from "zustand";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../AuthStore/useAuthStore";
import { chatAction, chatState } from "./types";
import { AxiosError } from "axios";
import { IUser } from "@/lib/utils";

export interface IMessages {
    _id: string;
    roomId: string;
    sender: string;
    receiver: string;
    content?: string;
    image?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IMessageData {
    content?: string;
    image?: string;
}

export const useChatStore = create<chatState & chatAction>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/user/usernames");
            set({ users: res.data.users });
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
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data.messages || [] });
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

    setSelectedUser: (selectedUser: IUser | null) => {
        set({ selectedUser });
        // Fetch messages for the selected user when they are selected
        if (selectedUser) {
            get().getMessages(selectedUser._id);
        }
    },

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            return;
        }
        try {
            const res = await axiosInstance.post(`/messages/${selectedUser._id}`, messageData);
            const newMessage = res.data.message;

            // Update local messages
            set({ messages: [...messages, newMessage] });

            // Remove the WebSocket send from here since it's handled by the backend
            return newMessage;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    },

    addIncomingMessage: (message: IMessages) => {
        const { selectedUser, messages } = get();
        
        // Check if the message is from or to the selected user
        if (
            selectedUser && 
            (message.sender === selectedUser._id || message.receiver === selectedUser._id)
        ) {
            // Enhanced duplicate check - check content and timestamp within last few seconds
            const isDuplicate = messages.some(msg => 
                msg._id === message._id || 
                (msg.content === message.content && 
                 msg.sender === message.sender &&
                 msg.receiver === message.receiver &&
                 Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000)
            );
            
            if (!isDuplicate) {
                set({
                    messages: [...messages, message]
                });
            }
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === "NEW_MESSAGE") {
                const { selectedUser } = get();
                
                // Check if the message is relevant to the current selected user
                if (
                    selectedUser && 
                    (payload.sender === selectedUser._id || payload.receiver === selectedUser._id)
                ) {
                    get().addIncomingMessage(payload);
                }
            }
        };
    },

    unSubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.onmessage = null; // Clear WebSocket event handler
        }
    }
}));