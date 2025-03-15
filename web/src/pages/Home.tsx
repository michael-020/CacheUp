import { ProfileCard } from '@/components/ProfileCard'
import {Feed} from '../components/feeds/Feed'

export const Home = () => {
  return (
    <div className="min-h-screen ">
      <div className='mt-24'>
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
