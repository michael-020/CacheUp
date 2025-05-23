import { Request, Response } from "express";
import { postForumModel } from "../../models/db";


export const dislikePostForumHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id;
        const { mongoId } = req.params;
        const post = await postForumModel.findById(mongoId)
        if(!post){
            res.status(411).json({
                msg: "Please provide a correct Id"
            })
            return
        }
        const isDisliked = post.disLikedBy?.includes(userId)
        if(isDisliked){
            post.disLikedBy = post.disLikedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            post.disLikedBy?.push(userId)
            post.likedBy = post.likedBy?.filter((id) => id.toString() !== userId.toString())
        }
        await post.save()
        res.json({
            msg: isDisliked ? "Not disliked" : "Disliked",
            dislikeCount: post.disLikedBy?.length
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
                msg: "server error"
            })
    }
}