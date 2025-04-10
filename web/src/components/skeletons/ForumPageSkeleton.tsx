import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ForumPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 translate-y-24 h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="mr-4 p-3 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse">
          <ArrowLeft className="size-5 text-gray-300 dark:text-gray-600" />
        </div>
        <div className="h-8 w-64 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
      </div>
      
      <div className="space-y-4">
        {/* Generate multiple thread skeleton items */}
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="border p-4 rounded">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-3"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse mb-3"></div>
            <div className="mt-3 flex justify-between">
              <div className="h-4 w-40 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumPageSkeleton;