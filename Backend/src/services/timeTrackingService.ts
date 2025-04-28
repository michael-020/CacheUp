import { UserLog, userModel } from '../models/db';
import mongoose from 'mongoose';

interface UserSession {
  userId: string;
  action: 'LOGIN' | 'LOGOUT';
  timestamp: Date;
  sessionDuration?: number;
}

export const timeTrackingService = {
  async logPageView(userId: string, page: string, timeSpent: number, isHeartbeat: boolean = false) {
    try {
      const now = new Date();
      
      if (isHeartbeat) {
        // Update last active timestamp for the user's session
        await UserLog.findOneAndUpdate(
          { 
            userId,
            action: 'LOGIN',
            timestamp: { 
              $lte: now,
              $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          { lastActive: now },
          { sort: { timestamp: -1 } }
        );
      }

      await UserLog.create({
        userId,
        action: 'PAGE_VIEW',
        page,
        timeSpent,
        timestamp: now
      });
    } catch (error) {
      console.error('Error logging page view:', error);
      throw error;
    }
  },

  async getDailyTimeSpent(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Get both page views and session logs
      const [pageLogs, sessionLogs] = await Promise.all([
        UserLog.find({
          timestamp: { 
            $gte: startOfDay,
            $lte: endOfDay
          },
          action: 'PAGE_VIEW'
        }).populate({
          path: 'userId',
          model: 'users',
          select: 'name username'
        }),
        UserLog.find({
          timestamp: { 
            $gte: startOfDay,
            $lte: endOfDay
          },
          $or: [
            { action: 'LOGIN' },
            { action: 'LOGOUT' }
          ]
        }).populate({
          path: 'userId',
          model: 'users',
          select: 'name username'
        })
      ]);

      const userStats = new Map();

      // Process page view times
      for (const log of pageLogs) {
        const userId = log.userId._id.toString();
        const userDoc = log.userId as any;
        
        const current = userStats.get(userId) || {
          userId,
          name: userDoc.name,
          username: userDoc.username,
          totalTimeSpent: 0
        };

        current.totalTimeSpent += log.timeSpent || 0;
        userStats.set(userId, current);
      }

      // Process session times
      const sessionsByUser = new Map<string, UserSession[]>();
      for (const log of sessionLogs) {
        if (!log.userId) continue;
        const userId = log.userId._id.toString();
        const userSessions = sessionsByUser.get(userId) || [];
        userSessions.push({
          ...log.toObject(),
          userId: userId
        } as UserSession);
        sessionsByUser.set(userId, userSessions);
      }

      // Calculate session durations
      for (const [userId, sessions] of sessionsByUser) {
        const sortedSessions = sessions.sort((a: UserSession, b: UserSession) => 
          a.timestamp.getTime() - b.timestamp.getTime()
        );
        let sessionTime = 0;

        for (let i = 0; i < sortedSessions.length - 1; i++) {
          if (sortedSessions[i].action === 'LOGIN' && sortedSessions[i + 1].action === 'LOGOUT') {
            const duration = (sortedSessions[i + 1].timestamp.getTime() - 
              sortedSessions[i].timestamp.getTime()) / 1000 / 60;
            sessionTime += Math.max(0, duration);
          }
        }

        // Add session time to user's total
        if (userStats.has(userId)) {
          const stats = userStats.get(userId);
          stats.totalTimeSpent += sessionTime;
        }
      }

      return Array.from(userStats.values());
    } catch (error) {
      console.error('Error getting daily time spent:', error);
      throw error;
    }
  },

  // Add new method for page views
  async getDailyPageViews(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const logs = await UserLog.find({
        timestamp: { 
          $gte: startOfDay,
          $lte: endOfDay
        },
        action: 'PAGE_VIEW'
      }).populate({
        path: 'userId',
        model: 'users',
        select: 'name username'
      });

      const userStats = new Map();

      for (const log of logs) {
        const userId = log.userId._id.toString();
        const userDoc = log.userId as any;
        
        const current = userStats.get(userId) || {
          userId,
          name: userDoc.name,
          username: userDoc.username,
          pageViews: new Map()
        };

        // Aggregate time spent per page
        const currentPageTime = current.pageViews.get(log.page) || 0;
        current.pageViews.set(log.page, currentPageTime + (log.timeSpent || 0));
        userStats.set(userId, current);
      }

      // Convert Map to array and format page views
      return Array.from(userStats.values()).map(user => ({
        ...user,
        pageViews: Array.from(user.pageViews.entries())
          .map(entry => {
            const [page, timeSpent] = entry as [string, number];
            return {
              page,
              timeSpent
            };
          })
      }));
    } catch (error) {
      console.error('Error getting page views:', error);
      throw error;
    }
  },

  async getTotalTimeSpent(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Get both page views and session logs for the specific date
      const [pageLogs, sessionLogs] = await Promise.all([
        UserLog.find({
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          action: 'PAGE_VIEW'
        }),
        UserLog.find({
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          action: 'LOGOUT'
        })
      ]);

      // Calculate total time from page views
      const pageViewTime = pageLogs.reduce((total, log) => 
        total + (log.timeSpent || 0), 0);

      // Calculate total time from sessions
      const sessionTime = sessionLogs.reduce((total, log) => 
        total + (log.sessionDuration || 0), 0);

      return pageViewTime + sessionTime;
    } catch (error) {
      console.error('Error getting total time spent:', error);
      throw error;
    }
  },

  async getUserStats(userId: string) {
    try {
      // Validate userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID format');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLogins = await UserLog.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        action: 'LOGIN',
        timestamp: { $gte: today }
      });

      const totalSessionTime = await UserLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            action: 'LOGOUT',
            timestamp: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: '$sessionDuration' }
          }
        }
      ]);

      return {
        userId,
        loginCount: todayLogins,
        totalTimeSpent: totalSessionTime[0]?.totalDuration || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  },

  async getAllUsersStats(date: string) {
    try {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(queryDate.getDate() + 1);

      const logs = await UserLog.find({
        timestamp: { 
          $gte: queryDate,
          $lt: nextDay
        }
      }).sort({ timestamp: 1 });

      const uniqueUserIds = [...new Set(logs.map(log => log.userId.toString()))];

      const usersStats = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          // Validate userId
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            return null;
          }

          const user = await userModel.findById(userId)
            .select('name username profilePicture department graduationYear');

          if (!user) return null;

          const userLogs = logs.filter(log => 
            log.userId.toString() === userId
          );
          
          const loginLogs = userLogs.filter(log => log.action === 'LOGIN');
          const logoutLogs = userLogs.filter(log => log.action === 'LOGOUT');
          const signupLog = userLogs.find(log => log.action === 'SIGNUP');

          let totalTimeSpent = 0;
          const sessions = loginLogs.map((login, index) => {
            const logout = logoutLogs[index];
            if (logout && login.timestamp <= logout.timestamp) {
              const duration = (logout.timestamp.getTime() - login.timestamp.getTime()) / 1000 / 60;
              totalTimeSpent += Math.max(0, duration);
              return duration;
            }
            return 0;
          });

          return {
            userId: user._id.toString(),
            name: user.name,
            username: user.username,
            profilePicture: user.profilePicture,
            department: user.department,
            graduationYear: user.graduationYear,
            loginCount: loginLogs.length,
            signupTime: signupLog?.timestamp,
            loginTimes: loginLogs.map(log => log.timestamp),
            logoutTimes: logoutLogs.map(log => log.timestamp),
            totalTimeSpent,
            totalLogins: loginLogs.length + (signupLog ? 1 : 0),
            sessions
          };
        })
      );

      return usersStats.filter(Boolean);
    } catch (error) {
      console.error('Error getting all users stats:', error);
      return null;
    }
  }
};