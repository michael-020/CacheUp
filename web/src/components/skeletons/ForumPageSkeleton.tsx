import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ForumPageSkeleton: React.FC = () => {
  return (
    <div>
      <div className="max-w-6xl mx-auto p-6 translate-y-24 h-full">
        <div className="flex justify-between items-center mb-6">
          <button
            className="mr-4 p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Create thread button skeleton */}
          <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded w-32 animate-pulse"></div>
        </div>

        {/* Thread list skeletons */}
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border p-4 rounded">
              {/* Thread title skeleton */}
              <div className="h-7 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse"></div>
              
              {/* Thread description skeleton */}
              <div className="mt-2 h-4 bg-gray-200 dark:bg-neutral-700 rounded w-full animate-pulse"></div>
              <div className="mt-1 h-4 bg-gray-200 dark:bg-neutral-700 rounded w-2/3 animate-pulse"></div>
              
              {/* Thread metadata skeleton */}
              <div className="mt-3 flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPageSkeleton;