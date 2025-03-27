import { create } from "zustand";
import { authAction, authState } from "./types";
import { axiosInstance } from "../../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useChatStore } from "../chatStore/useChatStore";
import { HTTP_URL } from "@/lib/utils";

export const useAuthStore = create<authState & authAction>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,
    isLoggingOut: false,
    isCheckingAuth: false,
    isVerifying: false,
    inputEmail: "",
    sendingEmail: false,
    isEditing: false,
    socket: null,
    onlineUsers: [],
    token: "",

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            const res = await axiosInstance.post("/user/complete-signup", data)
            set({authUser: res.data})
            toast.success("Account created Successfully")
            get().connectSocket()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({isSigningUp: false})
        }
    },
    signin: async (data) => {
        set({isSigningIn: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            const res = await axiosInstance.post("/user/signin", data)
            set({authUser: res.data})
            toast.success("Signed In Successfully")
            get().connectSocket()
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({isSigningIn: false})
        }
    },

    logout: async () => {
        set({isLoggingOut: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            await axiosInstance.post("/user/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
        } catch (error) {
            console.error("Error in check auth")
            toast.error("Logging out failed")
            // set({authUser: null})
        }
        finally {
            set({isLoggingOut: false})
        }
    },

    checkAuth: async () => {
        set({isCheckingAuth: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            const res = await axiosInstance.get("/user/check")
            set({authUser: res.data})
            get().connectSocket()
        } catch (error) {
            console.error("Error in check auth")
            set({authUser: null})
        }
        finally {
            set({isCheckingAuth: false})
        }
    },

    sentEmail: async (data) => {
        set({sendingEmail: true})
        try {
            await axiosInstance.post("/user/initiate-signup", data)
            set({inputEmail: data.email})
            toast.success("Email is sent to your account")
        }catch(error){
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }finally{
            set({sendingEmail: false})
        }

    },
    verifyEmail: async (data) => {
        set({isVerifying: true})
        try {
            await axiosInstance.post("/user/verify-otp", data)
            toast.success("Please enter your details")
        }catch (error){
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
        finally{
            set({isVerifying: false})
        }
    },

    editProfile: async(data) => {
        set({isEditing: true})
        try{
            await axiosInstance.put("/user/editProfile", data)
            
            const response = await axiosInstance.get("/user/check"); 
            const updatedUser = response.data;
            
            set({ authUser: updatedUser });
            
            toast.success("Profile updated successfully")
            return updatedUser;
        }catch(error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg);
            } else {
                toast.error("An unexpected error occurred.");
            }
            throw error;
        }finally{
            set({isEditing: false})
        }
    },
    
    fetchCurrentUser: async () => {
        try {
            const response = await axiosInstance.get("/user/check"); 
            const userData = response.data;
            set({ authUser: userData });
            return userData;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg);
            } else {
                toast.error("Failed to fetch user data");
            }
            throw error;
        }
    },

    connectSocket: async () => {
        await get().getToken()
        const { authUser, token } = get();
        if (!authUser || get().socket) return;
        const socket = new WebSocket(`${HTTP_URL}?userId=${authUser._id}&token=${token}`);

        socket.onopen = () => {
            console.log("WebSocket connection established");
            set({ socket });
        };

        socket.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);
    
                switch(type) {
                    case "ONLINE_USERS":
                         // Update the online users in the state
                        set({ onlineUsers: payload });
                        break;
                    case "NEW_MESSAGE":
                        const chatStore = useChatStore.getState();
                        chatStore.addIncomingMessage({
                            _id: Date.now().toString(), // temporary ID
                            content: payload.content,
                            sender: payload.senderId, 
                            receiver: payload.recieverId,
                            roomId: payload.roomId,
                            createdAt: new Date()
                        });

                        break;
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            set({ socket: null });
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    },

    fetchOnlineUsers: () => {

    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
            set({ socket: null });
        }
    },

    getSocket: () => get().socket,

    getToken: async () => {
        const res = await axiosInstance.get("/user/get-token")
        set({token: res.data.token})
    }
}))