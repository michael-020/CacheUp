import { Request, Response } from "express";
import { deleteComment } from "./deleteFunctions/deleteComment";


export const adminDeleteCommentForumHandler = async(req: Request, res: Response) => {
    const { mongoId, weaviateId } = req.params;
    if(!(mongoId || weaviateId)){
        res.status(411).json({
            msg:"please provide ids"
        })
        return
    }
    const result = await deleteComment(mongoId, weaviateId)
    if(!result.success){
        console
        res.status(500).json({
            msg: result.msg
        })
        return
    }
    res.json({
        msg: result.msg
    })
}