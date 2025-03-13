import {Feed} from '../components/feeds/Feed'

export const Home = () => {
  return (
    <div className="min-h-screen bg-red-300">
      <div className="flex"> 
        <div className="lg:ml-[21rem]"> 
          <Feed />
        </div>
      </div>
    </div>
  );
};
