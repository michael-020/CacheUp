import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SearchBar } from '../forums/search-bar';
import { useNavigate } from 'react-router-dom';

const ForumPageSkeleton: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div>
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 translate-y-16 sm:translate-y-20 lg:translate-y-24 h-full">
       <SearchBar />
               
               <div className="flex justify-between items-start gap-3 mb-4 sm:mb-6">
                 <div className='flex items-center min-w-0 flex-1'>
                   <button
                     onClick={() => navigate(-1)}
                     className="mr-2 p-2 sm:p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700 flex-shrink-0"
                   >
                     <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
                   </button>
       
                   <h1 className="text-lg sm:text-lg lg:text-2xl font-bold truncate">
                   </h1>
                 </div>
       
                 { (
                   <button
                     className="bg-blue-500 text-white px-3 sm:px-3 lg:px-4 py-2 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
                   >
                     Create Thread
                   </button>
                 )}
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