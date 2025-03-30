import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";


export const getAllCommentsFromAPostHandler = async(req: Request, res: Response) => {
    try{
        const { postId } = req.params;
        const comments = await commentForumModel.find({post: postId})
        res.json({
            msg: "Comments Fetched Succesfully",
            comments
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}