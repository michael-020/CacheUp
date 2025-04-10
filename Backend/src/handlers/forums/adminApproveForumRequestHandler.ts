import { Request, Response } from "express";
import { forumModel, requestForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";


export const adminApproveForumHandler = async (req: Request, res: Response) => {
    try{
        const {requestId} = req.params
        const requestedForum = await requestForumModel.findById(requestId)

        if(!requestedForum){
            res.status(404).json({
                msg: "Request not found"
            })
            return
        }
        
        const [forumMongo, vector] = await Promise.all([
            forumModel.create({
                title: requestedForum.title,
                description: requestedForum.description,
                createdBy: req.admin._id,
                weaviateId: "temp"
            }),
            embedtext(requestedForum.title + " " + requestedForum.description)
        ])

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

    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}