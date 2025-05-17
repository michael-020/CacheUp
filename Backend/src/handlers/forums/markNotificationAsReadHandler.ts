import { Request, Response } from "express";
import { watchNotificationModel } from "../../models/db";


export const markNotificationAsReadHandler = async (req: Request, res: Response) => {
    try{
        const { notificationId } = req.params
        await watchNotificationModel.findByIdAndUpdate(notificationId,{
            $addToSet: {seenBy: req.user._id}
        },{
            new: true
        })
        res.json({
            msg: "Notification Seen"
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Error in marking notification as read"
        })
    }
}