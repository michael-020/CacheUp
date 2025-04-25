import { Request, Response } from "express";
import { z } from "zod";
import { commentForumModel, postForumModel, threadForumModel, watchNotificationModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";


export const createCommentForumHandler = async (req: Request, res: Response) => {
    const commentSchema = z.object({
        content: z.string().min(1)
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

        // Populate the created comment with user data
        const populatedComment = await commentForumModel.findById(commentMongo._id)
            .populate('createdBy', '_id username profilePicture');

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
        
        const post = await postForumModel.findById(postMongo)
        const thread = await threadForumModel.findById(post?.thread)
       
        const watchers = thread?.watchedBy?.filter((id) => id.toString() !== req.user._id.toString())
        
        if(watchers && watchers.length > 0){
            await watchNotificationModel.create({
                userIds: watchers,
                message: `${req.user.name} created a comment in ${thread?.title}`,
                threadId: thread?._id,
                seenBy: [],
                postId: post?._id,
                createdBy: req.user._id
            })
        }

        // Update post's comment count
        if (post) {
            const commentCount = await commentForumModel.countDocuments({ post: postMongo });
            post.commentsCount = commentCount;
            await post.save();
        }
        
        res.json({
            msg: "Comment Uploaded Successfully",
            commentMongo: populatedComment,
            commentWeaviate,
            commentCount: post?.commentsCount || 0
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}