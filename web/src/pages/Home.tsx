import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore';
import { motion } from "framer-motion"
import { routeVariants } from '@/lib/routeAnimation';

export const Home = () => {
  const { authUser } = useAuthStore()

  if(!authUser)
    return null;

  return (
    <motion.div  
      className="relative px-8 bg-gray-100 dark:bg-neutral-950 dark:border-neutral-900"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="absolute left-40 top-5 hidden lg:block">
        <ProfileCard userInfo={authUser} isOwnProfile={true} />
      </div>

      <div className="ml-[1rem] pb-36 md:pb-36 lg:pb-20">
        <Feed />
      </div>
    </motion.div>
  );
};
