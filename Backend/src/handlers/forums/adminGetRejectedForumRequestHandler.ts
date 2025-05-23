import { Request, Response } from "express";
import { requestForumModel } from "../../models/db";


export const adminGetRejectedForumRequestHandler = async (req: Request, res: Response) => {
    try{
        const rejectedForums = await requestForumModel
            .find({status: "rejected"})
            .sort({createdAt: -1})
            .populate({
                path: "requestedBy",
                select: "_id username profilePicture"
            })
        
        res.json({
            msg: "Rejected Forums",
            rejectedForums
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}