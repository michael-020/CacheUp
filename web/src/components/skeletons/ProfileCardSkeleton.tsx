
export const ProfileCardSkeleton = () => {
  return (
    <div className="absolute lg:w-52 xl:w-64 p-3 overflow-y-auto mt-16 ml-8 z-10">
      <div className="bg-white dark:bg-neutral-800 dark:border-neutral-700 rounded-lg shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <div className="p-4">
          {/* Header */}
          <div className="text-base font-semibold text-center mb-3 pb-2 border-b h-7 w-3/4 mx-auto bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
          
          <div className="text-center">
            {/* Profile Picture */}
            <div className="relative w-16 h-16 mx-auto mb-3">
              <div className="absolute inset-0 rounded-full p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
              </div>
            </div>
            
            {/* Name and Username */}
            <div className="h-4 w-24 mx-auto mb-1 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            <div className="h-3 w-20 mx-auto mb-3 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
            
            {/* Bio */}

            <div className="h-12 mb-2 w-full bg-gray-200 dark:bg-neutral-600 animate-pulse rounded" />

            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mb-2">
              <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
              <div className="h-8 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};