import { Router, Request, Response } from "express";
import { postModel } from "../models/db";
import { mongo } from "mongoose";


const reportPostHandler: Router = Router();

// report/un-report a post
reportPostHandler.put("/:id", async (req: Request, res: Response) => {
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

        const isReported = post.reportedBy.includes(userId)

        if(!isReported){
            post.reportedBy.push(userId);
            await post.save()
        }
        
        const updatedPost = {
            ...post._doc,
            isReported: true,
            reportButtonText: 'Unreport',
            reportCount: post.reportedBy.length
        };

        res.status(200).json({
            message: 'Post reported successfully',
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


// view reported posts
reportPostHandler.get("/", async (req: Request, res: Response) => {
    try{
        const posts = await postModel.find()

        const reportedPosts = posts.filter(post =>{
            if(post.reportedBy.length > 0){
                if(post !== null){
                    return {
                        ...post.toObject()
                    }
                }
            }
        })

        const reportedPostsWithCount = reportedPosts.map(post =>{
            if(post.reportedBy.length > 0){
                if(post !== null){
                    return {
                        ...post._doc,
                        reportCount: post.reportedBy.length
                    }
                }
            }
        })

        res.status(200).json(reportedPostsWithCount)
    }
    catch(e) {
        console.error("Error while fetching reported posts", e)
        res.status(401).json({
            msg: "Error while fetching reported posts"
        })
        return
    }
})

export default reportPostHandler;