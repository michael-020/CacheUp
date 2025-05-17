import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";


export const likeCommentForumHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId } = req.params;
        const comment = await commentForumModel.findById(mongoId)
        if(!comment){
            res.status(404).json({
                msg: "Comment not found"
            })
            return
        }
        const isLiked = comment.likedBy?.includes(userId)
        if(isLiked){
            comment.likedBy = comment.likedBy?.filter((id) => id.toString() !== userId.toString());
        }else{
            comment.likedBy?.push(userId)
            comment.disLikedBy = comment.disLikedBy?.filter((id) => id.toString() !== userId.toString());
        }
        await comment.save()
        res.json({
            msg: isLiked ? "Unliked" : "Liked",
            likeCount: comment.likedBy?.length
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}