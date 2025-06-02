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
import { Users, Mail, UserPlus, UserCheck, UserX, Edit, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore/useChatStore';
import { useFriendsStore } from '@/stores/FriendsStore/useFriendsStore';
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { RemoveFriendModal } from "@/components/modals/RemoveFriendModal";
import { NotFoundPage } from "@/pages/NotFoundPage";

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
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const [mutualFriendsCount, setMutualFriendsCount] = useState(0);
  
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

  const isAdminView = location.pathname.includes("/admin");

  useEffect(() => {
    const validateAndFetchProfile = async () => {
      if (!id) {
        setIsValidUser(true); 
        setIsProfileLoading(true);
        try {
          let url;
          if (isAdminView) {
            url = "/admin/view-profile";
          } else if(authUser) {
            url = "/user/viewProfile";
          }
          if (url) {
            const response = await axiosInstance(url);
            const profileData = response.data.userInfo;
            setUserInfo(profileData);
            setIsOwnProfile(true);
          }
        } catch (e) {
          console.error("Error fetching profile", e);
        } finally {
          setIsProfileLoading(false);
        }
        return;
      }
      
      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        setIsValidUser(false);
        return;
      }
      
      setIsProfileLoading(true);
      try {
        let url;
        if (isAdminView) {
          url = `/admin/view-profile/${id}`;
        } else if(authUser) {
          url = `/user/viewProfile/${id}`;
        } else {
          url = `/user/profile/${id}`;
        }
        
        const response = await axiosInstance(url);
        const profileData = response.data.userInfo;
        
        if (profileData) {
          setUserInfo(profileData);
          setIsValidUser(true);
          const isOwn = response.data.isOwnProfile || 
            (profileData && userId && profileData._id === userId);
          setIsOwnProfile(isOwn);
        } else {
          setIsValidUser(false);
        }
      } catch (e) {
        console.error("Error fetching profile", e);
        setIsValidUser(false);
      } finally {
        setIsProfileLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      if (isValidUser === false) return;
      
      setIsLoading(true);
      try {
        let url;
        if (isAdminView) {
          url = id ? `/admin/view-posts/${id}` : "/admin/view-posts/myPosts";
        } else if(authUser) {
          url = id ? `/post/viewPosts/${id}` : "/post/viewPosts/myPosts";
        } else {
          url = `/post/get-posts/${id}`;
        }
    
        const postResponse = await axiosInstance(url);
        setUserPosts(postResponse.data);
      } catch (e) {
        console.error("Error fetching user posts", e);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMutualFriendsData = async (userId: string) => {
      try {
        await fetchMutualFriends(userId);
        const { mutualFriends } = useFriendsStore.getState();
        const count = mutualFriends && mutualFriends[userId] ? mutualFriends[userId] : 0;
        setMutualFriendsCount(count);
      } catch (error) {
        console.error('Error fetching mutual friends:', error);
        setMutualFriendsCount(0);
      }
    };

    validateAndFetchProfile();
    
    if (isValidUser === true && !isOwnProfile) {
      fetchFriends();
      fetchSentRequests();
      fetchUserPosts();
      if (userInfo?._id) {
        fetchMutualFriendsData(userInfo._id);
      }
    } else if (isValidUser === true && isOwnProfile) {
      fetchUserPosts();
    }
  }, [id, userId, isAdminView, authUser, isValidUser]);

if (isValidUser === null) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
      </div>
    </div>
  );
}

if (isValidUser === false) {
  return <NotFoundPage />;
}
  
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
          className="flex items-center justify-center gap-2 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1"
          onClick={() => setShowRemoveModal(true)}
        >
          <UserCheck className="w-4 h-4 flex-shrink-0" />
          <span>Friend</span>
        </button>
      );
    } else if (isPendingRequest) {
      return (
        <button 
          className={`flex items-center justify-center gap-2 py-2.5 px-6 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1 ${friendLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleFriendRequest}
          disabled={friendLoading}
        >
          <UserX className="w-4 h-4 flex-shrink-0" />
          <span>{friendLoading ? 'Canceling...' : 'Cancel'}</span>
        </button>
      );
    } else {
      return (
        <button 
          className={`flex items-center justify-center gap-2 py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:scale-105 active:scale-95 flex-1 ${friendLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={handleFriendRequest}
          disabled={friendLoading}
        >
          <UserPlus className="w-4 h-4 flex-shrink-0" />
          <span>{friendLoading ? 'Adding...' : 'Add Friend'}</span>
        </button>
      );
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"  
    >
      <div className="container mx-auto px-4 py-8 pt-20 lg:pt-24">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
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
          
          <div className="flex-1 min-w-0">
            {isProfileLoading ? (
              <MobileProfileCardSkeleton />
            ) : userInfo && (
              <div className="lg:hidden mb-6">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-neutral-800/50 overflow-hidden backdrop-blur-sm">
                  
                  <div className="pt-8 pb-6 px-6">
                    <div className="text-center mb-6">
                      <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-white dark:border-neutral-900 shadow-lg mx-auto">
                          <img
                            src={userInfo.profilePicture || '/avatar.jpeg'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {userInfo.name}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        @{userInfo.username}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {userInfo.department && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{userInfo.department}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {userInfo.bio && (
                      <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-3 mb-5">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-center">
                          {userInfo.bio}
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-800/50 dark:to-neutral-700/50 rounded-xl p-4 mb-5">
                      <Link
                        to={isOwnProfile ? "/friends" : `/friends/${userInfo._id}`}
                        className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                      >
                        <div className="text-center hover:scale-105 transition-transform duration-200">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {userInfo.friends?.length || 0}
                              </p>
                            </div>
                          </div>
                          {!isOwnProfile && mutualFriendsCount > 0 && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                              {mutualFriendsCount} {mutualFriendsCount === 1 ? 'mutual friend' : 'mutual friends'}
                            </p>
                          )}
                        </div>
                      </Link>
                    </div>
                    
                    {isOwnProfile ? (
                      <Link to="/edit-profile" className="block">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold rounded-xl shadow-lg shadow-gray-800/25 transition-all duration-200 transform hover:scale-105 active:scale-95">
                          <Edit className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </button>
                      </Link>
                    ) : (
                      <div className="flex gap-3">
                        <Link to="/message" className="flex-1">
                          <button 
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            onClick={() => setSelectedUser(userInfo)}
                          >
                            <Mail className="w-4 h-4" />
                            <span>Message</span>
                          </button>
                        </Link>
                        {renderFriendButton()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-neutral-800/50 overflow-hidden backdrop-blur-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 px-6 py-5 border-b border-gray-200 dark:border-neutral-700">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {isOwnProfile
                    ? isAdminView
                      ? "Admin Dashboard"
                      : "My Posts"
                    : userInfo
                    ? `${userInfo.name}'s ${isAdminView ? "Profile (Admin)" : "Posts"}`
                    : "Posts"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {isLoading ? "Loading posts..." : `${userPosts.length} ${userPosts.length === 1 ? 'post' : 'posts'}`}
                </p>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <PostCardSkeleton />
                ) : userPosts.length > 0 ? (
                  <div className="space-y-6">
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
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-neutral-700 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto text-sm">
                      {isOwnProfile 
                        ? "Share your first post to get started!" 
                        : `${userInfo?.name} hasn't shared any posts yet.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block w-80 flex-shrink-0"></div>
        </div>
      </div>
      
      <RemoveFriendModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onRemove={async () => {
          if (userInfo) await removeFriend(userInfo._id);
        }}
        friendName={userInfo?.name}
      />
    </motion.div>
  );
};