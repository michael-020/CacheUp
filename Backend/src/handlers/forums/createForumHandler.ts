import { Request, Response } from "express";
import { z } from "zod";
import { forumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { weaviateClient } from "../../models/weaviate";


export const createForumhandler = async(req: Request, res: Response) => {
    const forumSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(10)
    });

    const response = forumSchema.safeParse(req.body);
    if(!response.success){
        res.status(411).json({
            msg: "Incorrect Format",
            error: response.error.errors
        });
        return;
    }

    try {
        const {title, description} = req.body;

        // Add visibility check
        const existingForum = await forumModel.findOne({ 
            title,
            visibility: true 
        });

        if (existingForum) {
            res.status(409).json({ 
                msg: "A forum with this title already exists" 
            });
            return;
        }

        const forumMongo = await forumModel.create({
            title,
            description,
            createdBy: req.admin._id,
            weaviateId: "temp"
        })

        if (!forumMongo?._id) {
            res.status(500).json({
                msg: "Failed to create forum"
            });
            return;
        }

        const vector = await embedtext(title + " " + description)

        const forumWeaviate = await weaviateClient.data.creator()
            .withClassName("Forum")
            .withProperties({
                title,
                description,
                mongoId: forumMongo._id.toString() // Ensure it's a string
            })
            .withVector(vector)
            .do()

        if (!forumWeaviate?.id) {
            // Rollback MongoDB creation if Weaviate fails
            await forumMongo.deleteOne();
            res.status(500).json({
                msg: "Failed to create forum"
            });
            return;
        }

        forumMongo.weaviateId = forumWeaviate.id;
        await forumMongo.save();

        res.json({
            msg: "Forum created successfully",
            forumMongo,
            forumWeaviate
        });
    } catch(e) {
        console.error("Error creating forum:", e);
        res.status(500).json({msg: "Internal server error"});
    }
}