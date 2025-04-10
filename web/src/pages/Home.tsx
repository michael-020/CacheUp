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
      {/* ProfileCard shifted to the right */}
      <div className="absolute left-40 -top-12 hidden lg:block">
        <ProfileCard userInfo={authUser} isOwnProfile={true} />
      </div>

      {/* Feed aligned to the right side */}
      <div className="ml-[1rem]">
        <Feed />
      </div>
    </motion.div>
  );
};
