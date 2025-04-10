import { Request, Response } from "express";
import { requestForumModel } from "../../models/db";


export const adminGetForumRequestHandler = async (req: Request, res: Response) => {
    try{
        const requestedForums = await requestForumModel
            .find({status: 'pending'})
            .sort({createdAt: -1})
            .populate({
            path: "requestedBy",
            select: "_id username profilePicture"
        })
        res.json({
            msg: "Requested Forums",
            requestedForums
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}