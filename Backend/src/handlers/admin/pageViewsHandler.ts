import { Request, Response } from "express";
import { timeTrackingService } from "../../services/timeTrackingService";

export const pageViewHandler = async (req: Request, res: Response) => {
  try {
    const date = new Date(req.params.date);
    const stats = await timeTrackingService.getDailyPageViews(date);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting page views:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get page views'
    });
  }
}