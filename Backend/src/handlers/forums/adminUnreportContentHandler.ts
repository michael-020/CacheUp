import { Request, Response } from "express";
import { z } from "zod";
import { commentForumModel, postForumModel, threadForumModel } from "../../models/db";


export const adminUnreportContentHandler = async(req:Request, res: Response) => {
    const inputTypeSchema = z.object({
        type: z.enum(['thread', 'post', 'comment'])
    })
    try {
        const { type } = req.body;
        const { id } = req.params
        const response = inputTypeSchema.safeParse({type})
        if(!response.success){
            res.status(411).json({
                msg: "Please provide correct content type"
            })
            return
        }
        let data;
        switch(response.data.type) {
            case 'thread' :
                data = await threadForumModel.findByIdAndUpdate(id, {reportedBy: []})
                break;
            case 'post' :
                data = await postForumModel.findByIdAndUpdate(id, {reportedBy: []})
                break;
            case 'comment' : 
                data = await commentForumModel.findByIdAndUpdate(id, {reportedBy: []})
        }
        res.json({
            data,
            msg: "Unreport successfull"
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Server error"
        })
    }
}