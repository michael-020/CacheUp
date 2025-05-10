import { ChartBar } from "lucide-react";
import { DateNavigation } from "./DateNavigation";

export const EmptyState = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <DateNavigation />
        <div className="flex flex-col items-center justify-center h-40">
          <ChartBar className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No Statistics Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            There is no user activity recorded for this date.
          </p>
        </div>
      </div>
    </div>
  );
};