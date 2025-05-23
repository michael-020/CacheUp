import PostCard from "@/components/PostCard";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileCardSkeleton } from "@/components/skeletons/ProfileCardSkeleton";
import { MobileProfileCardSkeleton } from "@/components/skeletons/MobileProfileCardSkeleton";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Post, IUser } from "@/lib/utils";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { Users, Mail, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore/useChatStore';
import { useFriendsStore } from '@/stores/FriendsStore/useFriendsStore';
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

export const Profile = () => {
  const { id } = useParams();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { authUser } = useAuthStore();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const userId = authUser?._id;
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedUser } = useChatStore();
  const [friendLoading, setFriendLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const { 
    friends, 
    sentRequests, 
    sendRequest, 
    cancelRequest, 
    removeFriend, 
    fetchFriends, 
    fetchSentRequests 
  } = useFriendsStore();

  const isAdminView = location.pathname.includes("/admin");

  useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        let url;
        if (isAdminView) {
          url = id ? `/admin/view-profile/${id}` : "/admin/view-profile";
        } else if(authUser) {
          url = id ? `/user/viewProfile/${id}` : "/user/viewProfile";
        } else {
          url = `/user/profile/${id}`
        }
        const response = await axiosInstance(url);
        const profileData = response.data.userInfo;
        setUserInfo(profileData);

        const isOwn =
          response.data.isOwnProfile ||
          (profileData && userId && profileData._id === userId);
        setIsOwnProfile(isOwn);
      } catch (e) {
        console.error("Error fetching profile", e);
      } finally {
        setIsProfileLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      setIsLoading(true);
      try {
        let url;
        if (isAdminView) {
          url = id ? `/admin/view-posts/${id}` : "/admin/view-posts/myPosts";
        } else if(authUser) {
          url = id ? `/post/viewPosts/${id}` : "/post/viewPosts/myPosts";
        } else {
          url = `/post/get-posts/${id}`
        }
    
        const postResponse = await axiosInstance(url);
        setUserPosts(postResponse.data);
      } catch (e) {
        console.error("Error fetching user posts", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchUserPosts();

    if (!isOwnProfile) {
      fetchFriends();
      fetchSentRequests();
    }
  }, [id, userId, isAdminView, isOwnProfile, fetchFriends, fetchSentRequests]);
  
  const handlePostUpdate = (updatedPost: Post) => {
  if (updatedPost._deleted) {
    setUserPosts(prevPosts => 
      prevPosts.filter(post => post._id !== updatedPost._id)
    );
  } else {
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  }
};

  const isFriend = userInfo ? friends?.some(friend => friend._id === userInfo._id) : false;
  const isPendingRequest = userInfo ? sentRequests?.some(request => request._id === userInfo._id) : false;

  const handleFriendRequest = async () => {
    if (isOwnProfile || !userInfo) return;
    
    setFriendLoading(true);
    try {
      if (isFriend) {
        await removeFriend(userInfo._id);
      } else if (isPendingRequest) {
        await cancelRequest(userInfo._id);
      } else {
        await sendRequest(userInfo._id);
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
    } finally {
      setFriendLoading(false);
    }
  };

  const renderFriendButton = () => {
    if (isOwnProfile) return null;
    
    if (isFriend) {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-2 px-4 bg-green-500 text-white text-sm font-medium rounded-md cursor-default w-full"
          disabled
        >
          <UserCheck className="size-4" /> <span>Friend</span>
        </button>
      );
    } else if (isPendingRequest) {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-2 px-4 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors w-full"
          onClick={handleFriendRequest}
          disabled={friendLoading}
        >
          <UserX className="size-4" /> <span>{friendLoading ? '...' : 'Cancel'}</span>
        </button>
      );
    } else {
      return (
        <button 
          className="flex items-center justify-center space-x-1 py-2 px-4 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-colors w-full"
          onClick={handleFriendRequest}
          disabled={friendLoading}
        >
          <UserPlus className="size-4" /> <span>{friendLoading ? '...' : 'Add Friend'}</span>
        </button>
      );
    }
  };

  return (
    <motion.div 
      className="flex gap-6 p-4 w-full min-h-screen bg-gray-50 dark:bg-neutral-950 dark:border-neutral-900 dark:shadow-0 dark:shadow-sm"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"  
    >
      
      <div className="hidden lg:block w-1/4 max-w-xs">
        <div className="sticky top-20">
          {isProfileLoading ? (
            <ProfileCardSkeleton />
          ) : userInfo && (
            <ProfileCard
              userInfo={userInfo}
              isOwnProfile={isOwnProfile}
              isAdmin={isAdminView}
            />
          )}
        </div>
      </div>
      
      <div className="flex-1 max-w-5xl mx-auto translate-y-20 lg:translate-y-20 pb-24 lg:pb-8">
        {isProfileLoading ? (
          <MobileProfileCardSkeleton />
        ) : userInfo && (
          <div className="lg:hidden">
            {/* Mobile (sm) Layout */}
            <div className="sm:hidden bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden">
              <div className="flex flex-col items-center py-4 px-3">
                {/* Compact profile picture */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 mb-3">
                  <img
                    src={userInfo.profilePicture || '/avatar.jpeg'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Name and username - compact */}
                <div className="text-center mb-3">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-300 leading-tight">{userInfo.name}</h3>
                  <p className="text-xs text-gray-500">@{userInfo.username}</p>
                </div>
                
                {/* Bio - shorter on mobile */}
                {userInfo.bio && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-center px-2 line-clamp-2">
                    {userInfo.bio}
                  </p>
                )}
                
                {/* Friends count - inline */}
                <div className="mb-3">
                  <Link
                    to={isOwnProfile ? "/friends" : `/friends/${userInfo._id}`}
                    className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  >
                    <div className="flex items-center cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">
                      <Users className="size-3 text-indigo-500 mr-1" />
                      <span className="text-gray-600 dark:text-gray-400">{userInfo.friends?.length || 0} friends</span>
                    </div>
                  </Link>
                </div>
                
                {/* Action buttons - stacked for very small screens */}
                <div className="w-full px-2 space-y-2">
                  {isOwnProfile ? (
                    <Link to="/edit-profile" className="block">
                      <button className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors">
                        Edit Profile
                      </button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/message" className="block">
                        <button 
                          className="w-full flex items-center justify-center space-x-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
                          onClick={() => setSelectedUser(userInfo)}
                        >
                          <Mail className="size-4" /> <span>Message</span>
                        </button>
                      </Link>
                      <div className="w-full">
                        {renderFriendButton()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Small Desktop/Large Tablet Layout */}
            <div className="hidden sm:block bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden">
              <div className="p-6">
                {/* Header section */}
                <div className="flex items-start space-x-6 mb-4">
                  {/* Profile picture - larger */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700">
                      <img
                        src={userInfo.profilePicture || '/avatar.jpeg'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Profile info and actions */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-300">{userInfo.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">@{userInfo.username}</p>
                        
                        {/* Friends count */}
                        <Link
                          to={isOwnProfile ? "/friends" : `/friends/${userInfo._id}`}
                          className="inline-block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                        >
                          <div className="flex items-center cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <Users className="size-4 text-indigo-500 mr-2" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{userInfo.friends?.length || 0} friends</span>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Action buttons - horizontal */}
                      <div className="flex space-x-3">
                        {isOwnProfile ? (
                          <Link to="/edit-profile">
                            <button className="py-2 px-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors">
                              Edit Profile
                            </button>
                          </Link>
                        ) : (
                          <>
                            <Link to="/message">
                              <button 
                                className="flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors"
                                onClick={() => setSelectedUser(userInfo)}
                              >
                                <Mail className="size-4" /> <span>Message</span>
                              </button>
                            </Link>
                            <div>
                              {renderFriendButton()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bio section */}
                {userInfo.bio && (
                  <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {userInfo.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg shadow-neutral-300 p-6 mb-6 dark:bg-neutral-900 dark:border-neutral-900 dark:shadow-md dark:shadow-neutral-600">
          <h1 className="text-2xl font-bold mb-4">
            {isOwnProfile
              ? isAdminView
                ? "My Admin Dashboard"
                : "My Posts"
              : userInfo
              ? `${userInfo.name}'s ${
                  isAdminView ? "Profile (Admin View)" : "Profile"
                }`
              : "Profile"}
          </h1>
          
          {isLoading ? (
            <PostCardSkeleton />
          ) : userPosts.length > 0 ? (
            <div className="space-y-6 z-50">
              {userPosts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  isAdmin={isAdminView} 
                  onPostUpdate={handlePostUpdate}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No posts available.</p>
          )}
        </div>
      </div>
      
      <div className="hidden lg:block w-1/4 max-w-xs"></div>
    </motion.div>
  );
};