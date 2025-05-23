import { Request, Response } from "express";
import { postForumModel } from "../../models/db";


export const reportPostForumHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId } = req.params
        const post = await postForumModel.findById(mongoId)
        if(!post){
            res.status(404).json({
                msg: "Couldn't find the post"
            })
            return
        }
    
        const isReported = post.reportedBy?.includes(userId)
    
        if(isReported){
            post.reportedBy = post.reportedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            post.reportedBy?.push(userId)
        }
    
        await post.save()
    
        res.json({
            msg: isReported ? "Unreported" : "Reported",
            reportCount: post.reportedBy?.length 
        })
    }catch(e){
        console.error(e)
        res.json({
            msg: "Server error" 
        })
    }   
}