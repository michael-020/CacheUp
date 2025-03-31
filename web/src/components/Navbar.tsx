import { Link, useLocation} from "react-router-dom";
import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import UserIcon from "../icons/UserIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import FriendsIcon from "@/icons/FriendsIcon";

export const Navbar = () => {
  const { logout, authUser, checkAuth } = useAuthStore();
  const { requests, fetchRequests } = useFriendsStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const [dark, setDark] = useState<boolean>();

  const toggleDarkMode = () => {
    setDark((prevState) => !prevState);
    const newTheme = !dark ? "dark" : "light";
    document.body.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    } else {
      setDark(false);
      document.body.classList.remove("dark");
    }
    checkAuth();
    fetchRequests(); // Fetch friend requests when navbar loads
  }, [checkAuth, fetchRequests]);

  if(!authUser)
    return <div>
      You are not logged in
    </div>

  return (
    <div className="h-16 z-50 border-b-2"> 
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 dark:bg-neutral-900/80 dark:border-b-2 dark:border-b-neutral-800/50 dark:backdrop-blur-xl bg-white/80 backdrop-blur-md">
        <div className="w-1/4">
          <h1 className="font-extrabold text-3xl text-black dark:text-gray-100">
            <Link to={"/"}>
              CampusConnect
            </Link>
          </h1>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
            <Link to={"/"}>
              <HomeIcont
                className={`w-6 h-6 ${currentPath === "/" ? "text-yellow-500 fill-current" : "text-gray-600 dark:fill-none"}`}
              />
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
            <Link to={"/profile"}>
              <UserIcon
                className={`w-6 h-6 ${currentPath === "/profile" ? "text-yellow-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
            <Link to={"/message"}>
              <MessageIcon
                className={`w-6 h-6 ${currentPath === "/message" ? "text-yellow-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
            <Link to={"/friends"}>
              <FriendsIcon
                className={`w-6 h-6 ${currentPath === "/friends" ? "text-yellow-500 fill-current" : "text-gray-600"}`}
              />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requests.length > 9 ? '9+' : requests.length}
                </span>
              )}
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
            <Link to={"/settings"}>
              <SettingsIcon
                className={`w-6 h-6 ${currentPath === "/settings" ? "text-yellow-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
          </button>
        </div>
        
        <div className="w-1/4 flex items-center justify-end space-x-4">
          <button onClick={toggleDarkMode}>
            {
              dark ? <Sun /> : <Moon />
            }
          </button>
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