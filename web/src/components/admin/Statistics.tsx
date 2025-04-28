import { axiosInstance } from '@/lib/axios';
import { useState, useEffect } from 'react';

interface TimeSpentStat {
  userId: string;
  name: string;
  username: string;
  totalTimeSpent: number;
  pageViews: Array<{
    page: string;
    timeSpent: number;
  }>;
}

export const Statistics = () => {
  const [timeStats, setTimeStats] = useState<TimeSpentStat[]>([]);
  const [totalDailyTime, setTotalDailyTime] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTimeStats = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/admin/stats/time-spent?date=${formattedDate}`);
      
      if (response.data.success) {
        setTimeStats(response.data.data);
        // Calculate total time spent by all users
        const total = response.data.data.reduce(
          (acc: number, curr: TimeSpentStat) => acc + curr.totalTimeSpent, 
          0
        );
        setTotalDailyTime(total);
      }
    } catch (error) {
      console.error('Error fetching time stats:', error);
    }
  };

  useEffect(() => {
    fetchTimeStats(selectedDate);
  }, [selectedDate]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Time Tracking Stats */}
      <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Time Tracking Statistics</h2>
        
        {/* Total Time for All Users */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Total Time Spent Today</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(totalDailyTime)} minutes
          </p>
        </div>

        {/* Individual User Stats */}
        <div className="space-y-4">
          {timeStats.map((stat) => (
            <div 
              key={stat.userId} 
              className="p-4 border dark:border-neutral-700 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{stat.name}</h4>
                <span className="text-sm text-gray-500">@{stat.username}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Time:
                </span>
                <span className="font-medium">
                  {Math.round(stat.totalTimeSpent)} minutes
                </span>
              </div>

              {/* Page Views Breakdown */}
              <div className="mt-2 space-y-1">
                <h5 className="text-sm font-medium mb-1">Page Views:</h5>
                {stat.pageViews.map((view, index) => (
                  <div 
                    key={index}
                    className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>{view.page}</span>
                    <span>{Math.round(view.timeSpent)} min</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};