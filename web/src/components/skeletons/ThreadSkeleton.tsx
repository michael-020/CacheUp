
export const ThreadSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20">
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-10">
        {/* Posts */}
        <div className="space-y-6 mt-40">
          {[1, 2].map((post) => (
            <div key={post} className="rounded-lg shadow border bg-white dark:bg-neutral-800 overflow-hidden">
              {/* Author Section */}
              <div className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                {post === 1 && (
                  <div className="h-6 w-24 rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
              </div>

              {/* Interaction Buttons */}
              <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-neutral-900 border-t">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-neutral-700 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};