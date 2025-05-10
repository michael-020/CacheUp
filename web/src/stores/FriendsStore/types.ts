import { IUser } from "@/lib/utils";

export interface SuggestionUser extends IUser {
  mutualFriends?: number;
  hasPendingRequest?: boolean;
  isPending?: boolean;
}


export interface FriendsState {
  friends: IUser[];
  requests: IUser[];
  sentRequests: IUser[];
  suggestions: SuggestionUser[];
  viewedSuggestions: string[];
  loading: boolean;
  mutualFriends: Record<string, number>;
}

  
export interface FriendsActions  {
  fetchFriends: () => Promise<void>;
  fetchUserFriends: (userId: string) => Promise<IUser[]>
  fetchSuggestions: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  sendRequest: (receiverId: string) => Promise<void>;
  acceptRequest: (senderId: string) => Promise<void>;
  rejectRequest: (senderId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  ignoreSuggestion: (userId: string) => void;
  fetchMutualFriends: (userId: string) => Promise<void>;
  cancelRequest: (receiverId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  refreshSuggestions: () => Promise<void>;


  };