import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { FriendsState, FriendsActions } from "./types";
import { AxiosError } from "axios";
import { IUser } from "@/lib/utils";

export const useFriendsStore = create<FriendsState & FriendsActions>((set, get) => ({
  friends: [],
  requests: [],
  sentRequests: [],
  loading: false,
  mutualFriends: {},

  fetchFriends: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ friends: IUser[] }>("user/friends");
      set({ friends: data.friends || [] });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching friends:", err);
      toast.error(err.response?.data?.message || "Failed to load friends");
    } finally {
      set({ loading: false });
    }
  },

  fetchRequests: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ friendRequests: IUser[] }>("user/friends/requests");
      set({ requests: data.friendRequests || [] });
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error("Error fetching requests:", err);
      toast.error(err.response?.data?.message || "Failed to load friend requests");
    } finally {
      set({ loading: false });
    }
  },


  fetchSentRequests: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get<{ sentRequests: IUser[] }>("user/friends/sent-requests");
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
      const { data } = await axiosInstance.get<{ suggestions: IUser[] }>("user/friends/suggestions");
      set({ friends: data.suggestions || [] });
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
      const { data } = await axiosInstance.get<{ count: number }>(`user/friends/mutual/${friendId}`);
      set(state => ({
        mutualFriends: {
          ...state.mutualFriends,
          [friendId]: data.count || 0
        }
      }));
    } catch (error) {
      const err = error as AxiosError;
      console.error("Error fetching mutual friends:", err);
      set(state => ({
        mutualFriends: {
          ...state.mutualFriends,
          [friendId]: 0
        }
      }));
    }
  },

  sendRequest: async (userId: string) => {
    try {
      // Optimistic update
      set(state => ({
        sentRequests: [...state.sentRequests, { _id: userId } as IUser]
      }));
      
      await axiosInstance.post("user/friends/send-request", { receiverId: userId });
      toast.success("Friend request sent");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      // Rollback optimistic update
      set(state => ({
        sentRequests: state.sentRequests.filter(req => req._id !== userId)
      }));
      console.error("Error sending request:", err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  },

  acceptRequest: async (userId: string) => {
    try {
      // Optimistic updates - already handles UI updates correctly
      set(state => ({
        requests: state.requests.filter(req => req._id !== userId),
        friends: [...state.friends, state.requests.find(req => req._id === userId)!]
      }));
      
      await axiosInstance.post("user/friends/accept-request", { senderId: userId });
      toast.success("Friend request accepted");
      
      // No need to call fetchFriends() here anymore
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      // Need to refetch on error since we can't reliably rollback
      await Promise.all([get().fetchFriends(), get().fetchRequests()]);
      console.error("Error accepting request:", err);
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  },

  rejectRequest: async (userId: string) => {
    try {
      // Optimistic update
      set(state => ({
        requests: state.requests.filter(req => req._id !== userId)
      }));
      
      await axiosInstance.post("user/friends/reject-request", { senderId: userId });
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
      // Optimistic update
      set(state => ({
        sentRequests: state.sentRequests.filter(req => req._id !== userId)
      }));
      
      await axiosInstance.delete("user/friends/cancel-request", {
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
      // Optimistic update
      set(state => ({
        friends: state.friends.filter(friend => friend._id !== userId)
      }));
      
      await axiosInstance.delete(`user/friends/remove/${userId}`);
      toast.success("Friend removed");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      await get().fetchFriends(); // Refetch on error
      console.error("Error removing friend:", err);
      toast.error(err.response?.data?.message || "Failed to remove friend");
    }
  }
}));