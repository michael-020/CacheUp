import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import path from "path";
import fs from 'fs';

export const deletePostHandler = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId; 
        const userId = String(req.user._id);
        console.log(postId)
        const userPost = await postModel.findById(postId);
        
        if (!userPost) {
            res.status(404).json({
                msg: "Post not found"
            });
            return;
        }   

        if (userId !== userPost.postedBy.toString()) {
            res.status(403).json({
                msg: "You are not authorized to delete this post"
            });
            return;
        }

        if (userPost.postsImagePath) {
            const imagePath = path.join(__dirname, "..", userPost.postsImagePath);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            }
        }

        await postModel.findByIdAndUpdate(postId, {visibility: false});
        
        await userModel.findByIdAndUpdate(userId, { $pull: { posts: postId } });

        res.status(200).json({
            msg: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error while deleting post:", error);
        res.status(500).json({
            msg: "Error while deleting post"
        });
    }
};


export const adminDeletePostHandler = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId; 
        const userPost = await postModel.findById(postId);

        if (!userPost) {
            res.status(404).json({
                msg: "Post not found"
            });
            return;
        }

        const userId = userPost.postedBy;

        if (userPost.postsImagePath) {
            const imagePath = path.join(__dirname, "..", userPost.postsImagePath);


            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            }
        }


        await postModel.findByIdAndDelete(postId);
        
        await userModel.findByIdAndUpdate(userId, { $pull: { posts: postId } });

        res.status(200).json({
            msg: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error while deleting post:", error);
        res.status(500).json({
            msg: "Error while deleting post"
        });
    }
};