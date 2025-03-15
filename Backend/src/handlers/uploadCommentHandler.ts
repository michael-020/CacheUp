import { Request, Response } from "express"
import { postModel, userModel } from "../models/db"
import { mongo } from "mongoose"

export const uploadCommentHandler = async (req: Request, res: Response) => {
    try{
        const { content } = req.body
        const postId = req.params.id
        const userId = req.user._id

        const post = await postModel.findById(postId)
        if(!post){
            res.status(401).json({
                msg: "post not found"
            })
            return
        }
        const userIdObject = new mongo.ObjectId(userId?.toString())
      
        post.comments.push({
            content,
            user: userIdObject,
            date: new Date()
        })

        await post.save()

        const user = await userModel.findById(userId)
        if(!user){
            res.status(401).json({
                msg: "User not found"
            })
            return
        }

        const username = user.username
        const profilePicture = user.profilePicture

        const processedComment = {
            content,
            username,
            profilePicture
        }

        res.status(200).json({
            message: "Comment added successfully", 
            processedComment
        })
    }
    catch (e) {
        console.error("Error while uploading a comment", e)
        res.status(401).json({
            msg: "Error while uploading a comment"
        })
        return
    }
}