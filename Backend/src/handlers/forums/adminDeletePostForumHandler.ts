import { Request, Response } from "express";
import { deletePost } from "./utils/deletePost";


export const adminDeletePostForumHandler = async (req: Request, res: Response) => {
    try{
        const { mongoId, vectorId } = req.params;
        if(!mongoId || !vectorId){
            res.status(411).json({
                msg: "Please provide ids"
            })
            return
        }

        const result = await deletePost(mongoId, vectorId)
        if(!result.success){
            res.status(500).json({
                msg: result.msg,
                error: result.error
            })
        }
        res.json({
            msg: "All posts deleted successfully"
        })
    } catch (e) {
        console.error("Error deleting post and comments:", e);
        res.status(500).json({ msg: "Server Error" });
    }
}