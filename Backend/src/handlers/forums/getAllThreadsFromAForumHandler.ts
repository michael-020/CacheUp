import { Request, Response } from "express";
import { forumModel, threadForumModel } from "../../models/db";


export const getAllThreadsFromAForumHandler = async(req: Request, res: Response) => {
    try{
        const { forumId } = req.params 
        const [allThreads, forum] = await Promise.all([threadForumModel.find({
            forum: forumId,
            visibility: true
        }).lean(), 
            forumModel.findById(forumId).lean()
        ])
        res.json({
            msg:"All your forums",
            allThreads,
            forum
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server error"
        })
    }
}