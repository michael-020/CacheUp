import { Request, Response } from "express";
import { postForumModel } from "../../models/db";
import { deletePost } from "./utils/deletePost";


export const userPostForumdeleteHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id;
    const { mongoId, vectorId } = req.params;
    if(!(mongoId || vectorId)){
        res.status(411).json({
            msg: "Please provide the ids"
        })
        return
    }
    
    const post = await postForumModel.findById(mongoId)
    
    if(userId.toString() !== post?.createdBy.toString()) {
        res.status(401).json({
            msg: "You are not authorized to delete this post"
        })
        return
    }

    const result = await deletePost(mongoId, vectorId)
    if(!result.success){
        res.status(500).json({
            msg: result.msg
        })
        return
    }

    res.json({
        msg: "Post deleted successfully"
    })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}