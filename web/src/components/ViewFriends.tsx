import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { IUser } from "@/lib/utils";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { ArrowLeft, Users, UserCheck, UserPlus, UserX, Search, Mail } from 'lucide-react';
import { useFriendsStore } from '@/stores/FriendsStore/useFriendsStore';
import { useChatStore } from '@/stores/chatStore/useChatStore';
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton"; 

export const ViewFriends = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [friendsList, setFriendsList] = useState<IUser[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { authUser } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const userId = authUser?._id;
  
  const { 
    friends,
    sentRequests,
    sendRequest,
    cancelRequest,
    removeFriend,
    fetchFriends,
    fetchSentRequests
  } = useFriendsStore();
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const url = id ? `/user/viewProfile/${id}` : "/user/viewProfile";
        const response = await axiosInstance(url);
        const profileData = response.data.userInfo;
        setUserInfo(profileData);
        
        const isOwn = response.data.isOwnProfile || 
          (profileData && userId && profileData._id === userId);
        setIsOwnProfile(isOwn);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    const fetchUserFriends = async () => {
      setIsLoading(true);
      try {
        const url = id ? `/user/friends/${id}` : "/user/friends";
        const response = await axiosInstance.get(url);
        setFriendsList(response.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
    fetchUserFriends();
    
    if (!isOwnProfile) {
      fetchFriends();
      fetchSentRequests();
    }
  }, [id, userId, isOwnProfile, fetchFriends, fetchSentRequests]);
  
  const filteredFriends = friendsList.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const isFriend = (friendId: string) => {
    return friends?.some(friend => friend._id === friendId);
  };
  
  const isPendingRequest = (friendId: string) => {
    return sentRequests?.some(request => request._id === friendId);
  };
  
  const handleFriendAction = async (targetUserId: string) => {
    if (isOwnProfile) return;
    
    try {
      if (isFriend(targetUserId)) {
        await removeFriend(targetUserId);
      } else if (isPendingRequest(targetUserId)) {
        await cancelRequest(targetUserId);
      } else {
        await sendRequest(targetUserId);
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };
  
  const renderFriendButton = (targetUserId: string) => {
    if (isOwnProfile || targetUserId === userId) return null;
    
    if (isFriend(targetUserId)) {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-1 px-2 bg-green-500 text-white text-xs font-medium rounded-md cursor-default"
          disabled
        >
          <UserCheck className="size-3" /> <span>Friend</span>
        </button>
      );
    } else if (isPendingRequest(targetUserId)) {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-1 px-2 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
          onClick={() => handleFriendAction(targetUserId)}
        >
          <UserX className="size-3" /> <span>Cancel</span>
        </button>
      );
    } else {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-1 px-2 bg-indigo-500 text-white text-xs font-medium rounded-md hover:bg-indigo-600 transition-colors"
          onClick={() => handleFriendAction(targetUserId)}
        >
          <UserPlus className="size-3" /> <span>Add</span>
        </button>
      );
    }
  };
  
  const FriendSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((item) => (
        <div 
          key={item}
          className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700"
        >
          <div className="flex-shrink-0">
            <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full" />
          </div>
          
          <div className="ml-3 sm:ml-4 flex-grow min-w-0">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-2 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
  
  return (
    <motion.div
      className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-neutral-950 p-4 pt-16 md:pt-24"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors mr-2"
            >
              <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center truncate">
              <Users className="mr-2 text-indigo-500 size-5 sm:size-6 flex-shrink-0" />
              <span className="truncate">
                {userInfo ? 
                  (isOwnProfile ? "My Friends" : `${userInfo.name}'s Friends`) : 
                  "Friends"}
              </span>
              <span className="ml-2 text-base sm:text-lg text-gray-500 dark:text-gray-400 flex-shrink-0">
                ({friendsList.length})
              </span>
            </h1>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="size-4 sm:size-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            />
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FriendSkeleton />
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFriends.map((friend) => (
                <div 
                  key={friend._id}
                  className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700 hover:shadow-md transition-shadow"
                >
                  <Link to={`/profile/${friend._id}`} className="flex-shrink-0">
                    <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900">
                      <img
                        src={friend.profilePicture || '/avatar.jpeg'}
                        alt={friend.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>
                  
                  <div className="ml-3 sm:ml-4 flex-grow min-w-0">
                    <Link to={`/profile/${friend._id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-gray-200 truncate text-sm sm:text-base">
                        {friend.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{friend.username}
                      </p>
                    </Link>
                    {friend.department && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center truncate">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1 flex-shrink-0"></span>
                          <span className="truncate">{friend.department}</span>
                        </span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 ml-2 flex-shrink-0">
                    {friend._id !== userId && (
                      <>
                        <Link to="/message">
                          <button 
                            className="flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-neutral-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                            onClick={() => setSelectedUser(friend)}
                          >
                            <Mail className="size-4" />
                          </button>
                        </Link>
                        <div>{renderFriendButton(friend._id)}</div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="size-12 sm:size-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {searchQuery ? "No friends match your search" : "No friends found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};