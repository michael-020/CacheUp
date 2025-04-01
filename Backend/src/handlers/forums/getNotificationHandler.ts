import { Request, Response } from "express";
import { watchNotificationModel } from "../../models/db";


export const getNotification = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id
        
        const notifications = await watchNotificationModel.find({
            userIds: { $in: [userId]},
            seenBy: { $ne: []}
        }).sort({ createdAt: -1 })

        res.json({
            msg: "Notifications successfully fetched",
            notifications
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}