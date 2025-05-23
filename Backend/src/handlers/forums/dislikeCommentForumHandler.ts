import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";


export const dislikeCommentForumHandler = async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId } = req.params;
        const comment = await commentForumModel.findById(mongoId)
        if(!comment) {
            res.status(404).json({
                msg: "Comment not found"
            })
            return
        }
        const isDisliked = comment.disLikedBy?.includes(userId)
        if(isDisliked){
            comment.disLikedBy = comment.disLikedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            comment.disLikedBy?.push(userId)
            comment.likedBy = comment.likedBy?.filter((id) => id.toString() !== userId.toString())
        }
        await comment.save()
        res.json({
            msg: isDisliked ? "Not disliked" : "Disliked",
            dislikeCount: comment.disLikedBy?.length
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}