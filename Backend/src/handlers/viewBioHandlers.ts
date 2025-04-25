import { Router, Request, Response } from "express";
import { userModel } from "../models/db";


const viewBioHandler: Router = Router();

// get my bio
viewBioHandler.get("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        
        const user = await userModel.findById(userId)

        if(!user) {
            res.status(403).json({
                msg: "user not found"
            })
            return
        }

        res.status(200).json({
            bio: user.bio
        })
    }
    catch(e) {
        console.error("Error while setting bio")
    }
})

// get other's bio 
viewBioHandler.get("/:id", async (req: Request, res: Response) => {
    try{
        const userId = req.params.id

        const user = await userModel.findById(userId)

        if(!user || (user.visibility === false)) {
            res.status(403).json({
                msg: "user not found"
            })
            return
        }

        res.status(200).json({
            bio: user.bio
        })
    }
    catch(e) {
        console.error("Error while updating bio")
    }
})



export default viewBioHandler;