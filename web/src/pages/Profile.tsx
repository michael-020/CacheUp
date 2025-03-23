import PostCard from "@/components/PostCard";
import { ProfileCard } from "@/components/ProfileCard";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Post, IUser } from "@/lib/utils";

export const Profile = () => {
  const { id } = useParams();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { authUser } = useAuthStore();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const userId = authUser?._id;

  const isAdminView = location.pathname.includes("/admin");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let url;
        if (isAdminView) {
          url = id ? `/admin/view-profile/${id}` : "/admin/view-profile";
        } else {
          url = id ? `/user/viewProfile/${id}` : "/user/viewProfile";
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
      }
    };

    const fetchUserPosts = async () => {
      try {
        let url;
        if (isAdminView) {
          url = id ? `/admin/view-posts/${id}` : "/admin/view-posts/myPosts";
        } else {
          url = id ? `/post/viewPosts/${id}` : "/post/viewPosts/myPosts";
        }

        const postResponse = await axiosInstance(url);
        setUserPosts(postResponse.data);
      } catch (e) {
        console.error("Error fetching user posts", e);
      }
    };

    fetchProfile();
    fetchUserPosts();
  }, [id, userId, isAdminView]);

  return (
    <div className="flex gap-6 p-6 w-full h-screen">
      <div className="w-1/4 h-screen fixed p-6 ">
        {userInfo && (
          <ProfileCard
            userInfo={userInfo}
            isOwnProfile={isOwnProfile}
            isAdmin={isAdminView}
          />
        )}
      </div>
      <div className="bg-white w-3/4 ml-[25%] mt-20 rounded-lg p-4 h-fit">
        <h1 className="text-center text-2xl font-bold">
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
        {userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} isAdmin={isAdminView} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts available.</p>
        )}
      </div>
    </div>
  );
};
