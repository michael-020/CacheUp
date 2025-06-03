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
    authChecked: false,
    isSettingUp: false,
    otpSent: false,

    signup: async (data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/user/complete-signup", data)
            set({authUser: res.data})
            toast.success("Account created Successfully")
            // Only connect socket once after successful signup
            await get().getToken()
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
            const res = await axiosInstance.post("/user/signin", data)
            set({authUser: res.data})
            toast.success("Signed In Successfully")
            // Only connect socket once after successful signin
            await get().getToken()
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

    handleGoogleSignin: () => {
        // Remove error checking from here and just handle the redirect
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/signin`;
    },

    handleGoogleSignup: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/signup`;
    },

    // Add new function to handle Google auth errors
    handleGoogleAuthError: () => {
        const searchParams = new URLSearchParams(window.location.search);
        const error = searchParams.get('error');
        
        if (error === 'email_exists') {
            toast.error("An account with this email already exists. Please sign in.");
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }
        
        if (error === 'oauth_failed') {
            toast.error("Failed to authenticate with Google. Please try again.");
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }

        if(error === "no_account"){
            toast.error("An account with this email doesn't exist. Please sign up.")
            window.history.replaceState({}, '', window.location.pathname);
            return true;
        }

        return false;
    },

    logout: async () => {
        set({isLoggingOut: true})
        try {
            await new Promise(r => setTimeout(r, 3000))
            await axiosInstance.post("/user/logout")
            // Disconnect socket before clearing auth user
            get().disconnectSocket()
            set({authUser: null, token: ""})
            toast.success("Logged out successfully")
        } catch (error) {
            console.error("Error in logout", error)
            toast.error("Logging out failed")
        } finally {
            set({isLoggingOut: false})
        }
    },

    checkAuth: async () => {
        // Only check auth once per session
        if (get().authChecked) return;
        
        set({isCheckingAuth: true})
        try {
            const res = await axiosInstance.get("/user/check")
            set({authUser: res.data})
            
            // Get token and connect socket only if not already connected
            if (res.data && !get().socket) {
                await get().getToken()
                get().connectSocket()
            }
        } catch (error) {
            console.error("Error in check auth", error)
            set({authUser: null})
        } finally {
            set({isCheckingAuth: false, authChecked: true})
        }
    },

    sentEmail: async (data) => {
        set({sendingEmail: true})
        try {
            await axiosInstance.post("/user/initiate-signup", data)
            set({ otpSent: true })
            toast.success("OTP is sent to your account")
        } catch(error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            set({sendingEmail: false})
        }
    },
    
    verifyEmail: async (data) => {
        set({isVerifying: true})
        try {
            await axiosInstance.post("/user/verify-otp", data)
            set({ 
                inputEmail: data.email,  // Set inputEmail only after successful verification
                otpSent: false  // Reset OTP sent status only on success
            })
            toast.success("Email verification is Successful")
            return true; // Indicate success
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg as string);
            } else {
                toast.error("An unexpected error occurred.");
            }
            throw error; // Re-throw to handle in component
        } finally {
            set({isVerifying: false})
        }
    },

    resetOtpSent: () => {
        set({ otpSent: false })
    },

    editProfile: async(data) => {
        set({isEditing: true})
        try {
            await axiosInstance.put("/user/editProfile", data)
            
            const response = await axiosInstance.get("/user/check"); 
            const updatedUser = response.data;
            
            set({ authUser: updatedUser });
            
            toast.success("Profile updated successfully")
            return updatedUser;
        } catch(error) {
            if (error instanceof AxiosError && error.response?.data?.msg) {
                toast.error(error.response.data.msg);
            } else {
                toast.error("An unexpected error occurred.");
            }
            throw error;
        } finally {
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

    connectSocket: () => {
        const { authUser, token, socket } = get();
        // Only connect if we have a user, token, and no existing socket
        if (!authUser || !token || socket) return;
        
        try {
            const newSocket = new WebSocket(`${HTTP_URL}?userId=${authUser._id}&token=${token}`);

            newSocket.onopen = () => {
                console.log("WebSocket connection established");
                set({ socket: newSocket });
                
                // Only initialize the message handling once
                useChatStore.getState().subscribeToMessages();
            };

            newSocket.onmessage = (event) => {
                try {
                    const { type, payload } = JSON.parse(event.data);
        
                    if (type === "ONLINE_USERS") {
                        // Update the online users in the state
                        set({ onlineUsers: payload });
                    }
                    // Remove NEW_MESSAGE handling from here
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            newSocket.onclose = () => {
                console.log("WebSocket connection closed");
                set({ socket: null });
            };

            newSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (error) {
            console.error("Error establishing WebSocket connection:", error);
        }
    },

    fetchOnlineUsers: () => {
        // Implementation if needed
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            // Remove all event listeners
            socket.onopen = null;
            socket.onmessage = null;
            socket.onclose = null;
            socket.onerror = null;
            
            // Close the connection
            socket.close();
            set({ socket: null });
        }
    },

    getSocket: () => get().socket,

    getToken: async () => {
        // Only get token if we don't have one
        if (!get().token) {
            try {
                const res = await axiosInstance.get("/user/get-token");
                set({token: res.data.token});
            } catch (error) {
                console.error("Failed to get token:", error);
            }
        }
    },

    deleteAccount: async () => {
        try {
            await axiosInstance.delete("/user/delete-account");
            set({authUser: null})
        } catch (error) {
            console.error(error)
        } finally {
            toast.success("Account deleted Successfully!");
        }
    },

    setupGoogleAccount: async (data) => {
        set({ isSettingUp: true });
        try {
          const response = await axiosInstance.post('/user/setup-google-account', data, {
            withCredentials: true
          });
          set({ authUser: response.data });
          toast.success('Account setup complete!');
          await get().getToken();
          get().connectSocket();
        } catch (error) {
          if (error instanceof AxiosError && error.response?.data?.msg) {
            toast.error(error.response.data.msg);
          } else {
            toast.error('Failed to complete setup');
          }
          throw error;
        } finally {
          set({ isSettingUp: false });
        }
      },
      
      checkSetupSession: async () => {
        const response = await axiosInstance.get('/user/check-setup-session', {
          withCredentials: true
        });
        return response.data.email;
      },
}))