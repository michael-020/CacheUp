import { Request, Response } from "express";
import { z } from "zod";
import { threadForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";
import { validateWeaviateCreate } from './utils/validateWeaviateCreate';

export const createThreadHandler = async (req: Request, res: Response) => {
    const createThreadSchema = z.object({
        title: z.string(),
        description: z.string()
    })
    
    try {
        const response = createThreadSchema.safeParse(req.body)
        if (!response.success) {
            res.status(411).json({ msg: "Invalid Details" })
            return
        }
        
        const { title, description } = response.data;
        const { forumMongoId, forumWeaviateId } = req.params

        // Check for duplicate title only among visible threads
        const existingThread = await threadForumModel.findOne({ 
            title,
            visibility: true,
            forum: forumMongoId
        });

        if (existingThread) {
            res.status(409).json({ 
                msg: "A thread with this title already exists in this forum" 
            });
            return;
        }
        
        const threadMongo = await threadForumModel.create({
            title,
            description,
            forum: forumMongoId,
            createdBy: req.user._id
        });

        try {
            const vector = await embedtext(`${title} ${description}`);

            const threadWeaviate = await weaviateClient.data.creator()
                .withClassName("Thread")
                .withProperties({
                    title,
                    description,
                    forum: [{ beacon: `weaviate://localhost/Forum/${forumWeaviateId}` }],
                    mongoId: threadMongo._id
                })
                .withVector(vector)
                .do();

            threadMongo.weaviateId = threadWeaviate.id;
            await threadMongo.save();

            res.status(201).json({
                msg: "Thread created successfully",
                threadMongo,
                threadWeaviate
            });
        } catch (error) {
            await threadForumModel.findByIdAndDelete(threadMongo)
            console.error(error)
            res.status(500).json({
                msg: "Error while creating thread"
            })
        }
        
    } catch(e) {
        console.error(e);
        res.status(500).json({
            msg: "Internal server error"
        })
    }
};