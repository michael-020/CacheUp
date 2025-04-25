import { Request, Response } from "express";
import { forumModel } from "../../models/db";


export const getAllForumsHandler = async (req: Request, res: Response) => {
    try{
        const allForums = await forumModel.find({visibility:true});
        res.json({
            msg: "All the forums",
            allForums
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Some internal error"
        })
    }
}