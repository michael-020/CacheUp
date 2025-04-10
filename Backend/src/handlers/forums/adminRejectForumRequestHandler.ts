import { Request, Response } from "express";
import { requestForumModel } from "../../models/db";


export const adminRejectForumRequestHandler = async (req: Request, res: Response) => {
    try{
        const { requestId } = req.params;
        const requestedForum = await requestForumModel.findByIdAndUpdate(requestId, {status: "rejected"}, {new: true})
        res.json({
            msg: "Rejected Successfully",
            requestedForum
        })        
    }catch(e){
        console.error(e)
        res.status(500).json("Server error")
    }
}