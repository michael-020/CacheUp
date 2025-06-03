import { Router, Request, Response } from "express";

const ServerhealthRouter: Router = Router();

ServerhealthRouter.get('/server-health', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: 'Server health check failed',
      error: errorMessage
    });
  }
});

export default ServerhealthRouter;
