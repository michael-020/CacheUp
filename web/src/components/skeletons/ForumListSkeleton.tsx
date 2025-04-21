import React from "react";
import { motion } from "framer-motion";

const ForumListSkeleton: React.FC = () => {
  const skeletonCards = Array(6).fill(0);

  return (
    <motion.div className="h-full pb-20 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto p-6 translate-y-20 h-full">
        {/* Title area skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8  w-64"></div>
          <div className="h-10  w-36"></div>
        </div>

        {/* Tab navigation skeleton */}
        <div className="flex border-b mb-6">
          <div className="h-8  w-24 mr-4"></div>
          <div className="h-8  w-24"></div>
        </div>

        {/* Search bar skeleton */}
        <div className="mb-6 h-12  w-full"></div>

        {/* Grid of forum cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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