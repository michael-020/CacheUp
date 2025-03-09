import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";


export const uploadPostsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const text = req.body.text || ""; 
        const imagePath = req.file ? `/uploads/userPostsImages/${req.file.filename}` : null;

        // Validate text length
        if (text.length > 200) {
            res.status(400).json({
                msg: "Text cannot exceed 200 characters",
            });
            return;
        }


        if (!text && !req.file) {
            res.status(400).json({
                msg: "Please upload a text content or a picture or both",
            });
            return;
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            res.status(404).json({
                msg: "User not found"
            });
            return;
        }

        const newPost = await postModel.create({
            postedBy: userId,
            username: user.username,
            userImagePath: user.profileImagePath,
            postsImagePath: imagePath, 
            text,
            likes: [],
            reportedBy: [],
            comments: []
        });

        await userModel.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

        res.status(200).json({
            msg: "Post uploaded successfully",
            post: newPost
        });
    } catch (error) {
        console.error("Error while uploading a post:", error);
        res.status(500).json({
            msg: "Error while uploading a post"
        });
    }
}