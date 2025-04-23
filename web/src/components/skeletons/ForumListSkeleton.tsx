import React from "react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/forums/search-bar";
import { routeVariants } from "@/lib/routeAnimation";
import { useLocation, Link } from "react-router-dom";

const ForumListSkeleton: React.FC = () => {
  const skeletonCards = Array(6).fill(0);
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin");

  return (
    <motion.div 
      className="h-full pb-[26rem] md:pb-48 lg:pb-20 dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-6xl mx-auto p-6 translate-y-20 min-h-[calc(100vh-5.1rem)] h-[calc(100vh-6rem)]">
        {/* Title area with conditional admin buttons */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isAdminRoute ? "Forums Section (Admin View)" : "Forums Section"}
          </h1>
          
          {isAdminRoute ? (
            <div className="space-x-4">
              <Link
                to="/admin/requested-forums"
                className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline"
              >
                Requested Forums
              </Link>
              <Link
                to="/admin/forums"
                className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline"
              >
                Create Forums +
              </Link>
            </div>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
              disabled
            >
              Request Forum
            </button>
          )}
        </div>

        {/* Tab navigation skeleton */}
        <div className="flex border-b border-gray-400 dark:border-neutral-700 mb-6">
          <div className="py-2 px-4 font-medium text-sm mr-4 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400">
            Forums
          </div>
          <div className="py-2 px-4 font-medium text-sm text-gray-500 dark:text-gray-400">
            Notifications
          </div>
        </div>
        
        <SearchBar />
        
        {/* Grid of forum cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {skeletonCards.map((_, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:shadow-neutral-700 rounded-lg shadow-md p-6 animate-pulse"
            >
              {/* Title skeleton */}
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              
              {/* Description skeleton - multiple lines */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
              
              {/* Created date skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              
              {/* Button skeleton */}
              <div className="flex justify-between items-center mt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ForumListSkeleton;