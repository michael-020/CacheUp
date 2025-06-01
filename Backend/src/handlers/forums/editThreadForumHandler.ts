import { Request, Response } from "express";
import { z } from "zod";
import { threadForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { weaviateClient } from "../../models/weaviate";


export const editThreadForumHandler = async (req: Request, res: Response) => {
    
    const threadSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional()
    }) 
    
    try{
        const { mongoId, weaviateId } = req.params;
        if(!(mongoId || weaviateId)){
            res.status(411).json({
                msg: "Please provide ids"
            })
            return
        }

        const response = threadSchema.safeParse(req.body)
        if(!response.success){
            res.status(411).json({
                msg: "Please enter details"
            })
            return
        }
        
        const threadMongo = await threadForumModel.findById(mongoId)
        if(!threadMongo){
            res.status(404).json({
                msg: "Thread not found"
            })
            return
        }

        const userId = req.user._id
        if(threadMongo.createdBy.toString() !== userId.toString()){
            res.status(401).json({
                msg: "You are not authorized to edit this"
            })
            return
        }

        let { title, description } = req.body;
        title = title && title.trim() !== "" ? title : threadMongo.title
        description = description && description.trim() !== "" ? description : threadMongo.description

        const initialTitle = threadMongo.title;
        const initialDescription = threadMongo.description;

        threadMongo.title = title
        threadMongo.description = description
        await threadMongo.save()

        try {
            const vector = await embedtext(title + " " + description)
        
            const threadWeaviate = await weaviateClient.data.updater()
                .withClassName("Thread")
                .withId(weaviateId)
                .withProperties({
                    title,
                    description
                })
                .withVector(vector)
                .do()

            res.json({
                msg: "Updated successfully",
                threadMongo,
                threadWeaviate
            })
        } catch (error) {
            console.error(error)
            threadMongo.title = initialTitle;
            threadMongo.description = initialDescription;
            await threadMongo.save()
            res.status(500).json({
                msg: "Could not edit thread"
            })            
        }
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}