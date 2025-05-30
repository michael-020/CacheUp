import { Request, Response } from "express";
import { forumModel, requestForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";
import { validateWeaviateCreate } from './utils/validateWeaviateCreate';

export const adminApproveForumHandler = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params;
        const requestedForum = await requestForumModel.findById(requestId);

        if (!requestedForum) {
            res.status(404).json({
                msg: "Request not found"
            });
            return;
        }
        
        // Check for duplicate title only among visible forums
        const existingForum = await forumModel.findOne({ 
            title: requestedForum.title,
            visibility: true 
        });

        if (existingForum) {
            res.status(409).json({ 
                msg: "A forum with this title already exists" 
            });
            return;
        }

        const [forumMongo, vector] = await Promise.all([
            forumModel.create({
                title: requestedForum.title,
                description: requestedForum.description,
                createdBy: req.admin._id,
                weaviateId: "temp"
            }),
            embedtext(requestedForum.title + " " + requestedForum.description)
        ]);

        const forumWeaviate = await weaviateClient.data.creator()
            .withClassName("Forum")
            .withProperties({
                title: requestedForum.title,
                description: requestedForum.description,
                mongoId: forumMongo._id as string  // Ensure mongoId is a string
            })
            .withVector(vector)
            .do();

        const isValid = await validateWeaviateCreate(
            forumMongo,
            forumWeaviate,
            res,
            'forum',
            async () => { await forumMongo.deleteOne(); }
        );

        if (!isValid) return;
        
        forumMongo.weaviateId = forumWeaviate.id as string;
        requestedForum.status = "approved";

        await Promise.all([
            forumMongo.save(),
            requestedForum.save()
        ]);

        res.json({
            msg: "Request approved",
            forumMongo,
            forumWeaviate,
            requestedForum
        });

    } catch (e) {
        console.error("Error approving forum request:", e);
        res.status(500).json({
            msg: "Server error while approving forum request"
        });
    }
};