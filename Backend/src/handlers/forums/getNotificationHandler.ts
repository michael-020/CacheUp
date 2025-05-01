import { Request, Response } from "express";
import { watchNotificationModel } from "../../models/db";
import { calculateBatchPostPages } from "./utils/pagination";


export const getNotificationHandler = async(req: Request, res: Response) => {
    try {
        const notifications = await watchNotificationModel.find({
            userIds: { $in: [req.user._id] },
            seenBy: { $nin: [req.user._id] }
        })
        .populate('createdBy', 'username _id')
        .populate('threadId', 'title')
        .sort({ createdAt: -1 })
        .lean();

        if(!notifications){
            res.status(404).json({
                msg: "Notification not available"
            })
        }

        const postThreadPairs = notifications
            .filter(notification => notification.postId && notification.threadId)
            .map(notification => ({
                postId: notification.postId.toString(),
                threadId: notification.threadId.toString()
            }))
        
        const postPageMap = await calculateBatchPostPages(postThreadPairs)

        const enrichedNotifications = notifications.map(n => {
            const page = postPageMap.get(n.postId.toString())
            return {
                ...n,
                page
            }
        })
        res.json({
            msg: "Notifications fetched successfully",
            notifications: enrichedNotifications
        })
    } catch (error) {
        
    }
}