import { Router, Request, Response } from "express";
import { postModel } from "../models/db";
import { mongo } from "mongoose";


const unReportPostHandler: Router = Router();

// un-report a post
unReportPostHandler.put("/:id", async (req: Request, res: Response) => {
    try{
        const postId = req.params.id
        const userId = req.user._id

        const post = await postModel.findById(postId)
        if(!post){
            res.status(401).json({
                msg: "Post not found"
            })
            return
        }
        const userObjectId = new mongo.ObjectId(userId?.toString())
        post.reportedBy = post.reportedBy.filter(reporterId => !reporterId.equals(userObjectId));
        await post.save();
        
        const updatedPost = {
            ...post?.toObject(),
            isReported: false,
            reportButtonText: 'Report',
            reportCount: post.reportedBy.length
        };

        res.status(200).json({
            message: 'Post unreported successfully',
            post: updatedPost
        })
    }
    catch(e) {
        console.error("Error while reporting a post", e)
        res.status(401).json({
            msg: "Error while reporting a post"
        })
        return
    }
})

export default unReportPostHandler