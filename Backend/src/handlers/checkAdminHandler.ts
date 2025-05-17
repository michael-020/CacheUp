import { Request, Response } from "express";

export const checkAdminAuth = async (req: Request, res: Response) => {
    try {   
        res.status(200).json(req.admin)
        
    } catch (error) {
        console.error("Error while checking auth")
        res.status(500).json({
            msg: "Error while checking auth"
        })
        return
    }
}