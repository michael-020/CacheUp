import { Link, useLocation} from "react-router-dom";
import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import UserIcon from "../icons/UserIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore/useChatStore";

export const Navbar = () => {
  const { logout, authUser, checkAuth } = useAuthStore()
  const { unReadMessages, getUnReadMessages } = useChatStore()
  const location = useLocation()
  const currentPath = location.pathname;
  const [dark, setDark] = useState<boolean>()

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
    checkAuth()
    getUnReadMessages()
  }, [checkAuth, getUnReadMessages]);

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
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/"}>
              <HomeIcont
                className={`w-6 h-6 ${
                  currentPath === "/" ? "text-blue-500 fill-current gradient-text" : "text-gray-600 dark:fill-none"
                }`}
              />
            </Link>
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/profile"}>
              <UserIcon
                className={`w-6 h-6 ${
                  currentPath === '/profile' ? "text-blue-500 fill-current" : "text-gray-600"
                }`}
              />
            </Link>
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/message"}>
              <MessageIcon
                className={`w-6 h-6 ${
                  currentPath === "/message" ? "text-blue-500 fill-current" : "text-gray-600"
                }`}
              />
            </Link>
            {unReadMessages.length > 0 && <div className="bg-red-500 text-white text-[0.7rem] px-1.5 rounded-full absolute top-0 right-1">
                {unReadMessages.length < 99 ? unReadMessages.length : "99+"}
            </div>}
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/settings"}>
              <SettingsIcon
                className={`w-6 h-6 ${
                  currentPath === "/settings" ? "text-blue-500 fill-current" : "text-gray-600"
                }`}
              />
            </Link>
          </button>
        </div>
        
        <div className="w-1/4 flex items-center justify-end space-x-4">
          <button onClick={toggleDarkMode} className="hover:bg-neutral-200 py-1.5 px-1.5 rounded-md dark:hover:bg-gray-700">
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
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black rounded-lg text-sm font-medium border border-gray-400"
          >
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};