import { create } from "zustand";
import { authAction, authState } from "./types";
import { axiosInstance } from "../../lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";


export const useAuthStore = create<authState & authAction>((set) => ({
    authUser: null,
    isSigningUp: false,
    isSigningIn: false,
    isLoggingOut: false,
    isCheckingAuth: false,
    isVerifying: false,
    inputEmail: null,
    sendingEmail: false,


    signup: async (data) => {
        set({isSigningUp: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            const res = await axiosInstance.post("/user/complete-signup", data)
            set({authUser: res.data})
            toast.success("Account created Successfully")
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

    },

    checkAuth: async () => {
        try {
            // await new Promise(r => setTimeout(r, 2000))
            const res = await axiosInstance.get("/users/check")
            set({authUser: res.data})
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
    }
}))