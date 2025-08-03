import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";
import { deleteComment } from "./utils/deleteComment";


export const userCommentForumDeleteHandler = async(req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { mongoId, vectorId } = req.params;
        if(!(mongoId || vectorId)){
            res.status(411).json({
                msg:"Please send the ids"
            })
            return
        }
        const comment = await commentForumModel.findById(mongoId)
    
        if(userId.toString() !== comment?.createdBy.toString()){
            res.status(401).json({
                msg: "You are not authorized to delete this comment"
            })
            return;
        }
    
        const results = await deleteComment(mongoId, vectorId);
        if(!results.success){
            res.status(500).json({
                msg: "Comment was not deleted successfully"
            })
            return;
        }
        res.json({
            msg: "Comment was deleted successfully"
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}