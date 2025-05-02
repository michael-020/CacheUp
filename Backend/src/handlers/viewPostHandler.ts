import { Router, Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { mongo } from "mongoose";

const viewPostHandler: Router = Router();

// get all posts
viewPostHandler.get("/", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 5; // Default 5 posts per page
        const skip = (page - 1) * limit;
        
        // Get total count for checking if more posts exist
        const totalPosts = await postModel.countDocuments({ visibility: true });
        
        // Get posts for infinite scroll
        const allPosts = await postModel
            .find({ visibility: true })
            .populate("comments.user", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        if (!allPosts || allPosts.length === 0) {
            res.status(200).json({
                posts: [],
                hasMore: false,
                nextPage: null
            });
            return;
        }

        const userIdStr = userId.toString();
        
        const processedPosts = allPosts.map(post => {
            const isReported = post.reportedBy.map(id => id.toString()).includes(userIdStr);
            const isLiked = post.likes.map(id => id.toString()).includes(userIdStr);
            const isSaved = post.savedBy.map(id => id.toString()).includes(userIdStr);
            const visibleComments = post.comments.filter(comment => comment.visibility !== false);
            
            return {
                ...post,
                isReported,
                reportButtonText: isReported ? 'Unreport' : 'Report',
                reportCount: post.reportedBy.length,
                isLiked, 
                isSaved,
                comments: visibleComments
            };
        });

        // Check if there are more posts to load
        const hasMore = totalPosts > skip + allPosts.length;

        res.status(200).json({
            posts: processedPosts,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });
    } catch (e) {
        console.error("Error while getting all posts", e);
        res.status(401).json({
            msg: "Error while getting all posts"
        });
        return;
    }
});

// get a specific post
viewPostHandler.get("/get-post/:postId", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const postId = req.params.postId;
        const post = await postModel
            .findById(postId)
            .populate("comments.user", "username profilePicture") // Added population for comments
            .sort({ createdAt: -1 })
            .lean();

        if (!post || (post.visibility === false)) {
            res.status(401).json({
                msg: "No post found"
            });
            return;
        }

        const isReported = post.reportedBy.includes(userId);
        const isLiked = post.likes.includes(userId);
        const isSaved = post.savedBy.includes(userId);

        const processedPost = {
            ...post._doc,
            isReported,
            reportButtonText: isReported ? 'Unreport' : 'Report',
            reportCount: post.reportedBy.length,
            isLiked,
            isSaved
        };

        res.status(200).json(processedPost);
    } catch (e) {
        console.error("Error while getting post", e);
        res.status(401).json({
            msg: "Error while getting post"
        });
        return;
    }
});

// get my posts
viewPostHandler.get("/myPosts", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        const posts = await postModel
            .find({ postedBy: userId, visibility: true })
            .populate("comments.user", "username profilePicture") // Added population for comments
            .sort({ createdAt: -1 })
            .lean();

        if (!posts) {
            res.status(401).json({
                msg: "User posts not found"
            });
            return;
        }

        const processedPosts = posts.map(post => {
            const isLiked = post.likes.includes(new mongo.ObjectId(userId?.toString()));
            
            return {
                ...post._doc,
                isLiked
            };
        });

        res.status(200).json(processedPosts);
    } catch (e) {
        console.error("Error while getting my posts", e);
        res.status(401).json({
            msg: "Error while getting my posts"
        });
        return;
    }
});

// get other user's post
viewPostHandler.get("/:id", async (req: Request, res: Response) => {
    try {
        const otherUserId = req.params.id;
        const currentUserId = req.user._id;

        const posts = await postModel
            .find({ postedBy: otherUserId, visibility: true })
            .populate("comments.user", "username profilePicture") // Added population for comments
            .sort({ createdAt: -1 })
            .lean();

        if (!posts) {
            res.status(401).json({
                msg: "User posts not found"
            });
            return;
        }

        const processedPosts = posts.map(post => {
            const isLiked = post.likes.includes(new mongo.ObjectId(currentUserId?.toString()));
            
            return {
                ...post._doc,
                isLiked
            };
        });

        res.status(200).json(processedPosts);
    } catch (e) {
        console.error("Error while getting user posts", e);
        res.status(401).json({
            msg: "Error while getting user posts"
        });
        return;
    }
});

export default viewPostHandler;