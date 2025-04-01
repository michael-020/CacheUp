import { Request, Response } from "express";
import { z } from "zod";
import { postForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";


export const editPostForumHandler = async(req: Request, res: Response) => {
    const postSchema = z.object({
        content: z.string().min(2)
    })
    try{
        const userId = req.user._id;
        const { mongoId, weaviateId } = req.params;
        if(!(mongoId || weaviateId)){
            res.status(411).json({
                msg: "Enter ids"
            })
            return
        }
        const response = postSchema.safeParse(req.body)
        if(!response.success){
            res.status(411).json({
                msg: "Please enter some content"
            })
            return
        }
        const { content } = req.body
        const postMongo = await postForumModel.findById(mongoId)
        if(postMongo?.createdBy.toString() !== userId.toString()){
            res.status(401).json({
                msg: "You are not authorizd to edit this post"
            })
            return
        }
        const vector = await embedtext(content)
        postMongo.content = content
        await postMongo.save()
        const postWeaviate = await weaviateClient.data.updater()
            .withClassName("Post")
            .withId(weaviateId)
            .withProperties({
                content
            })
            .withVector(vector)
            .do()
            
        res.json({
            msg: "Updated successfully",
            postMongo,
            postWeaviate
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "server error"
        })
    }
}