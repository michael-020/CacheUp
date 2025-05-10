import { useCallback, useEffect, useState } from "react";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, RefreshCw, X, Check, Users } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { IUser} from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce"; // Add this import

interface UserData {
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
}

interface UsersListProps {
  searchTerm: string;
}

const UsersList = ({ searchTerm }: UsersListProps) => {
  const { sendRequest, cancelRequest, friends, sentRequests } = useFriendsStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingUsers, setProcessingUsers] = useState<string[]>([]);
  const { authUser: currentUser } = useAuthStore();
  const debouncedSearchTerm = useDebounce(searchTerm);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const fetchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await axiosInstance.get(`user/friends/search?query=${encodeURIComponent(query)}`);
      
      if (res.data && res.data.users) {
        const users = res.data.users as IUser[];
        const formattedUsers = users
          .filter(user => user._id !== currentUser?._id)
          .map(user => ({
            ...user,
            name: user.name || user.username || "User",
            isFriend: friends.some(f => f._id === user._id),
            hasPendingRequest: sentRequests.some(r => r._id === user._id)
          }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to search users. Please try again.");
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, friends, sentRequests]);

  // Update effect to use debounced value
  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchUsers]);

  useEffect(() => {
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        isFriend: friends.some(f => f._id === user._id),
        hasPendingRequest: sentRequests.some(r => r._id === user._id)
      }))
    );
  }, [friends, sentRequests]);

  const handleRequest = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    
    try {
      await sendRequest(userId);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, hasPendingRequest: true } : u
      ));
    } catch (err) {
      setError("Failed to send friend request");
      console.error("Error sending request:", err);
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleCancelRequest = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    
    try {
      await cancelRequest(userId);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, hasPendingRequest: false } : u
      ));
    } catch (err) {
      setError("Failed to cancel request");
      console.error("Error cancelling request:", err);
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className="pl-10 pt-5 w-full md:w-96"></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-500 mb-6 text-center">{error}</p>
        <Button 
          onClick={() => fetchUsers(searchTerm)} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const renderUserCard = (user: UserData) => {
    const isProcessing = processingUsers.includes(user._id);
    
    return (
      <div
        key={user._id}
        className="flex flex-col p-4 bg-white dark:bg-neutral-800 rounded-lg shadow border border-gray-200 dark:border-neutral-700"
      >
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${user._id}`}>
            <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={user.profilePicture || "avatar.jpeg"} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${user._id}`}>
              <h3 className="font-semibold hover:underline cursor-pointer">{user.name}</h3>
            </Link>
            <p className="text-sm text-gray-500">@{user.username}</p>
          </div>
        </div>
        
        <div className="mt-auto">
          {user.hasPendingRequest ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={true}
              >
                <Check className="h-4 w-4 mr-2" />
                Request Sent
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleCancelRequest(user._id)}
                disabled={isProcessing}
              >
                {isProcessing ? 
                  <RefreshCw className="h-4 w-4 animate-spin" /> : 
                  <X className="h-4 w-4" />
                }
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => handleRequest(user._id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 py-12">
      {!searchTerm ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Search for users
          </h3>
          <p className="text-gray-500 mt-1">
            Enter a name or username to find people
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {users.length > 0 ? (
            users.map(renderUserCard)
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500">No users found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersList;