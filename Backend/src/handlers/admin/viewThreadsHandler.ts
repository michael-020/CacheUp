import { Request, Response } from "express";
import { threadForumModel } from "../../models/db";

export const viewAllThreadsHandler = async(req: Request, res: Response) => {
    try{
        const { forumId } = req.params 
        const allThreads = await threadForumModel.find({
            forum: forumId
        })
        res.json({
            msg:"All your forums",
            allThreads
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}