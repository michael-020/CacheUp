import { Request, Response } from "express";
import { z } from "zod";
import { commentForumModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";


export const editCommentForumHandler = async (req: Request, res: Response)=> {
    const commentSchema = z.object({
        content: z.string().min(1)
    })
    try{
        const userId = req.user._id
        const { mongoId, weaviateId } = req.params;
        const response = commentSchema.safeParse(req.body)
        if(!response.success){
            res.status(411).json({
                msg: "Please enter some text"
            })
            return
        }
        const { content } = req.body;
        const commentMongo = await commentForumModel.findById(mongoId)
        if(commentMongo?.createdBy.toString() !== userId.toString()){
            res.status(401).json({
                msg: "You are not the one who created the comment"
            })
            return
        }
        commentMongo.content = content;
        await commentMongo.save()
        const commentWeaviate = await weaviateClient.data.updater()
            .withClassName("Comment")
            .withId(weaviateId)
            .withProperties({
                content
            })
            .do()
        res.json({
            msg: "Comment Updated",
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