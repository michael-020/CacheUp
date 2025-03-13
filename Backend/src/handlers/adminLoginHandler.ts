import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { adminModel } from "../models/db"
import JWT_SECRET from "../config"
import { generateToken } from "../lib/utils"
import mongoose from "mongoose"


export const adminLoginHandler = async (req: Request, res: Response) => {
    try {
        const { adminId, password }  = req.body

        const admin = await adminModel.findOne({adminId})

        if(!admin){
            res.status(401).json({
                msg: "Admin not found or Incorrect credentials"
            })
            return
        }

        const checkPassword = await bcrypt.compare(password, admin.password)

        if(!checkPassword){
            res.status(401).json({
                msg: "Incorrect password"
            })
            return
        }

        generateToken(new mongoose.Types.ObjectId(admin._id as string), res)

        res.status(200).json({
            _id: admin._id,
            name: admin.name,
            adminId,
        })
    }
    catch(e) {
        console.error("Error while loggin admin")
        res.status(401).json({
            msg: "Error while loggin admin"
        })
        return
    }
}