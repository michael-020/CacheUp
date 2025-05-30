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

        // Check for duplicate title
        const existingThread = await threadForumModel.findOne({ 
            title,
            visibility: true // Only check visible threads
        });

        if (existingThread) {
            res.status(409).json({ 
                msg: "A thread with this title already exists" 
            });
            return;
        }
        
        const threadMongo = await threadForumModel.create({
            title,
            description,
            forum: forumMongoId,
            createdBy: req.user._id,
            weaviateId: "temp"
        }) as any;

        const vector = await embedtext(`${title} ${description}`);

        const threadWeaviate = await weaviateClient.data.creator()
            .withClassName("Thread")
            .withProperties({
                title,
                description,
                forum: [{ beacon: `weaviate://localhost/Forum/${forumWeaviateId}` }],
                mongoId: threadMongo._id.toString()
            })
            .withVector(vector)
            .do();

        const isValid = await validateWeaviateCreate(
            threadMongo,
            threadWeaviate,
            res,
            'thread',
            async () => { await threadMongo.deleteOne(); }
        );

        if (!isValid) return;

        threadMongo.weaviateId = threadWeaviate.id;
        await threadMongo.save();

        res.status(201).json({
            msg: "Thread created successfully",
            threadMongo,
            threadWeaviate
        });
    } catch(e) {
        console.error("Error creating thread:", e);
        res.status(500).json({ msg: "Internal server error" });
    }
};