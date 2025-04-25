import { Request } from 'express';
import mongoose from 'mongoose';
import { UserLog, userModel } from '../models/db';

export const loggingService = {
  async createSignupLog(userId: string, req: Request) {
    try {
      await UserLog.create({
        userId,
        action: 'SIGNUP',
        device: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error creating signup log:', error);
    }
  },

  async createLoginLog(userId: string, req: Request) {
    try {
      await UserLog.create({
        userId,
        action: 'LOGIN',
        device: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error creating login log:', error);
    }
  },

  async createLogoutLog(userId: string, req: Request) {
    try {
      // Find the most recent login for this user that doesn't have a matching logout
      const lastLogin = await UserLog.findOne({ 
        userId, 
        action: 'LOGIN',
      }).sort({ timestamp: -1 });

      const now = new Date();
      
      // Create logout log regardless of finding last login
      const logoutLog = await UserLog.create({
        userId,
        action: 'LOGOUT',
        sessionDuration: lastLogin ? (now.getTime() - lastLogin.timestamp.getTime()) / 1000 / 60 : 0,
        device: req.headers['user-agent'],
        ipAddress: req.ip,
        timestamp: now
      });

      // Return the created log
      return logoutLog;
    } catch (error) {
      console.error('Error creating logout log:', error);
      throw error;
    }
  },

  async getUserStats(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLogins = await UserLog.countDocuments({
        userId,
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

      // Get all logs for the specified date
      const logs = await UserLog.find({
        timestamp: { 
          $gte: queryDate,
          $lt: nextDay
        }
      }).sort({ timestamp: 1 });

      const uniqueUserIds = [...new Set(logs.map(log => log.userId.toString()))];

      const usersStats = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const user = await userModel.findById(userId)
            .select('name username profilePicture department graduationYear');

          if (!user) return null;

          // Filter logs for this user
          const userLogs = logs.filter(log => log.userId.toString() === userId);
          
          // Get login and logout logs
          const loginLogs = userLogs.filter(log => log.action === 'LOGIN');
          const logoutLogs = userLogs.filter(log => log.action === 'LOGOUT');
          const signupLog = userLogs.find(log => log.action === 'SIGNUP');

          // Calculate total time spent
          let totalTimeSpent = 0;
          loginLogs.forEach((login, index) => {
            const logout = logoutLogs[index];
            if (logout) {
              const duration = (logout.timestamp.getTime() - login.timestamp.getTime()) / 1000 / 60;
              totalTimeSpent += duration;
            }
          });

          return {
            userId: user._id,
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
            totalLogins: loginLogs.length + (signupLog ? 1 : 0)
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