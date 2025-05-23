import { Request, Response } from "express"
import { adminModel, userModel } from "../models/db"


export const adminInfoHandler =  async (req: Request, res: Response) => {
    const uniqueId = req.user._id
    try{
        const admin = await adminModel.findById(uniqueId)

        if(!admin){
            res.status(403).json({
                msg: "admin not found"
            })
        }

        const users = await userModel.find({})
        const userCount = users.length

        const newInfo = {
            ...admin?._doc,
            userCount
        }

        res.json({
            msg: "Admin data fetched successfully",
            adminInfo: newInfo
        })
    }
    catch(e){
        console.log(e)
    }
}