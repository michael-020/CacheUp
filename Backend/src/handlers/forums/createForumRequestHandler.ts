import { Request, Response } from "express";
import { z } from "zod";
import { forumModel, requestForumModel } from "../../models/db";


export const createForumRequestHandler = async(req:Request, res: Response) => {
    const requestForumSchema = z.object({
        title: z.string().min(2),
        description: z.string().min(2)
    })
    try{
        const response = requestForumSchema.safeParse(req.body)
        if(!response.success){
            res.status(411).json({
                msg: "Please fill the details correctly"
            })
            return
        }
        const { title, description } = req.body
        const exists = await forumModel.findOne({title})
        if(exists) {
            res.status(400).json({
                msg: "forum already exists",
                exists
            })
            return
        }

        const requestForum = await requestForumModel.create({
            title,
            description,
            requestedBy: req.user._id,
        })
        res.json({
            msg: "Request Successfull",
            requestForum
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}