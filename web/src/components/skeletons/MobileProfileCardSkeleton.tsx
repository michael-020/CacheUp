export const MobileProfileCardSkeleton = () => {
  return (
    <div className="lg:hidden bg-white dark:bg-neutral-800 rounded-lg shadow-lg mb-4 overflow-hidden -translate-y-4">
      <div className="flex flex-col items-center pt-6 px-4">
        {/* Profile Picture */}
        <div className="rounded-full bg-white p-1 dark:bg-neutral-800 mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white dark:border-neutral-700">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        </div>

        {/* Name and Username */}
        <div className="text-center mb-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-2 mx-auto" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mx-auto" />
        </div>

        {/* Bio */}
        <div className="w-full mb-4">
          <div className="h-16 w-full max-w-md mx-auto bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
        </div>

        {/* Stats Section */}
        <div className="flex items-center justify-center text-sm space-x-6 mb-4 w-full">
          {/* Friends Count */}
          <div className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mr-1" />
            <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full px-2 pb-4 gap-3">
          <div className="w-1/2">
            <div className="h-9 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
          </div>
          <div className="w-1/2">
            <div className="h-9 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};