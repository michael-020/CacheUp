import { Request, Response } from "express";
import { postForumModel, threadForumModel, userModel } from "../../models/db";

export const getAllPostsFromAThreadHandler = async (req: Request, res: Response) => {
    try {
        const { threadId } = req.params;

        const posts = await postForumModel
            .find({ thread: threadId, visibility: true })
            .sort({ createdAt: -1 })
            .populate({
                path: "createdBy",
                select: "_id username profilePicture" 
            });
        
        const thread = await threadForumModel.findById(threadId)

        res.json({
            msg: "Posts Fetched successfully",
            posts,
            threadTitle: thread?.title,
            threadDescription: thread?.description,
            threadMongo: thread?._id,
            threadWeaviate: thread?.weaviateId,
            watchedBy: thread?.watchedBy
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            msg: "Server error"
        });
    }
};
