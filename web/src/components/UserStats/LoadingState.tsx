import { Loader } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </div>
    </div>
  );
};