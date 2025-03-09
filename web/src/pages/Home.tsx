import {Feed} from '../components/feeds/Feed'

export const Home = () => {
  return (
    <div>
      {/* <Navbar/> */}
      <div className="absolute lg:ml-[21rem] md:top-20">
        <Feed />
      </div>
    </div>
  );
};
