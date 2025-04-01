import { Request, Response } from "express";
import { threadForumModel } from "../../models/db";


export const watchThreadHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId } = req.params

        if(!mongoId) {
            res.status(411).json({
                msg: "Please provide ids"
            })
            return
        }
        const thread = await threadForumModel.findById(mongoId)
        if(!thread){
            res.status(404).json({
                msg: "Couldn't find the thread"
            })
            return
        }
        
        const isWatched = thread.watchedBy?.includes(userId)
        if(isWatched){
            thread.watchedBy = thread.watchedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            thread.watchedBy?.push(userId)
        }
        await thread.save()

        res.json({
            msg: isWatched ? "Unwatched" : "Watched"
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}