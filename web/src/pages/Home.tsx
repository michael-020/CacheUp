import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';
import { Link } from "react-router-dom";

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

      <div className="fixed right-6 top-6">
          <Link 
            to="/forums/get-forums"
            className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline mt-20"
          >
            Forums
          </Link>
        </div>
    </div>
  );
};
