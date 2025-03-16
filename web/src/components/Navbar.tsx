import { Link, useLocation, useNavigate } from "react-router-dom";
import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import UserIcon from "../icons/UserIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";

export const Navbar = () => {
  const { logout, authUser } = useAuthStore()
  const location = useLocation()

  if(!authUser)
    return <div>
      You are not logged in
    </div>

  console.log("user image", authUser.profilePicture)

  return (
    <div className="h-16 z-50 border-b-2"> 
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3  bg-white/80 backdrop-blur-md">
        <div className="w-1/4">
          <h1 className="font-extrabold text-3xl text-black">
            <Link to={"/"}>
              CampusConnect
            </Link>
          </h1>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Link to={"/"}>
              <HomeIcont />
            </Link>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Link to={"/profile"}>
              <UserIcon />
            </Link>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Link to={"/message"}>
              <MessageIcon />
            </Link>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Link to={"/settings"}>
              <SettingsIcon />
            </Link>
          </button>
        </div>

        <div className="w-1/4 flex items-center justify-end space-x-4">
          <button className="hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/profile"}>
              <img src={authUser.profilePicture ? authUser.profilePicture : "/avatar.jpeg"} alt="Profile" className="size-9 rounded-full border" />
            </Link>
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