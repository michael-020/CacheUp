import { axiosInstance } from '@/lib/axios';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

interface TimeSpentStat {
  userId: string;
  name: string;
  username: string;
  totalTimeSpent: number;
}

export const Statistics = () => {
  const [timeStats, setTimeStats] = useState<TimeSpentStat[]>([]);
  const [totalDailyTime, setTotalDailyTime] = useState(0);
  const [selectedDate] = useState(new Date());

  const fetchTimeStats = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/admin/stats/daily-time/${formattedDate}`);
      
      if (response.data.success) {
        setTimeStats(response.data.data.userStats || []);
        setTotalDailyTime(response.data.data.totalTime || 0);
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
      <div className="mt-8 bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Time Tracking Statistics</h2>
          <Link 
            to="/admin/page-views"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View Page Statistics →
          </Link>
        </div>
        
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
            <Link to={`/admin/profile/${stat.userId}`}>
                <div 
                key={stat.userId}
                className="p-4 border dark:border-neutral-700 rounded-lg"
                >
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">{stat.name}</h4>
                    <span className="text-sm text-gray-500">@{stat.username}</span>
                </div>
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                    Total Time: {Math.round(stat.totalTimeSpent)} minutes
                </div>
                </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};