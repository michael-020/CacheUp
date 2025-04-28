import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Clock, ChevronDown, ChevronUp, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore';

interface UserStat {
  userId: string;
  name: string;
  username: string;
  profilePicture?: string;
  department: string;
  graduationYear: string;
  loginCount: number;
  signupTime?: Date;
  loginTimes: Date[];
  logoutTimes: Date[];
  totalTimeSpent: number;
  totalLogins: number; // Total all-time logins
}

export const UserStats = () => {
  const [stats, setStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllTimeStats, setShowAllTimeStats] = useState<{[key: string]: boolean}>({});
  const [showLoginDetails, setShowLoginDetails] = useState<{[key: string]: boolean}>({});
  const [showLogoutDetails, setShowLogoutDetails] = useState<{[key: string]: boolean}>({});
  const navigate = useNavigate();
  const { authAdmin } = useAdminStore();

  const fetchStats = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/admin/stats?date=${formattedDate}`);
      
      if (response.data.success) {
        setStats(response.data.data || []);
      } else {
        setStats([]);
        console.error('Failed to fetch stats:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedDate);
  }, [selectedDate]);

  // Navigation functions
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousDay = async () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    setLoading(true);
    await fetchStats(prevDay);
  };

  const goToNextDay = async () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const today = new Date();
    if (nextDay <= today) {
      setSelectedDate(nextDay);
      setLoading(true);
      await fetchStats(nextDay);
    }
  };

  const handleUserClick = (userId: string) => {
    if (authAdmin) {
      navigate(`/admin/profile/${userId}`);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow animate-pulse">
          <div className="h-6 w-32 mx-auto bg-gray-200 dark:bg-neutral-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-4 w-28 bg-gray-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no stats
  if (stats.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
            <button
              onClick={goToNextDay}
              disabled={isToday(selectedDate)}
              className={`p-2 rounded-full transition-colors ${
                isToday(selectedDate)
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No analytics available for this date
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals including signups
  const totalLogins = stats.reduce((acc, stat) => 
    acc + stat.loginCount + (stat.signupTime ? 1 : 0), 0);
  const totalTime = stats.reduce((acc, stat) => acc + stat.totalTimeSpent, 0);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
          <button
            onClick={goToNextDay}
            disabled={isToday(selectedDate)}
            className={`p-2 rounded-full transition-colors ${
              isToday(selectedDate)
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-neutral-700'
            }`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700/50 p-4 rounded-lg transition-colors"
            onClick={() => setShowDetails(!showDetails)}
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

        {/* Detailed User Stats */}
        {showDetails && (
          <div className="mt-6 border-t dark:border-neutral-700">
            <div className="pt-4">
              <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400 pb-2 mb-2 border-b dark:border-neutral-700">
                <span>User</span>
                <div className="flex gap-8">
                  <span>Department</span>
                  <span>Login Count</span>
                </div>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {stats
                  .sort((a, b) => b.loginCount - a.loginCount)
                  .map((stat) => (
                    <div key={stat.userId}>
                      <div className="flex flex-col p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 rounded-lg transition-colors">
                        {/* User Info Section */}
                        <div className="flex justify-between items-center mb-2">
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleUserClick(stat.userId)}
                          >
                            <img
                              src={stat.profilePicture || "/avatar.jpeg"}
                              alt={stat.username}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                (e.target as HTMLImageElement).src = "/avatar.jpeg";
                              }}
                            />
                            <div>
                              <span className="font-medium hover:text-blue-500 transition-colors block">
                                {stat.name}
                              </span>
                              <span className="text-sm text-gray-500">@{stat.username}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.department} ({stat.graduationYear})
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.loginCount}
                          </div>
                        </div>

                        {/* Login Details Button */}
                        <button
                          onClick={() => setShowLoginDetails(prev => ({
                            ...prev,
                            [stat.userId]: !prev[stat.userId]
                          }))}
                          className="mt-2 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          {showLoginDetails[stat.userId] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          View Login Details
                        </button>

                        {/* Login Details */}
                        {showLoginDetails[stat.userId] && (
                          <div className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800 space-y-2">
                            {stat.signupTime && (
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                Signup: {formatDateTime(stat.signupTime)}
                              </div>
                            )}
                            {stat.loginTimes.map((loginTime, index) => (
                              <div key={index} className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <span className="text-blue-500">Login:</span> {formatDateTime(loginTime)}
                                    </div>
                                    {stat.logoutTimes[index] && (
                                      <div>
                                        <span className="text-red-500">Logout:</span> {formatDateTime(stat.logoutTimes[index])}
                                      </div>
                                    )}
                                  </div>
                                  {stat.logoutTimes[index] && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Session duration: {Math.round(
                                        (new Date(stat.logoutTimes[index]).getTime() - new Date(loginTime).getTime()) / 1000 / 60
                                      )} min
                                    </div>
                                  )}
                                </div>
                                {index < stat.loginTimes.length - 1 && (
                                  <div className="border-b border-gray-100 dark:border-neutral-700 my-2"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Logout Details Button */}
                        <button
                          onClick={() => setShowLogoutDetails(prev => ({
                            ...prev,
                            [stat.userId]: !prev[stat.userId]
                          }))}
                          className="mt-2 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                        >
                          {showLogoutDetails[stat.userId] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          View Logout Details
                        </button>

                        {/* Logout Details */}
                        {showLogoutDetails[stat.userId] && (
                          <div className="mt-2 pl-4 border-l-2 border-red-200 dark:border-red-800 space-y-2">
                            {stat.logoutTimes.map((logoutTime, index) => {
                              const previousLogin = stat.loginTimes[index];
                              const sessionDuration = previousLogin && 
                                (new Date(logoutTime).getTime() - new Date(previousLogin).getTime()) / 1000 / 60;

                              return (
                                <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                  <div>
                                    <span className="text-red-500">Logout:</span> {formatDateTime(logoutTime)}
                                    {sessionDuration > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Session duration: {Math.round(sessionDuration)} min
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* All-time Stats Button */}
                        <button
                          onClick={() => setShowAllTimeStats(prev => ({
                            ...prev,
                            [stat.userId]: !prev[stat.userId]
                          }))}
                          className="mt-2 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          {showAllTimeStats[stat.userId] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          View All-time Stats
                        </button>

                        {/* All-time Stats Details */}
                        {showAllTimeStats[stat.userId] && (
                          <div className="mt-2 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Logins: {stat.totalLogins}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Average Time per Session: {Math.round(stat.totalTimeSpent / stat.loginCount)} min
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};