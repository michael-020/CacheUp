import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';

export const Home = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let url = "/user/viewProfile";
        const response = await axiosInstance(url);
        setUserInfo(response.data.userInfo);
      } catch (e) {
        console.error("Error fetching profile", e);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="relative px-8">
      {/* ProfileCard shifted to the right */}
      <div className="absolute left-40 -top-12 ">
        <ProfileCard user={userInfo} isOwnProfile={true} />
      </div>

      {/* Feed aligned to the right side */}
      <div className="ml-[1rem]">
        <Feed />
      </div>
    </div>
  );
};
