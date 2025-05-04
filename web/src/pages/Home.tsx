import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';
import { motion } from "framer-motion"
import { routeVariants } from '@/lib/routeAnimation';
import { Helmet } from 'react-helmet-async';
import FriendSuggestions from '@/components/FriendsSuggestions';

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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left sidebar - Profile Card */}
        <div className="lg:col-span-3 sticky top-5">
          <div className="hidden lg:block">
            <ProfileCard userInfo={authUser} isOwnProfile={true} />
          </div>
        </div>
        
        {/* Middle - Feed */}
        <div className="lg:col-span-6 pb-36 md:pb-36 lg:pb-20">
          <Feed />
        </div>
        
        {/* Right sidebar - Friend Suggestions */}
        <div className="lg:col-span-3 sticky top-5 mt-20">
          <div className="hidden lg:block">
            <FriendSuggestions />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
