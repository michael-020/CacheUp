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
        
        const { title, description } = response.data;
        const { forumMongoId, forumWeaviateId } = req.params
        
        const threadMongo = await threadForumModel.create({
            title,
            description,
            forum: forumMongoId,
            createdBy: req.user._id
        });

        if(!threadMongo){
            res.status(500).json({ 
                msg: "Failed to create thread in Mongo" 
            });
            return
        }

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

        if (!threadWeaviate?.id) {
            await threadMongo.deleteOne();
            res.status(500).json({ 
                msg: "Failed to create thread in Weaviate" 
            });
            return;
        }

        threadMongo.weaviateId = threadWeaviate.id;
        await threadMongo.save();

        res.status(201).json({
            msg: "Thread created successfully",
            threadMongo,
            threadWeaviate
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}