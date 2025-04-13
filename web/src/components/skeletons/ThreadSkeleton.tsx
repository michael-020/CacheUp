import { ArrowLeft } from 'lucide-react';

const ThreadSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20">
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-10">
        {/* Header section skeleton */}
        <div className="mb-4 border-b pb-4">
          <div className="flex">
            <button className="mr-4 px-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700">
              <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="h-8 bg-gray-200 dark:bg-neutral-700 w-1/2 rounded animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-3/4 rounded mt-2 animate-pulse"></div>
          <div className="flex items-center justify-between mt-3">
            <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-32 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-neutral-700 w-24 rounded animate-pulse"></div>
          </div>
        </div>
          
        {/* Posts skeletons */}
        <div className="space-y-6">
          {/* First post (featured) */}
          <div className="rounded-lg shadow border border-blue-200 dark:bg-neutral-800 overflow-hidden">
            <div className="flex items-center gap-3 p-4 dark:bg-neutral-950">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-32 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 w-24 rounded mt-1 animate-pulse"></div>
              </div>
              <div className="h-5 bg-blue-100 dark:bg-blue-900 w-20 rounded-full animate-pulse"></div>
            </div>

            <div className="p-5 dark:bg-neutral-950">
              {/* Post content skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-3/4 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-5/6 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 px-5 py-3 dark:border-neutral-600 bg-gray-50 border-t dark:bg-neutral-950">
              {/* Action buttons skeleton */}
              <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Regular posts (3 more) */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="rounded-lg shadow border border-gray-100 bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="flex items-center gap-3 p-4 dark:bg-neutral-950">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-32 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-neutral-700 w-24 rounded mt-1 animate-pulse"></div>
                </div>
              </div>

              <div className="p-5 dark:bg-neutral-950">
                {/* Post content skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-full rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-full rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 w-3/4 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 px-5 py-3 dark:border-neutral-600 bg-gray-50 border-t dark:bg-neutral-950">
                {/* Action buttons skeleton */}
                <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-neutral-700 w-16 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreadSkeleton;