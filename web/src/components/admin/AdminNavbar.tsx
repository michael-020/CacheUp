import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MdOutlineForum } from "react-icons/md";
import { useAdminStore } from "@/stores/AdminStore/useAdminStore";
import SettingsIcon from "@/icons/SettingsIcon";
import HomeIcont from "@/icons/HomeIcon";
import { useThemeStore } from "@/stores/ThemeStore/useThemeStore";

export const AdminNavbar = () => {
  const { logout, checkAdminAuth } = useAdminStore();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isDark, toggleTheme } = useThemeStore();
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const dotMenuRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const isForumPath = 
    currentPath === "/admin/forums/get-forums" || 
    /^\/admin\/forums\/[^/]+\/[^/]+$/.test(currentPath) ||
    currentPath.startsWith("/admin/forums/search");

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
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  if(!checkAdminAuth) return <div>You are not logged in</div>;

  return (
    <>
      <div className="h-16 z-50 border-b-2"> 
        <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 dark:bg-neutral-900/80 dark:border-b-2 dark:border-b-neutral-800/50 dark:backdrop-blur-xl bg-white/80 backdrop-blur-md">
          {/* Logo/Title - Always visible */}
          <div className="flex-shrink-0">
            <Link to={"/admin/home"}>
              <h1 className="font-extrabold text-xl md:text-3xl text-black dark:text-gray-100">
                CampusConnect
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation Icons */}
          <div className="hidden lg:flex items-center justify-center space-x-4">
            <Link to={"/admin/home"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
                <HomeIcont
                  className={`w-6 h-6 ${currentPath === "/admin/home" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
                />
              </button>
            </Link>

            <Link to={"/admin/forums/get-forums"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
                <MdOutlineForum className={`size-6 ${
                  isForumPath ? "text-blue-500 fill-current" : "text-gray-600"
                }`} />
              </button>
            </Link>

            <Link to={"/admin/settings"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
                <SettingsIcon
                  className={`w-6 h-6 ${currentPath === "/admin/settings" ? "text-blue-500 fill-current" : "text-gray-600"}`}
                />
              </button>
            </Link>
          </div>
          
          {/* Desktop User Controls */}
          <div className="hidden lg:flex items-center justify-end space-x-4">
            <button onClick={handleToggleTheme} className="hover:bg-neutral-200 py-1.5 px-1.5 rounded-md dark:hover:bg-gray-700">
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button className="hover:-translate-y-0.5 hover:scale-105">
              <img src={"/avatar.jpeg"} alt="Profile" className="size-9 rounded-full border" />
            </button>
            <button 
              onClick={logout}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black rounded-lg text-sm font-medium border border-gray-400"
            >
              Logout
            </button>
          </div>

          {/* Mobile Right Controls - Always Visible */}
          <div className="flex lg:hidden items-center space-x-3 relative" ref={dotMenuRef}>
            <button 
              className="hover:-translate-y-0.5 hover:scale-105 p-1.5"
              onClick={() => setDotMenuOpen(!dotMenuOpen)}
            >
              <MoreVertical className="size-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            {/* Dot Menu Dropdown */}
            {dotMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-neutral-700">
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

                <div className="border-t border-gray-200 dark:border-neutral-700"></div>
                
                <button 
                  onClick={() => {
                    setDotMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 z-10 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
          <nav className="flex items-center justify-around h-16">
            <Link to={"/admin/home"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
                <HomeIcont
                  className={`w-6 h-6 ${currentPath === "/admin/home" ? "text-blue-500 fill-current" : "text-gray-600 dark:fill-none"}`}
                />
              </button>
            </Link>

            <Link to={"/admin/forums/get-forums"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 relative hover:-translate-y-0.5 hover:scale-105">
                <MdOutlineForum className={`size-6 ${
                  isForumPath ? "text-blue-500 fill-current" : "text-gray-600"
                }`} />
              </button>
            </Link>

            <Link to={"/admin/settings"}>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 hover:-translate-y-0.5 hover:scale-105">
                <SettingsIcon
                  className={`w-6 h-6 ${currentPath === "/admin/settings" ? "text-blue-500 fill-current" : "text-gray-600"}`}
                />
              </button>
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};