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
    inputEmail: "",
    sendingEmail: false,
    isEditing: false,

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
        set({isLoggingOut: true})
        try {
            // await new Promise(r => setTimeout(r, 2000))
            await axiosInstance.post("/user/logout")
            set({authUser: null})
            toast.success("Logged out successfully")
            window.location.href = "/signin";
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
    }
}))