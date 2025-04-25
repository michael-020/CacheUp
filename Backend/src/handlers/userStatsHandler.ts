import { Request, Response } from 'express';
import { loggingService } from '../services/loggingService';

export const getUserStatsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const stats = await loggingService.getUserStats(userId);
    
    if (!stats) {
      res.status(404).json({
        success: false,
        message: 'User stats not found'
      });
      return
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

export const getAllUsersStatsHandler = async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
      return
    }

    const stats = await loggingService.getAllUsersStats(date);
    
    if (!stats) {
      res.status(404).json({
        success: false,
        message: 'No user stats found for this date'
      });
      return
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users statistics'
    });
  }
};