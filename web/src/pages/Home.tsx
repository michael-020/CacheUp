import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';
import { motion } from "framer-motion"
import { routeVariants } from '@/lib/routeAnimation';
import { Helmet } from 'react-helmet-async';
import FriendSuggestions from '@/components/FriendsSuggestions';
import SignInNavigation from '@/components/SignInNavigation';

export const Home = () => {
  const { authUser } = useAuthStore();

  return (
    <motion.div  
      className="relative px-4 sm:px-8 bg-gray-100 dark:bg-neutral-950 dark:border-neutral-900"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <Helmet>
        <title>Home | CacheUp</title>
      </Helmet>

      {authUser ? (
        <div className="max-w-[2000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Sidebar - Profile Card */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-5">
                <ProfileCard userInfo={authUser} isOwnProfile={true} />
              </div>
            </div>

            {/* Main Content - Feed */}
            <div className="col-span-1 lg:col-span-6">
              <Feed />
            </div>

            {/* Right Sidebar - Friend Suggestions */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <FriendSuggestions />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='translate-y-[50vh]'>
          <SignInNavigation />  
        </div>
      )}
    </motion.div>
  );
};