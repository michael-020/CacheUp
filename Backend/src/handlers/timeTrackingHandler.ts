import { Request, Response } from 'express';
import { timeTrackingService } from '../services/timeTrackingService';

export const logPageViewHandler = async (req: Request, res: Response) => {
  try {
    const { page, timeSpent } = req.body;
    const userId = req.user._id;

    await timeTrackingService.logPageView(userId.toString(), page, timeSpent);

    res.json({
      success: true,
      message: 'Page view logged successfully'
    });
  } catch (error) {
    console.error('Error logging page view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log page view'
    });
  }
};

export const getDailyTimeSpentHandler = async (req: Request, res: Response) => {
  try {
    const date = req.params.date ? new Date(req.params.date) : new Date();
    
    // Get both stats and total time in parallel
    const [stats, totalTime] = await Promise.all([
      timeTrackingService.getDailyTimeSpent(date),
      timeTrackingService.getTotalTimeSpent(date)
    ]);

    if (!stats || stats.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No stats found for this date'
      });
      return
    }

    res.json({
      success: true,
      data: {
        userStats: stats,
        totalTime
      }
    });
  } catch (error) {
    console.error('Error getting daily time spent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily time spent'
    });
  }
};