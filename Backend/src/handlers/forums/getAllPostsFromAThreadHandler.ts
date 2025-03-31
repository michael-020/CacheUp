import { Request, Response } from "express";
import { postForumModel } from "../../models/db";


export const getAllPostsFromAThreadHandler = async (req: Request, res: Response) => {
    try{
        const { threadId } = req.params;
        const posts = await postForumModel.find({thread: threadId})
        res.json({
            msg: "Posts Fetched successfully",
            posts
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
} 