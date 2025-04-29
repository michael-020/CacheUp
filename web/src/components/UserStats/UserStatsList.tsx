import { useUserStatsStore } from '@/stores/StatsStore/useStatsStore';
import { formatDistance, format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const UserStatsList = () => {
  const { stats } = useUserStatsStore();
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {stats.map((stat) => {
        const isExpanded = expandedUsers.includes(stat.userId);
        const sessions = stat.loginTimes.map((loginTime, index) => ({
          login: new Date(loginTime),
          logout: stat.logoutTimes[index] ? new Date(stat.logoutTimes[index]) : null
        }));

        return (
            <Link to={`/admin/profile/${stat.userId}`} key={stat.userId}>

                <div
                    key={stat.userId}
                    className="p-4 border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                    <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {stat.profilePicture ? (
                            <img 
                            src={stat.profilePicture} 
                            alt={stat.name} 
                            className="h-10 w-10 rounded-full"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700" />
                        )}
                        <div>
                        <h3 className="font-medium">{stat.name}</h3>
                        <p className="text-sm text-gray-500">@{stat.username}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="font-medium">{stat.department}</p>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Login Count</p>
                        <p className="text-lg font-medium">{stat.loginCount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Time Spent</p>
                        <p className="text-lg font-medium">{Math.round(stat.totalTimeSpent)} min</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Last Session</p>
                        <p className="text-lg font-medium">
                        {stat.loginTimes.length > 0 
                            ? formatDistance(new Date(stat.loginTimes[stat.loginTimes.length - 1]), new Date(), { addSuffix: true })
                            : 'N/A'
                        }
                        </p>
                    </div>
                    </div>

                    {/* Session Details Button */}
                    <button
                    onClick={() => toggleUserExpand(stat.userId)}
                    className="mt-4 w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                    {isExpanded ? (
                        <>
                        Hide Sessions <ChevronUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                        View Sessions <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                    </button>

                    {/* Session Details */}
                    {isExpanded && (
                        <div className="mt-4 space-y-3">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Session History
                        </div>
                        {sessions.map((session, index) => (
                            <div 
                            key={index}
                            className="p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-lg"
                            >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Login</p>
                                <p className="font-medium">
                                {format(session.login, 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Logout</p>
                                <p className="font-medium">
                                {session.logout 
                                    ? format(session.logout, 'MMM d, yyyy h:mm a')
                                    : 'Session Active'
                                }
                                </p>
                            </div>
                            </div>
                            {session.logout && (
                                <div className="mt-2 text-sm text-gray-500">
                                Duration: {Math.round((session.logout.getTime() - session.login.getTime()) / 1000 / 60)} minutes
                            </div>
                            )}
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            </Link>
        );
      })}
    </div>
  );
};