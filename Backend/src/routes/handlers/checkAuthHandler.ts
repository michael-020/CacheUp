import { Request, Response } from "express";
import { userModel } from "../../models/db";


export const checkAuth = async (req: Request, res: Response) => {
    try {   
        res.status(200).json(req.user)
        
    } catch (error) {
        console.error("Error while checking auth")
        res.status(500).json({
            msg: "Error while checking auth"
        })
        return
    }
}