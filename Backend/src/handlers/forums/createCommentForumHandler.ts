import { Request, Response } from "express";
import { z } from "zod";
import { commentForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";


export const createCommentForumHandler = async (req: Request, res: Response) => {
    const commentSchema = z.object({
        content: z.string()
    })
    try{
        const response = commentSchema.safeParse(req.body);
        if(!response.success){
            res.status(411).json({
                msg: "Invalid Details"
            })
            return;
        }
        const { content } = req.body 
        const {postMongo, postWeaviate} = req.params
        const commentMongo = await commentForumModel.create({
            content,
            weaviateId: "temp",
            post: postMongo,
            createdBy: req.user.id
        })

        const vector = await embedtext(content)

        const commentWeaviate = await weaviateClient.data.creator()
            .withClassName("Comment")
            .withProperties({
                content,
                posts: [{ 
                    beacon: `weaviate://localhost/Post/${postWeaviate}` 
                }],
                mongoId: commentMongo._id as string
            })
            .withVector(vector)
            .do()

        commentMongo.weaviateId = commentWeaviate.id as string
        await commentMongo.save()

        res.json({
            msg: "Comment Uploaded Successfully",
            commentMongo,
            commentWeaviate
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}