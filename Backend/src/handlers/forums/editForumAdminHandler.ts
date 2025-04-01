import { Request, Response } from "express";
import { z } from "zod";
import { forumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { weaviateClient } from "../../models/weaviate";


export const editForumAdminHandler = async(req: Request, res: Response) => {
    const forumSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional()
    })
    try{    
        const { mongoId, weaviateId } = req.params
        if(!(mongoId || weaviateId)) {
            res.status(411).json({
                msg: "Please provide ids"
            })
            return
        }
        
        const response = forumSchema.safeParse(req.body)
        if(!response.success){
            res.status(411).json({
                msg: "Please enter details"
            })
            return
        }

        const forumMongo = await forumModel.findById(mongoId)
        if(!forumMongo){
            res.status(404).json({
                msg: "Cannot find the forum"
            })
            return
        }

        let { title, description } = req.body
        title = title && title.trim() !== "" ? title : forumMongo.title
        description = description && description.trim() !== "" ? description : forumMongo.description

        const vector = await embedtext(title + " " + description)

        forumMongo.title = title
        forumMongo.description = description
        await forumMongo.save()

        const forumWeaviate = await weaviateClient.data.updater()
            .withClassName("Forum")
            .withId(weaviateId)
            .withProperties({
                title,
                description
            })
            .withVector(vector)
            .do()

        res.json({
            msg: "updated successfully",
            forumMongo,
            forumWeaviate
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "server error"
        })
    }
}