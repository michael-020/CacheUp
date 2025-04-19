import { Skeleton } from "@/components/ui/skeleton";

export const ThreadSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20">
      <div className="container mx-auto p-4 max-w-4xl translate-y-20 pb-10">
        {/* Header Section */}
        <div className="mb-4 border-b pb-4">
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-4" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {[1, 2, 3].map((post) => (
            <div key={post} className="rounded-lg shadow border bg-white dark:bg-neutral-800 p-4">
              {/* Author Section */}
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Interaction Buttons */}
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};