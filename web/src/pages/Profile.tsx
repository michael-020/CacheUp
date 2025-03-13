import { ProfileCard } from "@/components/ProfileCard"
import { axiosInstance } from "@/lib/axios"
import { useAuthStore } from "@/stores/AuthStore/useAuthStore"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"


export const Profile = () => {
  const { id } = useParams()
  const [userInfo, setUserInfo] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const { authUser } = useAuthStore();
  const userId = authUser?._id

  useEffect(() => {
    const fetchProfile = async() => {
      try{
        let url = '/user/viewProfile';
        if(id) {
          url = `/user/viewProfile/${id}`
        }
        const response = await axiosInstance(url);
        setUserInfo(response.data.userInfo);
        setIsOwnProfile(response.data.isOwnProfile ?? (response.data.userInfo._id === userId));
      }catch(e) {
        console.error(e, "Error fetching posts");
      }
    }
    fetchProfile();
  },[])
  return <div className="h-full w-screen">
    <div className="h-full w-screen ml-10">
      <ProfileCard user={userInfo} isOwnProfile={isOwnProfile} />
    </div>
      
    </div>
  
}
