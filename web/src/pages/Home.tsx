import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';

export const Home = () => {
  const { authUser } = useAuthStore()
  if(!authUser)
    return null;
  
  return (
    <div className="relative px-8 bg-white dark:bg-neutral-950 dark:border-neutral-900">
      {/* ProfileCard shifted to the right */}
      <div className="absolute left-40 -top-12 ">
        <ProfileCard userInfo={authUser} isOwnProfile={true} />
      </div>

      {/* Feed aligned to the right side */}
      <div className="ml-[1rem]">
        <Feed />
      </div>
    </div>
  );
};
