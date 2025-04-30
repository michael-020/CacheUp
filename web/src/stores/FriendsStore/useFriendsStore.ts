import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { FriendsState, FriendsActions,SuggestionUser } from "./types";
import { AxiosError } from "axios";
import { IUser } from "@/lib/utils";

export const useFriendsStore = create<FriendsState & FriendsActions>((set, get) => ({
  friends: [],
  requests: [],
  sentRequests: [],
  suggestions: [],
  viewedSuggestions: [],
  loading: false,
  mutualFriends: {},

  setLoading: (loading: boolean) => set({ loading }),

  fetchFriends: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ friends: IUser[] }>("/user/friends");
      set({ friends: data.friends || [] });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching friends:", err);
      toast.error(err.response?.data?.message || "Failed to load friends");
    } finally {
      set({ loading: false });
    }
  },

  fetchUserFriends: async (userId: string) => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ friends: IUser[] }>(`/user/friends/${userId}`);
      return data.friends || [];
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching user's friends:", err);
      toast.error(err.response?.data?.message || "Failed to load user's friends");
      return [];
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    try {
      const { data } = await axiosInstance.get<{ friendRequests: IUser[] }>("/user/friends/requests");
      
      const currentRequests = get().requests;
      const newRequests = data.friendRequests || [];
      
      if (JSON.stringify(currentRequests) !== JSON.stringify(newRequests)) {
        set(state => ({
          requests: mergeRequests(state.requests, newRequests)
        }));
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching requests:", err);
      toast.error(err.response?.data?.message || "Failed to load friend requests");
    }
  },

  fetchSentRequests: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ sentRequests: IUser[] }>("/user/friends/sent-requests");
      set({ sentRequests: data.sentRequests || [] });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching sent requests:", err);
      toast.error(err.response?.data?.message || "Failed to load sent requests");
    } finally {
      set({ loading: false });
    }
  },

  fetchSuggestions: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ suggestions: SuggestionUser[] }>("user/friends/suggestions");

      set({ suggestions: data.suggestions || [] });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching suggestions:", err);
      toast.error(err.response?.data?.message || "Failed to load suggestions");
    } finally {
      set({ loading: false });
    }
  },
  

  fetchMutualFriends: async (friendId: string) => {
    try {
      
      const response = await axiosInstance.get(`friends/mutual/${friendId}`);
      
      set(state => ({
        mutualFriends: {
          ...state.mutualFriends,
          [friendId]: response.data.count
        }
      }));
      
      return response.data.count;
    } catch (error) {
      const err = error as AxiosError;
      console.error("Error fetching mutual friends:", err);
      
      set(state => ({
        mutualFriends: {
          ...state.mutualFriends,
          [friendId]: 0
        }
      }));
      
      return 0;
    }
  },

  ignoreSuggestion: (userId: string) => {
    set((state) => ({
      suggestions: state.suggestions.filter(suggestion => suggestion._id !== userId),
      viewedSuggestions: [...state.viewedSuggestions, userId]
    }));
  },

  refreshSuggestions: async () => {
    set({ loading: true });
    try {
      await get().fetchSuggestions();
      toast.success("Suggestions refreshed");
    } finally {
      set({ loading: false });
    }
  },

  sendRequest: async (userId: string) => {
  try {
    set(state => ({
      suggestions: state.suggestions.map(suggestion => 
        suggestion._id === userId 
          ? { ...suggestion, isPending: true } 
          : suggestion
      ),
      sentRequests: [...state.sentRequests, { _id: userId } as IUser]
    }));
    
    await axiosInstance.post("/user/friends/send-request", { receiverId: userId });
    toast.success("Friend request sent");
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    
    set(state => ({
      suggestions: state.suggestions.map(suggestion => 
        suggestion._id === userId 
          ? { ...suggestion, isPending: false } 
          : suggestion
      ),
      sentRequests: state.sentRequests.filter(req => req._id !== userId)
    }));
    
    console.error("Error sending request:", err);
    toast.error(err.response?.data?.message || "Failed to send request");
  }
},

  acceptRequest: async (userId: string) => {
    try {
      set(state => ({
        requests: state.requests.filter(req => req._id !== userId),
        friends: [...state.friends, state.requests.find(req => req._id === userId)!]
      }));
      
      await axiosInstance.post("/user/friends/accept-request", { senderId: userId });
      toast.success("Friend request accepted");
      
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      await Promise.all([get().fetchFriends(), get().fetchRequests()]);
      console.error("Error accepting request:", err);
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  },

  rejectRequest: async (userId: string) => {
    try {
      set(state => ({
        requests: state.requests.filter(req => req._id !== userId)
      }));
      
      await axiosInstance.post("/user/friends/reject-request", { senderId: userId });
      toast.success("Friend request rejected");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      await get().fetchRequests(); // Refetch on error
      console.error("Error rejecting request:", err);
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  },

  cancelRequest: async (userId: string) => {
    try {
      set(state => ({
        sentRequests: state.sentRequests.filter(req => req._id !== userId)
      }));
      
      await axiosInstance.delete("/user/friends/cancel-request", {
        data: { receiverId: userId }
      });
      toast.success("Request canceled");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      await get().fetchSentRequests(); // Refetch on error
      console.error("Error canceling request:", err);
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  },

  removeFriend: async (userId: string) => {
    try {
      set(state => ({
        friends: state.friends.filter(friend => friend._id !== userId)
      }));
      
      await axiosInstance.delete(`/user/friends/remove/${userId}`);
      toast.success("Friend removed");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error removing friend:", err);
      toast.error(err.response?.data?.message || "Failed to remove friend");
      
      await get().fetchFriends();
    }
  }
}));

// Helper function to merge requests smoothly
function mergeRequests(oldRequests: IUser[], newRequests: IUser[]): IUser[] {
  const newRequestIds = new Set(newRequests.map(req => req._id));
  
  // Keep existing requests that are still valid
  const existingValidRequests = oldRequests.filter(req => newRequestIds.has(req._id));
  
  // Add new requests that weren't present before
  const brandNewRequests = newRequests.filter(
    newReq => !oldRequests.some(oldReq => oldReq._id === newReq._id)
  );
  
  return [...existingValidRequests, ...brandNewRequests];
}