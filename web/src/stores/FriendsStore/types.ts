import { IUser } from "@/lib/utils";

export interface FriendsState  {
  friends: IUser[];
  requests: IUser[];
  sentRequests: IUser[];
  loading: boolean;
  // mutualFriends: Record<string, number>;
  };
  
export interface FriendsActions  {
  fetchFriends: () => Promise<void>;
  // fetchSuggestions: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  sendRequest: (receiverId: string) => Promise<void>;
  acceptRequest: (senderId: string) => Promise<void>;
  rejectRequest: (senderId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  // fetchMutualFriends: (userId: string) => Promise<void>;
  cancelRequest: (receiverId: string) => Promise<void>;


  };