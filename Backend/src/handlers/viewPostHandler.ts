import { Router, Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { mongo } from "mongoose";

const viewPostHandler: Router = Router();

// get all posts
viewPostHandler.get("/", async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id; 
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const skip = (page - 1) * limit;
        
        const [totalPosts, allPosts] = await Promise.all([
            postModel.countDocuments({ visibility: true }),
            postModel.find({ visibility: true })
                .populate("comments.user", "username profilePicture")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);

        if (!allPosts || allPosts.length === 0) {
            res.status(200).json({
                posts: [],
                hasMore: false,
                nextPage: null
            });
            return;
        }

        const processedPosts =
            allPosts.map(post => {
                const isReported = post.reportedBy.some(id => String(id) === String(userId));
                const isLiked = post.likes.some(id => String(id) === String(userId));
                const isSaved = post.savedBy.some(id => String(id) === String(userId));
                return {
                    ...post,
                    isReported,
                    reportButtonText: isReported ? 'Unreport' : 'Report',
                    reportCount: post.reportedBy.length,
                    isLiked,
                    isSaved
                };
            }) 

        const hasMore = totalPosts > skip + allPosts.length;

        res.status(200).json({
            posts: processedPosts,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        });
    } catch (e) {
        console.error("Error while getting all posts", e);
        res.status(500).json({
            msg: "Error while getting all posts"
        });
    }
});

// get a specific post
viewPostHandler.get("/get-post/:postId", async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
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

        const isReported = post.reportedBy.map(id => id).includes(userId);
        const isLiked = post.likes.map(id => id).includes(userId);
        const isSaved = post.savedBy.map(id => id).includes(userId);

        const processedPost = {
            ...post,
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
            const isLiked = post.likes.map(id => id).includes(userId);
            const isSaved = post.savedBy.map(id => id).includes(userId);
            
            return {
                ...post,
                isLiked,
                isSaved
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
        const currentUserId = req.user?._id;

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

        if(!currentUserId){
            const processedPosts = posts
            res.status(200).json(processedPosts);
            return
        }

        const processedPosts = posts.map(post => {
            const isLiked = post.likes.some(id => String(id) === String(currentUserId));
            const isSaved = post.savedBy.some(id => String(id) === String(currentUserId));
            
            return {
                ...post,
                isLiked,
                isSaved
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