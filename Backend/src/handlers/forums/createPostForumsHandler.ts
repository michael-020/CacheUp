import { Request, Response } from "express";
import { z } from "zod";
import { postForumModel, threadForumModel, watchNotificationModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";
import { calculatePostPage } from "./utils/pagination";
import { validateWeaviateCreate } from './utils/validateWeaviateCreate';

export const createPostForumshandler = async (req: Request, res: Response) => {
    const createPostSchema = z.object({
        content: z.string().min(2)
    });

    try {
        const response = createPostSchema.safeParse(req.body);
        if (!response.success) {
            res.status(411).json({
                msg: "Enter correct details"
            });
            return;
        }

        const { content } = req.body;
        const { threadMongo, threadWeaviate } = req.params;

        // First create the MongoDB document
        const postMongo = await postForumModel.create({
            content,
            thread: threadMongo,
            createdBy: req.user._id,
            weaviateId: "temp"
        });

        // Ensure we have a valid MongoDB ID
        if (!postMongo?._id) {
            res.status(500).json({
                msg: "Failed to create post - no valid MongoDB ID generated"
            });
            return;
        }

        try {
            const vector = await embedtext(content)
            const postWeaviate = await weaviateClient.data.creator()
            .withClassName("Post")
            .withProperties({
                content,
                thread: [{ beacon: `weaviate://localhost/Thread/${threadWeaviate}` }],
                mongoId: postMongo._id.toString() // Explicitly convert to string
            })
            .withVector(vector)
            .do()
        
            postMongo.weaviateId = postWeaviate.id as string 
            await postMongo.save()

            const thread = await threadForumModel.findById(threadMongo)
            const watchers = thread?.watchedBy?.filter((id) => id.toString() !== req.user._id.toString())
            if(watchers && watchers.length > 0) {
                await watchNotificationModel.create({
                    userIds: watchers,
                    message: `${req.user.username} created a new post in ${thread?.title}`,
                    threadId: thread?._id,
                    seenBy: [],
                    postId: postMongo._id,
                    createdBy: req.user._id
                })
            }

            const pageNumber = await calculatePostPage(threadMongo, String(postMongo._id))

            res.json({
                msg: "Post created successfully",
                postMongo,
                postWeaviate,
                pageNumber
            })
        } catch (error) {
            console.error(error)
            await postForumModel.findByIdAndDelete(postMongo)
            res.status(500).json({
                msg: "INternal server error"
            })
        }
        
        }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Internal server error"
        });
    }
};