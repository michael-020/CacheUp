import { Router, Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { mongo } from "mongoose";


const viewPostHandler: Router = Router();


// get all posts

viewPostHandler.get("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const allPosts = await postModel.find({}).sort({ createdAt: -1});

        if(!allPosts){
            res.status(401).json({
                msg: "No posts found"
            })
        }

        const processedPosts = allPosts.map(post => {
            const isReported = post.reportedBy.includes(new mongo.ObjectId(userId?.toString())); 
            
            const isLiked = post.likes.includes(new mongo.ObjectId(userId?.toString()));
            
            return {
                ...post._doc,
                isReported,
                reportButtonText: isReported ? 'Unreport' : 'Report',
                reportCount: post.reportedBy.length,
                isLiked 
            };
        });

        res.status(200).json(processedPosts)
    }   
    catch (e) {
        console.error("Error while getting all posts", e)
        res.status(401).json({
            msg: "Error while getting all posts"
        })
        return
    }   
})

// get my posts
viewPostHandler.get("/myPosts", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id;

        const posts = await postModel.find({ postedBy: userId }).sort({ createdAt: -1});

        if(!posts){
            res.status(401).json({
                msg: "User posts not found"
            })
            return
        }

        const processedPosts = posts.map(post => {
            const isLiked = post.likes.includes(new mongo.ObjectId(userId?.toString()));
            
            return {
                ...post._doc,
                isLiked
            };
        });

        res.status(200).json(processedPosts)
    }
    catch (e) {
        console.error("Error while getting my posts")
        res.status(401).json({
            msg: "Error while getting my posts"
        })
        return
    }
})

// get other user's post
viewPostHandler.get("/:id", async (req: Request, res: Response) => {
    try{
        const otherUserId = req.params.id;
        const currentUserId = req.user._id;

        const posts = await postModel.find({ postedBy: otherUserId }).sort({ createdAt: -1});

        if(!posts){
            res.status(401).json({
                msg: "User posts not found"
            })
            return
        }

        // Process posts to include isLiked status
        const processedPosts = posts.map(post => {
            const isLiked = post.likes.includes(new mongo.ObjectId(currentUserId?.toString()));
            
            return {
                ...post._doc,
                isLiked
            };
        });

        res.status(200).json(processedPosts)
    }
    catch (e) {
        console.error("Error while getting all posts")
        res.status(401).json({
            msg: "Error while getting all posts"
        })
        return
    }
})

export default viewPostHandler;