import { Request, Response } from "express";
import { forumModel } from "../models/db";


export const getAllForumsHandler = async (req: Request, res: Response) => {
    const allForums = await forumModel.find({});
    res.json({
        msg: "All the forums",
        allForums
    })
}