const PostCardSkeleton = () => {
  return (
    <div className="xl:max-w-[675px] md:max-w-[500px] sm:max-w-[500px] mx-auto rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-900 p-4 shadow-lg mb-4 border border-gray-200 animate-pulse">
      {/* Header with profile */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="size-12 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
          <div className="flex flex-col">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-16 mt-2"></div>
          </div>
        </div>
        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Post content (text) */}
      <div className="mb-4 ml-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>

      {/* Post image */}
      <div className="rounded-xl overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700 h-48 sm:h-56 md:h-64 w-full border border-gray-100 dark:border-gray-700"></div>

      {/* Action buttons */}
      <div className="flex items-center pt-3 border-t border-gray-100 dark:border-gray-600 text-sm">
        {/* Like button */}
        <div className="flex items-center mr-6">
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
        </div>
        
        {/* Comment button */}
        <div className="flex items-center mr-6">
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded ml-2"></div>
        </div>
        
        {/* Save button */}
        <div className="ml-auto">
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;