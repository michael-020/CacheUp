import { ProfileCard } from '@/components/ProfileCard';
import { Feed } from '../components/feeds/Feed';

export const Home = () => {

  return (
    <div className="relative px-8">
      {/* ProfileCard shifted to the right */}
      <div className="absolute left-40 -top-12 ">
        <ProfileCard isOwnProfile={true} />
      </div>

      {/* Feed aligned to the right side */}
      <div className="ml-[1rem]">
        <Feed />
      </div>
    </div>
  );
};
