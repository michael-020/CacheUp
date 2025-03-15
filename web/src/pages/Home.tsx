import { ProfileCard } from '@/components/ProfileCard';
import {Feed} from '../components/feeds/Feed'

export const Home = () => {
  return (
    <div className="">
      <div className=''>
       <ProfileCard />
      </div>
     
      <div className="flex"> 
        <div className="lg:ml-[21rem]"> 
          <Feed />
        </div>
      </div>
    </div>
  );
};
