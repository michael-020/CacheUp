import { Request, Response } from "express";
import { deleteThread } from "./deleteFunctions/deleteThread";


export const adminDeleteThreadHandler = async (req: Request, res: Response) => {
    try{
        const { mongoId, weaviateId } = req.params;
    if(!(mongoId || weaviateId)){
        res.status(411).json({
            msg: "Please provide both the ids"
        })
        return;
    }
    const result = await deleteThread(mongoId, weaviateId)
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