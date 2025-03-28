import { Request, Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import { postModel, userModel } from '../models/db';
import { IPost, IUser, Comment } from '../models/db';
import { mongo } from 'mongoose';

// Define a type for processed comments
type ProcessedComment = Omit<Comment, 'user'> & { 
    user: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profileImagePath?: string;
    } | null;
};

export const getCommentHandler = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        
        const post = await postModel.findById(postId);
        if (!post) {
            res.status(404).json({
                message: "Post not found"
            });
            return;
        }

        const comments = [...post.comments]; // Create a copy to avoid mutating the original

        // Sort comments by date in descending order
        comments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Process comments with user information
        const processedComments: ProcessedComment[] = await Promise.all(comments.map(async (comment): Promise<ProcessedComment> => {
            try {
                // If comment.user is null or undefined, return null user
                if (!comment.user) {
                    return {
                        ...comment,
                        user: null
                    } as ProcessedComment;
                }

                const commentUser = await userModel.findById(comment.user);
                
                if (!commentUser) {
                    // Handle case where user might have been deleted
                    return {
                        ...comment,
                        user: null
                    } as ProcessedComment;
                }

                return {
                    ...comment._doc,
                    user: {
                        _id: commentUser._id,
                        username: commentUser.username,
                        profileImagePath: commentUser.profilePicture
                    }
                } as ProcessedComment;
            } catch (userError) {
                console.error("Error fetching user for comment:", userError);
                return {
                    ...comment,
                    user: null
                } as ProcessedComment;
            }
        }));

        res.status(200).json(processedComments);
    } catch (error) {
        console.error("Error while getting comments from a post", error);
        res.status(500).json({
            message: "Internal server error while fetching comments"
        });
    }
};