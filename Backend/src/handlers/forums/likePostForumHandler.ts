import { Request, Response } from "express";
import { postForumModel } from "../../models/db";


export const likePostForumHandler = async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId } = req.params;
        const post = await postForumModel.findById(mongoId)
        if(!post){
            res.status(411).json({
                msg: "Post not found"
            })
            return
        }
        const isLiked = post.likedBy?.includes(userId)
        if(isLiked){
            post.likedBy = post.likedBy?.filter((id) => id.toString() !== userId.toString())
        }else{
            post?.likedBy?.push(userId)
            post.disLikedBy = post?.disLikedBy?.filter((id) => id.toString() !== userId.toString())
        }
        await post.save()
        res.json({
            msg: isLiked ? "unlike" : "like",
            like: post.likedBy?.length
    })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
} 