import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcont from "../icons/HomeIcon";
import MessageIcon from "../icons/MessageIcon";
import SettingsIcon from "../icons/SettingsIcon";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import { Moon, PlusSquare, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore/useChatStore";
import { MdOutlineForum } from "react-icons/md";
import FriendsIcon from "@/icons/FriendsIcon";
import { useFriendsStore } from "@/stores/FriendsStore/useFriendsStore";
import { useThemeStore } from "@/stores/ThemeStore/useThemeStore";
import Share from "./Share"; // Import the Share component

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }:ModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-md mx-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 z-20"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        {children}
      </div>
    </div>
  );
};

export const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { requests, fetchRequests } = useFriendsStore();
  const { unReadMessages } = useChatStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isForumPath = 
    currentPath === "/forums/get-forums" || 
    /^\/forums\/[^/]+\/[^/]+$/.test(currentPath);
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

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if(!authUser)
    return <div>
      You are not logged in
    </div>;

  return (
    <div className="h-16 z-50 border-b-2"> 
      <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 border-gray-100 border-b-2 dark:bg-neutral-900/80 dark:border-b-2 dark:border-b-neutral-800/50 dark:backdrop-blur-xl bg-white/80 backdrop-blur-md">
        {/* Logo/Title - Always visible */}
        <div className="flex-shrink-0">
          <h1 className="font-extrabold text-xl md:text-3xl text-black dark:text-gray-100">
            <Link to={"/"}>
              CampusConnect
            </Link>
          </h1>
        </div>
        
        {/* Desktop Navigation Icons */}
        <div className="hidden lg:flex items-center justify-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/"}>
              <HomeIcont
                className={`w-6 h-6 ${currentPath === "/" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
              />
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/message"}>
              <MessageIcon
                className={`w-6 h-6 ${currentPath === "/message" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
            {unReadMessages.length > 0 && <div className="bg-red-500 text-white text-[0.7rem] px-1.5 rounded-full absolute top-0 right-1">
                {unReadMessages.length < 99 ? unReadMessages.length : "99+"}
            </div>}
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

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/forums/get-forums"}>
                <MdOutlineForum className={`size-6 ${
                 isForumPath ? "text-blue-500 fill-current" : "text-gray-600"
                }`} />
            </Link>
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
            <Link to={"/settings"}>
              <SettingsIcon
                className={`w-6 h-6 ${currentPath === "/settings" ? "text-blue-500 fill-current" : "text-gray-600"}`}
              />
            </Link>
          </button>
        </div>
        
        {/* Desktop User Controls */}
        <div className="hidden lg:flex items-center justify-end space-x-4">
          <button onClick={handleToggleTheme} className="hover:bg-neutral-200 py-1.5 px-1.5 rounded-md dark:hover:bg-gray-700">
            {
              isDark ? <Sun className="size-5" /> : <Moon className="size-5" />
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

        {/* Mobile Right Controls - Always Visible */}
        <div className="flex lg:hidden items-center space-x-3">
          <button className="hover:-translate-y-0.5 hover:scale-105 p-1.5">
            <Link to={"/profile"}>
              <img src={authUser.profilePicture ? authUser.profilePicture : "/avatar.jpeg"} alt="Profile" className="size-8 rounded-full border" />
            </Link>
          </button>
        </div>

        {/* Mobile Menu - Conditional Rendering */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 py-4 px-4 shadow-lg md:hidden">
            <div className="flex flex-col space-y-4">
              <Link to={"/"} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                <HomeIcont
                  className={`w-6 h-6 ${currentPath === "/" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
                />
                <span className={`${currentPath === "/" ? "text-blue-500" : "text-gray-800 dark:text-gray-200"}`}>Home</span>
              </Link>
              
              <Link to={"/message"} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 relative">
                <MessageIcon
                  className={`w-6 h-6 ${currentPath === "/message" ? "text-blue-500 fill-current" : "text-gray-600"}`}
                />
                <span className={`${currentPath === "/message" ? "text-blue-500" : "text-gray-800 dark:text-gray-200"}`}>Messages</span>
                {unReadMessages.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unReadMessages.length < 99 ? unReadMessages.length : "99+"}
                  </span>
                )}
              </Link>
              
              <Link to={"/friends"} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 relative">
                <FriendsIcon
                  className={`w-6 h-6 ${currentPath === "/friends" ? "text-blue-500 fill-current" : "text-gray-600"}`}
                />
                <span className={`${currentPath === "/friends" ? "text-blue-500" : "text-gray-800 dark:text-gray-200"}`}>Friends</span>
                {requests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {requests.length > 9 ? '9+' : requests.length}
                  </span>
                )}
              </Link>
              
              <Link to={"/forums/get-forums"} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                <MdOutlineForum className={`size-6 ${isForumPath ? "text-blue-500 fill-current" : "text-gray-600"}`} />
                <span className={`${isForumPath ? "text-blue-500" : "text-gray-800 dark:text-gray-200"}`}>Forums</span>
              </Link>
              
              <Link to={"/settings"} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                <SettingsIcon
                  className={`w-6 h-6 ${currentPath === "/settings" ? "text-blue-500 fill-current" : "text-gray-600"}`}
                />
                <span className={`${currentPath === "/settings" ? "text-blue-500" : "text-gray-800 dark:text-gray-200"}`}>Settings</span>
              </Link>
              
              <button 
                onClick={logout}
                className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-center text-gray-800 dark:text-gray-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
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
    /^\/forums\/[^/]+\/[^/]+$/.test(currentPath);
  const [shareOpen, setShareOpen] = useState(false);

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
  
  // State to track screen size
  const [isMobile, setIsMobile] = useState(false);

  // Update screen size state on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close share component when location changes
  useEffect(() => {
    setShareOpen(false);
  }, [location]);

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)}>
        <Share/>
      </Modal>
      
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
        <nav className="flex items-center justify-around h-16">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center w-1/5 h-full ${
              currentPath === "/" ? "text-blue-500 fill-current" : "text-gray-500 dark:text-gray-400 dark:fill-none"
            }`}
          >
              <HomeIcont
                  className={`w-6 h-6 ${currentPath === "/" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
                />
          </Link>

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
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
              shareOpen ? "text-blue-500" : "text-gray-600 dark:text-gray-400"
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

          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
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