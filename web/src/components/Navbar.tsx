import { Link, useLocation, useNavigate } from "react-router-dom";
import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import { Moon, MoreVertical, PlusSquare, Sun} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { MdOutlineForum } from "react-icons/md";
import FriendsIcon from "@/icons/FriendsIcon";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { useThemeStore } from "@/stores/ThemeStore/useThemeStore";
import Share from "./Share"
import { ShareModal } from "./modals/ShareModal";
import { usePostStore } from "@/stores/PostStore/usePostStore";

export const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { requests, fetchRequests } = useFriendsStore();
  const { fetchPosts } = usePostStore()
  const { unReadMessages } = useChatStore();
  const location = useLocation();
  const navigate = useNavigate()
  const currentPath = location.pathname;
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const dotMenuRef = useRef<HTMLDivElement | null>(null);
  const isForumPath = currentPath.startsWith("/forums");
  const { isDark, toggleTheme } = useThemeStore();

  const handleToggleTheme = () => {
    toggleTheme();
    const isDarkNow = !isDark;
    if (isDarkNow) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchRequests, 1000 * 120);
  
    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(interval);
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchRequests]);

  useEffect(() => {
    setDotMenuOpen(false);
  }, [location]);

  // Close dot menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dotMenuRef.current && !dotMenuRef.current.contains(event.target as Node)) {
        setDotMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-16 border-b-2"> 
      <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 py-3 border-gray-100 border-b-2 dark:bg-neutral-900/80 dark:border-b-2 dark:border-b-neutral-800/50 dark:backdrop-blur-xl bg-white/80 backdrop-blur-md">
        {/* Logo/Title - Always visible */}
        <div className="flex-shrink-0">
          <Link to={"/"} onClick={() => fetchPosts()}>
            <div className="flex items-center justify-center select-none translate-x-20">
              <img src="/favicon.svg" className="size-10" />
              <h1 className="font-extrabold text-2xl text-blue-600">
                CacheUp
              </h1>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation Icons */}
        <div className="hidden lg:flex items-center justify-center space-x-4">
          <Link to={"/home"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 ">
              <HomeIcont
                className={`w-6 h-6 ${currentPath === "/home" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
              />
            </button>
          </Link>

          <Link to={"/message"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
              <MessageIcon
                className={`w-6 h-6 ${currentPath === "/message" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
              {unReadMessages.length > 0 && <div className="bg-red-500 text-white text-[0.7rem] px-1.5 rounded-full absolute top-0 right-1">
                {unReadMessages.length < 99 ? unReadMessages.length : "99+"}
            </div>}
            </button>
          </Link>

          <Link to={"/friends"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
              <FriendsIcon
                className={`w-6 h-6 ${currentPath === "/friends" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requests.length > 9 ? '9+' : requests.length}
                </span>
              )}
            </button>
          </Link>

          <Link to={"/forums/get-forums"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
              <MdOutlineForum className={`size-6 ${
                isForumPath ? "text-blue-500 fill-current" : "text-gray-600"
              }`} />
            </button>
          </Link>

          <Link to={"/settings"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
              <SettingsIcon
                className={`w-6 h-6 ${currentPath === "/settings" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
            </button>
          </Link>
        </div>
        
        {/* Desktop User Controls */}
        <div className="hidden lg:flex items-center justify-end space-x-4">
          <button onClick={handleToggleTheme} className="hover:bg-neutral-200 py-1.5 px-1.5 rounded-md dark:hover:bg-gray-700">
            {
              isDark ? <Sun className="size-5" /> : <Moon className="size-5" />
            }
          </button>
          {authUser ?  
          <button className="hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/profile"}>
              <img src={authUser?.profilePicture ? authUser.profilePicture : "/avatar.jpeg"} alt="Profile" className="size-9 rounded-full border" />
            </Link>
          </button>:  
          <button className="cursor-default">
            <img src={"/avatar.jpeg"} alt="Profile" className="size-9 rounded-full border" />
          </button>}
         
          {authUser ?  <button 
            onClick={async () => {
              await logout()
              navigate("/")
            }}
            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black rounded-lg text-sm font-medium border border-gray-400"
          >
            Logout
          </button>:
          <Link to="/signin">
            <button 
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black rounded-lg text-sm font-medium border border-gray-400"
            >
              Sign In
            </button>
           </Link> 
         }
         
        </div>

        {/* Mobile Right Controls - Always Visible */}
        <div className="flex lg:hidden items-center space-x-3 relative" ref={dotMenuRef}>
          <button 
            className=" p-1.5"
            onClick={() => setDotMenuOpen(!dotMenuOpen)}
          >
            <MoreVertical className="size-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Dot Menu Dropdown */}
          {dotMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-neutral-700">
              {authUser ? 
              <Link 
              to="/profile" 
              className="flex items-center px-4 py-2 pt-2.5 hover:bg-gray-100 dark:hover:bg-neutral-700"
              onClick={() => setDotMenuOpen(false)}
            >
              <img 
                src={authUser?.profilePicture ? authUser.profilePicture : "/avatar.jpeg"} 
                alt="Profile" 
                className="size-6 rounded-full mr-2" 
              />
              <span className="text-gray-800 dark:text-gray-200">Profile</span>
            </Link>: 
            <button 
              className="flex items-center px-4 py-2 pt-2.5 "
              onClick={() => setDotMenuOpen(false)}
            >
              <img 
                src={"/avatar.jpeg"} 
                alt="Profile" 
                className="size-6 rounded-full mr-2" 
              />
              <span className="text-gray-800 dark:text-gray-200">Guest</span>
            </button>
            }
              
              
              <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
                onClick={() => setDotMenuOpen(false)}
              >
                <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-800 dark:text-gray-200">Settings</span>
              </Link>
              
              <button 
                onClick={handleToggleTheme} 
                className="w-full flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                {isDark ? 
                  <Sun className="size-5 mr-2" /> : 
                  <Moon className="size-5 mr-2" />
                }
                <span className="text-gray-800 dark:text-gray-200">
                  {isDark ? "Light Mode" : "Dark Mode"}
                </span>
              </button>
              
              <div className="border-t border-gray-200 dark:border-neutral-700 "></div>
              
              {authUser ?
                 <button 
                  onClick={async () => {
                    setDotMenuOpen(false);
                    await logout();
                    navigate("/")
                  }}
                 className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
               >
                 <span>Logout</span>
               </button> : 
                <button 
                onClick={() => {
                  setDotMenuOpen(false);
                  navigate("/signin")
                }}
                className="w-full flex items-center px-4 py-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                <span>Sign In</span>
              </button>
              }
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export const BottomNavigationBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { requests, fetchRequests } = useFriendsStore();
  const { unReadMessages } = useChatStore();
  const isForumPath = 
    currentPath === "/forums/get-forums" || 
    /^\/forums\/[^/]+\/[^/]+$/.test(currentPath) ||
    currentPath.startsWith("/forums/search");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(fetchRequests, 1000 * 12);
  
    const handleVisibilityChange = () => {
      if (document.hidden) clearInterval(interval);
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 

  // Close share component when location changes
  useEffect(() => {
    setShareOpen(false);
  }, [location]);


  return (
    <>
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)}>
        <Share onPostSuccess={() => setShareOpen(false)} />
      </ShareModal>

      <div className="fixed lg:hidden bottom-0 z-10 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
        <nav className="flex items-center justify-around h-16">
          <Link to={"/home"}>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700">
              <HomeIcont
                className={`w-6 h-6 ${currentPath === "/home" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
              />
            </button>
          </Link>
          
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
            <Link to={"/message"}>
              <MessageIcon
                className={`w-6 h-6 ${currentPath === "/message" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
            {unReadMessages.length > 0 && <div className="bg-red-500 text-white text-[0.7rem] px-1.5 rounded-full absolute top-0 right-1">
                {unReadMessages.length < 99 ? unReadMessages.length : "99+"}
            </div>}
          </button>
           {/* Plus button to open Share component */}
           <button 
            onClick={() => setShareOpen(true)}
            className={`flex flex-col items-center justify-center w-1/5 h-full ${
              shareOpen ? "text-blue-500" : "text-gray-600 "
            }`}
          >
            <PlusSquare className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
            <Link to={"/friends"}>
              <FriendsIcon
                className={`w-6 h-6 ${currentPath === "/friends" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requests.length > 9 ? '9+' : requests.length}
                </span>
              )}
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative">
            <Link to={"/forums/get-forums"}>
                <MdOutlineForum className={`size-6 ${
                  isForumPath ? "text-blue-500 fill-current" : "text-gray-600"
                }`} />
            </Link>
          </button>
        </nav>
      </div>
    </>
  );
};