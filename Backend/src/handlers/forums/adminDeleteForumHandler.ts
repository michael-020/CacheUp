import { Request, Response } from "express";
import { deleteForum } from "./deleteFunctions/deleteForum";


export const adminDeleteForumHandler = async (req: Request, res: Response) => {
    try{
        const { mongoId, weaviateId } = req.params;
        if(!(mongoId || weaviateId)) {
            res.status(411).json({
                msg: "Please provide correct ids"
            })
            return;
        }
        const results = await deleteForum(mongoId, weaviateId)
        if(!results.success){
            res.status(500).json({
                msg: results.msg
            })
            return;
        }
        res.json({
            msg: "Forum deleted successfully"
        })
    }catch(e){
        console.error(e)
        res.status(500).json({
            msg: "Delete was not successfull"
        })
    }
}