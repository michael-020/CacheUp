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
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const stats = await timeTrackingService.getDailyTimeSpent(date);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting daily time spent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily time spent'
    });
  }
};