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
    sender: any;
    receiver?: string;
    content?: string;
    image?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface IMessageData {
    content: string;
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
            // await new Promise(e => setTimeout(e, 1000))
            const res = await axiosInstance.get("/users/usernames");
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
            // toast.error("User ID is required to fetch messages");
            return;
        }
        set({ isMessagesLoading: true });
        try {
            await new Promise(e => setTimeout(e, 1000))
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data.messages });
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

    setSelectedUser: (selectedUser: IUser | null) => set({ selectedUser }),

    sendMessage: async (messageData: IMessageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            // toast.error("No user selected");
            return;
        }
        try {
            const res = await axiosInstance.post(`/messages/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data.message] });

            const socket = useAuthStore.getState().socket;
            if (socket) {
              socket.send(
                JSON.stringify({
                  type: "SEND_MESSAGE",
                  payload: res.data,
                })
              );
            }
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    },

    addIncomingMessage: (message: IMessages) => {
        // set((state) => ({
        //     messages: [...state.messages, message],
        // }));
        const { selectedUser } = get();
        if (selectedUser && message.sender === selectedUser._id) {
            set((state) => ({
                messages: [...state.messages, message]
            }));
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.onmessage = (event) => {
            const { type, payload } = JSON.parse(event.data);

            if (type === "NEW_MESSAGE" && payload.sender === selectedUser._id) {
                const isMessageSentFromSelectedUser = payload.sender === selectedUser._id;
                if (!isMessageSentFromSelectedUser) return;

                set({ messages: [...get().messages, payload] });
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
