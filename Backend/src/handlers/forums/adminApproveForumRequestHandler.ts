import { Request, Response } from "express";
import { forumModel, requestForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";

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
        
        const forumMongo = await forumModel.create({
            title: requestedForum.title,
            description: requestedForum.description,
            createdBy: req.admin._id,
            weaviateId: "temp"
        })
        
        try {
            const vector = await embedtext(requestedForum.title + " " + requestedForum.description)


            const forumWeaviate = await weaviateClient.data.creator()
                .withClassName("Forum")
                .withProperties({
                    title: requestedForum.title,
                    description: requestedForum.description,
                    mongoId: forumMongo._id
                })
                .withVector(vector)
                .do()
    
            forumMongo.weaviateId = forumWeaviate.id as string
            
            requestedForum.status = "approved"
    
            await Promise.all([
                forumMongo.save(),
                requestedForum.save()
            ])
    
            res.json({
                msg: "Request approved",
                forumMongo,
                forumWeaviate,
                requestedForum
            })
    
        } catch (error) {
            await forumModel.findByIdAndDelete(forumMongo)
            console.error(error)
            res.status(500).json({
                msg: "Could not approve request"
            })
        }

    } catch (e) {
        console.error("Error approving forum request:", e);
        res.status(500).json({
            msg: "Server error while approving forum request"
        });
    }
};