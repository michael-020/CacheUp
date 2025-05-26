export const MobileProfileCardSkeleton = () => {
  return (
    <div className="lg:hidden">
      {/* Mobile (sm) Skeleton */}
      <div className="sm:hidden bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden">
        <div className="flex flex-col items-center py-4 px-3">
          {/* Compact profile picture */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 mb-3">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
          </div>
          
          {/* Name and username - compact */}
          <div className="text-center mb-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-1 mx-auto" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mx-auto" />
          </div>
          
          {/* Bio - shorter on mobile */}
          <div className="w-full mb-3 px-2">
            <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
          </div>
          
          {/* Friends count - inline */}
          <div className="mb-3">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mr-1" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            </div>
          </div>
          
          {/* Action buttons - stacked for very small screens */}
          <div className="w-full px-2 space-y-2">
            <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
            <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      {/* Tablet/Medium (md) Skeleton */}
      <div className="hidden sm:block md:hidden bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden">
        <div className="flex items-center p-4 space-x-4">
          {/* Profile picture - medium size */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700">
              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
            </div>
          </div>
          
          {/* Profile info - takes remaining space */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <div className="h-5 w-36 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            </div>
            
            {/* Bio skeleton */}
            <div className="mb-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-1" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            </div>
            
            {/* Friends count */}
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mr-1" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            </div>
          </div>
          
          {/* Action buttons - vertical stack on right */}
          <div className="flex-shrink-0 flex flex-col space-y-2 min-w-[120px]">
            <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
            <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      {/* Small Desktop/Large Tablet Skeleton */}
      <div className="hidden md:block bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden">
        <div className="p-6">
          {/* Header section */}
          <div className="flex items-start space-x-6 mb-4">
            {/* Profile picture - larger */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
              </div>
            </div>
            
            {/* Profile info and actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {/* Name and username */}
                  <div className="h-6 w-40 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-2" />
                  <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-2" />
                  
                  {/* Friends count */}
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mr-2" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  </div>
                </div>
                
                {/* Action buttons - horizontal */}
                <div className="flex space-x-3">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
                  <div className="h-9 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio section */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};