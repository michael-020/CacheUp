import { Request, Response } from "express";
import { deleteComment } from "./utils/deleteComment";


export const adminDeleteCommentForumHandler = async(req: Request, res: Response) => {
    const { mongoId, vectorId } = req.params;
    if(!(mongoId || vectorId)){
        res.status(411).json({
            msg:"please provide ids"
        })
        return
    }
    const result = await deleteComment(mongoId, vectorId)
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