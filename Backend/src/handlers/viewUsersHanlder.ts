import { Request, Response } from "express";
import { userModel } from "../models/db";


export const viewUsersHandler = async (req: Request, res: Response) => {
    try{ 
        const userList = await userModel.find({}).sort({ createdAt: -1});

        if(!userList){
            res.status(401).json({
                msg: "User list not found"
            })
        }

        res.status(200).json(
            userList
        )
    } 
    catch(e) {
        console.error("Error while views user list or count");
        res.status(401).json({
            msg: "Error while views user list or count"
        })
        return;
    }
}