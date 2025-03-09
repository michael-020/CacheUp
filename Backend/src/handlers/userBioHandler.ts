import  { Router, Request, Response } from "express";
import { userModel } from "../models/db";


const userBioHanler: Router = Router();

// use zod 

// set bio
userBioHanler.post("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { content } = req.body

        const user = await userModel.findById(userId)

        if(!user) {
            res.status(403).json({
                msg: "user not found"
            })
            return
        }

        user.bio = content

        user.save();

        res.status(200).json({
            bio: user.bio
        })
    }
    catch(e) {
        console.error("Error while setting bio")
    }
})
// i think the post request isn't even necessary as it is set as an empty string in the database itself by default

// update bio 
userBioHanler.put("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id
        const { bio } = req.body

        const user = await userModel.findById(userId)

        if(!user) {
            res.status(403).json({
                msg: "user not found"
            })
            return
        }

        user.bio = bio

        user.save();

        res.status(200).json({
            msg: "Bio updated successfully",
            bio
        })
    }
    catch(e) {
        console.error("Error while updating bio")
    }
})

// delete bio
userBioHanler.delete("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id

        const user = await userModel.findById(userId)

        if(!user) {
            res.status(403).json({
                msg: "user not found"
            })
            return
        }

        user.bio = ""

        user.save();

        res.status(200).json({
            bio: user.bio
        })
    }
    catch(e) {
        console.error("Error while updating bio")
    }
})

export default userBioHanler;