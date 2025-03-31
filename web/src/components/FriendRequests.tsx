import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Check, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";

const FriendRequests = () => {
  const { requests, acceptRequest, rejectRequest, loading, fetchFriends } = useFriendsStore();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format time properly based on timestamps
  const getTimeSince = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffMs = now.getTime() - requestTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return requestTime.toLocaleDateString();
  };

  const handleAccept = async (userId: string) => {
    try {
      // Mark this request as processing
      setProcessingIds(prev => new Set(prev).add(userId));
      
      // Accept the request without page refresh
      await acceptRequest(userId);
      
      // No need to call fetchFriends as the store already handles updates optimistically
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      // Remove from processing state
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // Mark this request as processing
      setProcessingIds(prev => new Set(prev).add(userId));
      
      // Reject without page refresh
      await rejectRequest(userId);
      
      // The store handles removal from the UI optimistically
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      // Remove from processing state
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
        <Bell className="h-6 w-6" />
        Friend Requests ({requests.length})
      </h2> */}

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">No pending requests</h3>
          <p className="text-gray-500 mt-1">When someone sends you a friend request, it will show up here</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((user) => {
            const isProcessing = processingIds.has(user._id);
            
            return (
              <div 
                key={user._id} 
                className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${user._id}`}>
                    <Avatar className="h-14 w-14 border-2 border-purple-100 dark:border-purple-900">
                      <AvatarImage src={user.profilePicture || ""} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link to={`/profile/${user._id}`} className="hover:underline">
                      <h3 className="font-semibold">{user.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm mt-1">
                      <span className="text-xs text-gray-500">
                        {user.department || ""}
                        {user.department && user.graduationYear ? " • " : ""}
                        {user.graduationYear || ""}
                      </span>
                      {/* <div className="flex items-center gap-1 text-gray-400 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{getTimeSince(user.requestTimestamp)}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="default" 
                    className="rounded-full bg-blue-600 hover:bg-blue-700 px-3"
                    onClick={() => handleAccept(user._id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    <span>Accept</span>
                  </Button>

                  <Button 
                    size="sm"
                    variant="outline"
                    className="rounded-full border-gray-300 px-3"
                    onClick={() => handleReject(user._id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></span>
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    <span>Decline</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;