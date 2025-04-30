import { memo } from 'react';
import { Users, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useUserStatsStore } from '@/stores/StatsStore/useStatsStore';

interface StatsSummaryProps {
  showDetails: boolean;
  onToggleDetails: () => void;
}

export const StatsSummary = memo(({ showDetails, onToggleDetails }: StatsSummaryProps) => {
  const { stats } = useUserStatsStore();
  
  const totalLogins = stats.reduce((acc, stat) => 
    acc + stat.loginCount + (stat.signupTime ? 1 : 0), 0);
  const totalTime = stats.reduce((acc, stat) => acc + stat.totalTimeSpent, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700/50 p-4 rounded-lg transition-colors"
        onClick={onToggleDetails}
      >
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Logins Today</p>
          <p className="text-2xl font-bold">{totalLogins}</p>
        </div>
        {showDetails ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Time Spent</p>
          <p className="text-2xl font-bold">{Math.round(totalTime)} min</p>
        </div>
      </div>
    </div>
  );
});

StatsSummary.displayName = 'StatsSummary';