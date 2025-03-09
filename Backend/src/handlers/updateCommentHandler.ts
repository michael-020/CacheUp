import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";


export const updateCommentHandler = async (req: Request, res: Response) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id;
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ message: "Updated content is required" });
            return;
        }

        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        if (comment.user.toString() !== userId?.toString()) {
            res.status(403).json({ message: "You can only update your own comments" });
            return;
        }

        comment.content = content;
        await post.save();

        const user = await userModel.findById(userId)
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const processedComment = {
            content,
            username: user.username,
            profileImagePath: user.profileImagePath
        }

        res.status(200).json({ 
            message: "Comment updated successfully", 
            updatedComment: processedComment 
        });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ 
            message: "Error updating comment"
        });
    }
}