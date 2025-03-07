import { create } from "zustand";
import { authAction, authState } from "./types";
import { AxiosInstance } from "../../lib/axios";


export const useAuthStore = create<authState & authAction>((set) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,
    isLoggingOut: false,

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            const res = await AxiosInstance.post("/user/signup", data)
            set({authUser: res.data})
        } catch (error) {
            
        } finally {
            set({isSigningUp: false})
        }
    },
    signin: async (data) => {

    },
    logout: async () => {

    },
}))