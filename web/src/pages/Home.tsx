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

      {authUser ? <div>
        <div className="sticky left-40 top-5 hidden lg:block z-20">
        <ProfileCard userInfo={authUser} isOwnProfile={true} />
      </div>
      

      <div className="ml-0 lg:ml-[1rem] pb-36 md:pb-36 lg:pb-20 -z-10">
        <Feed />
      </div>
      {authUser &&
        <div className="absolute right-2 top-24 hidden lg:block">
          <FriendSuggestions />
        </div>
      }
      </div>: <div className='translate-y-[50vh]'>
        <SignInNavigation />  
      </div>}

      
    </motion.div>
  );
};