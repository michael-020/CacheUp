import { useUserStatsStore } from '@/stores/StatsStore/useStatsStore';
import { useEffect, useState } from 'react';
import { DateNavigation } from './UserStats/DateNavigation';
import { StatsSummary } from './UserStats/StatsSummary';
import { LoadingState } from './UserStats/LoadingState';
import { EmptyState } from './UserStats/EmptyState';
import { UserStatsList } from './UserStats/UserStatsList';

export const UserStats = () => {
  const { stats, loading, selectedDate, fetchStats } = useUserStatsStore();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchStats(selectedDate);
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (stats.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <DateNavigation />
        <StatsSummary 
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails(!showDetails)}
        />
        {showDetails && <UserStatsList />}
      </div>
    </div>
  );
};