import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import UserIcon from "../icons/UserIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";

export const Navbar = () => {
  const { logout, authUser } = useAuthStore()

  return (
    <div className="h-16"> 
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-red-300 shadow">
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
          <button className="p-2 hover:bg-gray-100 rounded-full size-10">
            <img src={authUser?.profileImagePath ? authUser.profileImagePath : "/avatar.png"} alt="Profile" className="w-6 h-6 rounded-full" />
          </button>
          <button 
            onClick={logout}
            className="px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium border border-gray-400"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};