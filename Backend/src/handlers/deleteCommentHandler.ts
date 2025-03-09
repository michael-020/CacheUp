import { Request, Response } from "express";
import { postModel } from "../models/db";

export const deleteCommentHandler = async (req: Request, res: Response) => {
    try{
        const { postId, commentId } = req.params;
        const userId = req.user._id;

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
            res.status(403).json({ message: "You can only delete your own comments" });
            return;
        }

        await post.updateOne({
            $pull: { comments: { _id: commentId } }
        });

        res.status(200).json({ 
            message: "Comment deleted successfully"
        });
    }
    catch (e) {
        console.error("Error while uploading a comment", e)
        res.status(401).json({
            msg: "Error while uploading a comment"
        })
        return
    }
}

export const adminDeleteCommentHandler =  async (req: Request, res: Response) => {
    try{
        const { postId, commentId } = req.params;

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

        await post.updateOne({
            $pull: { comments: { _id: commentId } }
        });

        res.status(200).json({ 
            message: "Comment deleted successfully"
        });
    }
    catch (e) {
        console.error("Error while uploading a comment", e)
        res.status(401).json({
            msg: "Error while uploading a comment"
        })
        return
    }
}