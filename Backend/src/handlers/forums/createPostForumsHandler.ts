import { Request, Response } from "express";
import { z } from "zod";
import { postForumModel, threadForumModel, watchNotificationModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";


export const createPostForumshandler = async (req: Request, res: Response) => {
    const createPostSchema = z.object({
        content: z.string().min(2)
    })

    try{
        const response = createPostSchema.safeParse(req.body);
        if(!response.success){
            res.status(411).json({
                msg: "Enter correct details"
            })
            return;
        }
        const { content } = req.body
        const {threadMongo, threadWeaviate} = req.params
        const createdBy = {
            _id: req.user._id,
            username: req.user.username,
            profileImage: req.user.profilePicture || "",
        }

        const postMongo = await postForumModel.create({
            content,
            thread: threadMongo,
            createdBy,
            weaviateId: "temp"
        })

        const vector = await embedtext(content)
        const postWeaviate = await weaviateClient.data.creator()
            .withClassName("Post")
            .withProperties({
                content,
                thread: [{ 
                    beacon: `weaviate://localhost/Thread/${threadWeaviate}` 
                }],
                mongoId: postMongo._id
            })
            .withVector(vector)
            .do()
        
        postMongo.weaviateId = postWeaviate.id as string 
        await postMongo.save()

        const thread = await threadForumModel.findById(threadMongo)
        const watchers = thread?.watchedBy?.filter((id) => id.toString() !== req.user._id.toString())
        if(watchers && watchers.length > 0) {
            await watchNotificationModel.create({
                userIds: watchers,
                message: `${req.user.username} created a new post ${postMongo._id} in ${thread?.title}`,
                threadId: thread?._id,
                seenBy: []
            })
        }

        res.json({
            msg: "Post created successfully",
            postMongo,
            postWeaviate
        })

        }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "INternal server error"
        })
    }
}