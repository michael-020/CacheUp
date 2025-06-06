import {  Users, Mail, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { IUser } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore/useChatStore';
import { useState, useEffect } from 'react';
import { useFriendsStore } from '@/stores/FriendsStore/useFriendsStore';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore';
import { LoginPromptModal } from "@/components/modals/LoginPromptModal";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { RemoveFriendModal } from "@/components/modals/RemoveFriendModal";

interface ProfileCardProps {
  isOwnProfile: boolean;
  className?: string;
  userInfo: IUser | null,
  isAdmin?: boolean
}

export const ProfileCard = ({ isOwnProfile, className, userInfo, isAdmin }: ProfileCardProps) => {
  const location = useLocation();
  const { setSelectedUser, addUserToContacts } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mutualFriendsCount, setMutualFriendsCount] = useState(0);
  const { authAdmin } = useAdminStore()
  const { 
    friends, 
    sentRequests, 
    sendRequest, 
    cancelRequest, 
    removeFriend, 
    fetchFriends, 
    fetchSentRequests,
    fetchMutualFriends
  } = useFriendsStore();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<'message' | 'friend'>('message');
  const { authUser } = useAuthStore();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  
  useEffect(() => {
    if (!isOwnProfile) {
      fetchFriends();
      fetchSentRequests();
      
      if (userInfo?._id) {
        fetchMutualFriendsData(userInfo._id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnProfile, fetchFriends, fetchSentRequests, userInfo?._id]);

  const fetchMutualFriendsData = async (userId: string) => {
    try {
      await fetchMutualFriends(userId);
      
      const { mutualFriends } = useFriendsStore.getState();
      const count = mutualFriends && mutualFriends[userId] ? mutualFriends[userId] : 0;
      
      setMutualFriendsCount(count);
      console.log("Mutual friends count:", count);
    } catch (error) {
      console.error('Error fetching mutual friends:', error);
      setMutualFriendsCount(0);
    }
  };

  const truncateBio = (bio: string) => {
    if (!bio) return "";
    if (bioExpanded) return bio;
    
    const charLimit = 75;
    if (bio.length <= charLimit) return bio;
    return bio.slice(0, charLimit) + "...";
  };
  
  if (!userInfo) {
    return (
      <div className={`${className || 'absolute lg:w-48 xl:w-64 p-3 overflow-y-auto mt-16 ml-8 z-10'}`}>
        <div className="bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="p-4">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full  p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      className="w-full h-full object-cover"
                      src="/avatar.jpeg"
                      alt="Guest Profile"
                    />
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-gray-800 mb-1 dark:text-gray-300">
                Guest
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { profilePicture, name, username, email, bio, friends: userFriends, _id: userId } = userInfo;
  const shouldRender = (location.pathname.endsWith("/profile") || isOwnProfile || isAdmin) && 
                    location.pathname !== "/" && 
                    location.pathname !== "/home";
  const isFriend = friends?.some(friend => friend._id === userId);
  const isPendingRequest = sentRequests?.some(request => request._id === userId);

  const handleFriendRequest = async () => {
    if (!authUser) {
      setLoginPromptAction('friend');
      setShowLoginPrompt(true);
      return;
    }

    if (isOwnProfile) return;
    
    setIsLoading(true);
    try {
      if (isFriend) {
        await removeFriend(userId);
      } else if (isPendingRequest) {
        await cancelRequest(userId);
      } else {
        await sendRequest(userId);
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!authUser) {
      setLoginPromptAction('message');
      setShowLoginPrompt(true);
      return;
    }
    if (userInfo) {
      setSelectedUser(userInfo);
      addUserToContacts(userInfo);
    }
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;
    
    if (isFriend) {
      return (
        <button
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors"
          onClick={() => setShowRemoveModal(true)}
        >
          <UserCheck className="size-4" /> <span>Friend</span>
        </button>
      );
    } else if (isPendingRequest) {
      return (
        <button 
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors"
          onClick={handleFriendRequest}
          disabled={isLoading}
        >
          <UserX className="size-4" /> <span>{isLoading ? 'Processing...' : 'Cancel Friend Request'}</span>
        </button>
      );
    } else {
      return (
        <button 
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-indigo-500 text-white text-xs font-medium rounded-md hover:bg-indigo-600 transition-colors"
          onClick={handleFriendRequest}
          disabled={isLoading}
        >
          <UserPlus className="size-4" /> <span>{isLoading ? 'Processing...' : 'Add Friend'}</span>
        </button>
      );
    }
  };

  return (
    <div>
    <div className={`${className || 'absolute lg:w-52 xl:w-64 p-3 overflow-y-auto mt-16 ml-8 z-10'}`}>
      <div 
        className={`bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl`}
      > 
        <div className="p-4">
          <h2 className="text-base font-semibold text-center text-gray-800 dark:text-gray-300 mb-3 pb-2 border-b dark:border-gray-300 border-gray-100">
            {isOwnProfile ? "My Profile" : `${name}'s Profile`}
          </h2>
          
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full bg-neutral-200 dark:bg-neutral-600 p-0.5  hover:scale-105 cursor-pointer ">
                <div className="w-full h-full rounded-full overflow-hidden bg-whitetransition-transform duration-300">
                  <Link to="/profile" >
                    <img
                      className="w-full h-full object-cover"
                      src={profilePicture || '/avatar.jpeg'}
                      alt="Profile"
                    />
                  </Link>
                </div>
              </div>
            </div>
            
            <Link to="/profile" >
              <h3 className="text-sm font-bold text-gray-800 mb-1 cursor-pointer  dark:text-gray-300">{name}</h3>
            </Link>
            <Link to="/profile" >
              <p className="text-xs text-gray-500 mb-3 cursor-pointer">@{username}</p>
            </Link>
           
            <div className="p-2 mb-3 rounded-md text-xs text-gray-600 bg-gray-50 border border-gray-100 dark:bg-neutral-700 dark:text-gray-300 dark:border-neutral-800">
              <p className="line-clamp-none">
                {truncateBio(bio || 'No bio available')}
                {bio && bio.length > 77 && !bioExpanded && (
                  <span
                    className="dark:text-neutral-500 text-neutral-400 text-xs cursor-pointer ml-1 hover:underline"
                    onClick={() => setBioExpanded(true)}
                  >
                    See more
                  </span>
                )}
                {bio && bio.length > 77 && bioExpanded && (
                  <span
                    className="dark:text-neutral-500 text-neutral-400 text-xs cursor-pointer ml-1 hover:underline"
                    onClick={() => setBioExpanded(false)}
                  >
                    See less
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex gap-2 mb-3">
              {/* <div className="flex items-center justify-center gap-2 flex-1 p-2 rounded-md bg-blue-50 border border-blue-100 dark:bg-neutral-700 dark:border-neutral-800">
                <Briefcase className="text-blue-500" size={16} />
                <p className="text-sm text-gray-700 dark:text-gray-300">{department}</p>
              </div> */}

              <Link
                to={isOwnProfile ? "/friends" : `/friends/${userId}`}
                className="flex-1 rounded-md bg-indigo-50 border border-indigo-100 dark:bg-neutral-700 dark:border-neutral-800 hover:bg-indigo-100 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
              >
                <div className="flex flex-col p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="text-indigo-500" size={16} />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {userFriends?.length || 0}
                    </p>
                  </div>
                  {!isOwnProfile && mutualFriendsCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {mutualFriendsCount} {mutualFriendsCount === 1 ? 'mutual' : 'mutuals'}
                    </p>
                  )}
                </div>
              </Link>
            </div>
                
            {shouldRender && (
              <div className="mb-3 p-2 rounded-md bg-gray-50 dark:bg-neutral-600 dark:border-gray-500 border border-gray-100">
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                  <span>{email}</span>
                </div>
              </div>
            )}

              <div className="flex flex-col gap-2">
                {isOwnProfile ? (
                  <Link to="/edit-profile" >
                    <button 
                      className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </Link>
                ) : (
                  <div>
                    {!authAdmin && <div className='space-y-3'>
                        <Link to={authUser ? "/message" : "#"}>
                          <button 
                            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
                            onClick={handleMessageClick}
                          >
                            <Mail className='size-4' /> <span>Message</span>
                          </button>
                        </Link>
                        {renderFriendButton()}
                      </div>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title="Sign In Required"
        content={
          loginPromptAction === 'message' 
            ? "Please sign in to send messages."
            : "Please sign in to add friends."
        }
      />
      <RemoveFriendModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onRemove={async () => {
          await removeFriend(userId);
          // No toast here
        }}
        friendName={name}
      />
    </div>
  );
};