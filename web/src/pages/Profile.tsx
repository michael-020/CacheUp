import PostCard from "@/components/PostCard"
import { ProfileCard } from "@/components/ProfileCard"
import { axiosInstance } from "@/lib/axios"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Post, IUser } from "@/lib/utils"

export const Profile = () => {
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState<IUser>();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { authUser } = useAuthStore();
  const [userPosts, setUserPosts] = useState<Post[]>([]);  
  const userId = authUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let url = id ? `/user/viewProfile/${id}` : "/user/viewProfile";
        const response = await axiosInstance(url);
        setUserInfo(response.data.userInfo);
        setIsOwnProfile(response.data.isOwnProfile ?? response.data.userInfo._id === userId);
      } catch (e) {
        console.error("Error fetching profile", e);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const postResponse = id
          ? await axiosInstance(`/post/viewPosts/${id}`)  
          : await axiosInstance(`/post/viewPosts/myPosts`);
        
        setUserPosts(postResponse.data); 
      } catch (e) {
        console.error("Error fetching user posts", e);
      }
    };

    fetchProfile();
    fetchUserPosts();
  }, [id, userId]);

  return (
    <div className="flex gap-6 p-6 w-full h-screen">
      <div className="w-1/4 h-screen fixed p-6 ">
        <ProfileCard user={userInfo} isOwnProfile={isOwnProfile} />
      </div>
      <div className="bg-white w-3/4 ml-[25%] mt-20 rounded-lg p-4 h-fit">
      <h1 className='text-center text-2xl font-bold'>{isOwnProfile ? "My Posts" : `${userInfo?.name}'s Profile`}</h1>
      {userPosts.length > 0 ? (
          <div className="space-y-4">
            
            {userPosts.map((post) => (
              <PostCard key={post._id} post={post} />

            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts available.</p>
        )}
      </div>
    </div>
  );
};
