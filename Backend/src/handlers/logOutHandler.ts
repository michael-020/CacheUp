import { Request, Response } from "express";
import { loggingService } from '../services/loggingService';

export const logOutHandler = async (req: Request, res: Response) => {
    try {
        // Create logout log before clearing cookie
        await loggingService.createLogoutLog(req.user._id.toString(), req);
        
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            domain: process.env.NODE_ENV === 'production' ? '.cacheupp.com' : undefined,
            path: '/',
        });        
          
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error while logging out", error);
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};