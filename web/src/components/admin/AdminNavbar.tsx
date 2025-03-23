import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import HomeIcont from "../../icons/HomeIcon";
import MessageIcon from "../../icons/MessageIcon";
import SettingsIcon from "../../icons/SettingsIcon";
import UserIcon from "../../icons/UserIcon";
import { Link } from "react-router-dom";

export const AdminNavbar = () => {
  const { logout } = useAdminStore()

  return (
    <div className="h-16 z-50"> 
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 backdrop-blur-md shadow">
        <div className="w-1/4">
          <h1 className="font-extrabold text-3xl text-black">
            CampusConnect
          </h1>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Link to={'/admin/home'}>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <HomeIcont />
          </button>
          </Link>
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
          <button className="hover:-translate-y-0.5 hover:scale-105">
            <img src={"/avatar.jpeg"} alt="Profile" className="size-9 rounded-full border" />
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