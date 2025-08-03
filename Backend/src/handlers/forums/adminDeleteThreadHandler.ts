import { Request, Response } from "express";
import { deleteThread } from "./utils/deleteThread";


export const adminDeleteThreadHandler = async (req: Request, res: Response) => {
    try{
        const { mongoId, vectorId } = req.params;
    if(!(mongoId || vectorId)){
        res.status(411).json({
            msg: "Please provide both the ids"
        })
        return;
    }
    const result = await deleteThread(mongoId, vectorId)
    if(!result.success){
        res.status(500).json({
            msg: result.msg
        })
        return
    }
    res.json({
        msg: "Deleted the thread successfully"
    })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Server Error"
        })
    }
}