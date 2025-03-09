import {  Router, Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { mongo } from "mongoose";

const likeHandler: Router = Router();

// like/unlike a post
likeHandler.put("/:id", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id;
        const postId = req.params.id

        if(!userId)
            return

        const post = await postModel.findById(postId)
        if(!post){
            res.status(401).json({
                msg: "Post not found"
            })
            return
        }

        const userObjectId = new mongo.ObjectId(userId as string)

        const isLiked = post.likes.includes(userObjectId);
        if(isLiked){
            post.likes = post.likes.filter(id => id.toString() !== userId.toString())
        }
        else {
            post.likes.push(userObjectId);
        }

        await post.save()

        const likedUsers = await userModel.find({ _id: { $in: post.likes } }, 'username profileImagePath');

        res.json({ 
            message: isLiked ? "Post unliked" : "Post liked", 
            likes: post.likes,
            likedUsers: likedUsers
        });
    }
    catch(e) {
        console.error("Error while liking a post")
        res.status(401).json({
            msg: "Error while liking a post"
        })
        return
    }
})

// get users who have like a post
likeHandler.get("/:id", async (req: Request, res: Response) => {
    try{
        const postId = req.params.id

        const post = await postModel.findById(postId)

        if(!post){
            res.status(401).json({
                msg: "Post not found"
            })
            return;
        }

        const likedUsers = await userModel.find({ _id: { $in: post.likes }}, "username profileImagePath")

        if(!likedUsers){
            res.status(401).json({
                msg: "Liked users not found"
            })
            return;
        }

        res.status(200).json({
            likedUsers
        })
    }
    catch (e) {
        console.error("Error while liking a post")
        res.status(401).json({
            msg: "Error while liking a post"
        })
        return
    }
})

export default likeHandler;