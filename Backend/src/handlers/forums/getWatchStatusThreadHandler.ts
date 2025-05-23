import { Request, Response } from "express";
import { threadForumModel } from "../../models/db";


export const getWatchStatusThreadHandler = async(req: Request, res: Response) => {
    try{
        const { threadMongoId } = req.params
        const userId = req.user._id
        const thread = await threadForumModel.findById(threadMongoId)
        if(thread?.watchedBy?.includes(userId)){
            res.json({
                msg: "Watch Status",
                isWatched: true
            })
            return
        }
        res.json({
            msg: "Watch Status",
            isWatched: false
        })
        
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
} 