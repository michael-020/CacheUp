import { Request, Response } from "express";
import { string, z } from "zod";
import { threadForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";

export const createThreadHandler = async (req: Request, res: Response) => {
    const createThreadSchema = z.object({
        title: z.string(),
        description: z.string()
    })
    
    try {
        // Validate input using Zod schema
        const response = createThreadSchema.safeParse(req.body)
        if (!response.success) {
            res.status(411).json({ msg: "Invalid Details" })
            return
        }
        
        const { title, description } = req.body;
        const {forumMongo, forumWeaviate} = req.params
        
        // Create thread in MongoDB
        const threadMongo = await threadForumModel.create({
            title,
            description,
            forum: forumMongo,
            createdBy: req.user._id,
            weaviateId: "temp"
        })

        // Generate vector embedding for the thread
        const vector = await embedtext(title + " " + description)

        // Create thread in Weaviate with vector embedding
        const threadWeaviate = await weaviateClient.data.creator()
            .withClassName("Thread")
            .withProperties({
                title,
                description,
                forum: [{ 
                    beacon: `weaviate://localhost/Forum/${forumWeaviate}` 
                }],
                mongoId: threadMongo._id as string
            })
            .withVector(vector)
            .do()

        // Update MongoDB thread with Weaviate ID
        threadMongo.weaviateId = threadWeaviate.id as string;
        await threadMongo.save()

        // Respond with success and created thread details
        res.json({
            msg: "Thread created successfully",
            threadMongo,
            threadWeaviate
        })
    } catch(e) {
        console.error(e);
        res.status(500).json({
            msg: "Some server error",
            error: e instanceof Error ? e.message : "Unknown error"
        })
    }
}