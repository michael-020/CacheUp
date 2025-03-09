import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import UserIcon from "../icons/UserIcon";
import vite from "../../public/vite.svg";

export const Navbar = () => {
  return (
    <div className="h-60">
      <div>
        <nav className="flex items-center justify-between px-6 py-3 bg-red-300 shadow">
          <div className="w-1/4">
            <h1 className="font-extrabold text-3xl text-black">
              CampusConnect
            </h1>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <HomeIcont />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <UserIcon />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MessageIcon />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <SettingsIcon />
            </button>
          </div>

          <div className="w-1/4 flex items-center justify-end space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <img src={vite} alt="Profile" className="w-6 h-6 rounded-full" />
            </button>
            <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium">
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};
