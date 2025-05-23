import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";


export const reportCommentForumHandler = async (req: Request, res: Response) => {
    try {
        const { mongoId } = req.params;
        const userId = req.user._id
        if(!mongoId){
            res.status(411).json({
                msg: "Please provide the id"
            })
            return;
        }
        const comment = await commentForumModel.findById(mongoId)

        if(!comment){
            res.status(411).json({
                msg: "No such comment found"
            })
            return;
        }

        const isReported = comment?.reportedBy?.includes(userId)
        if(isReported){
            comment.reportedBy = comment?.reportedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            comment.reportedBy?.push(userId)
        }
        await comment.save()

        res.json({
            message: isReported ? "Comment unreported" : "Comment reported",
            reportButtonText: isReported ? "Report" : "Unreport",
            reportCount: comment.reportedBy?.length
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}