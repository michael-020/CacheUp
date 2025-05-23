import { Request, Response } from "express";
import { threadForumModel } from "../../models/db";


export const reportThreadHandler = async (req: Request, res: Response) => {
    try{
        const { mongoId } = req.params
        const thread = await threadForumModel.findById(mongoId)
        if(!thread){
            res.status(404).json({
                msg: "Thread couldn't be found"
            })
            return
        }
        const userId = req.user._id
        
        const isReported = thread.reportedBy?.includes(userId)

        if(isReported){
            thread.reportedBy = thread.reportedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            thread.reportedBy?.push(userId)
        }

        await thread.save()

        res.json({
            msg: isReported ? "Unreported" : "Reported",
            reportCount: thread.reportedBy?.length
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}