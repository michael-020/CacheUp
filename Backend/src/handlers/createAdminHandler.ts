import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { adminModel } from "../models/db"
import { ADMIN_PASS } from "../config"
export const createAdminHandler = async (req: Request, res: Response) => {
    try {
        const { name, adminId, password, adminPass } = req.body

        const hashedPassword = await bcrypt.hash(password, 6);

        if(adminPass !== ADMIN_PASS){
            res.status(401).json({
                msg: "You are probably not authorized to be a admin"
            })
            return
        }

        await adminModel.create({
            name,
            adminId,
            password: hashedPassword,
            role: ""
        })
        
        res.status(200).json({
            msg: "Admin Created successfully"
        })
    }
    catch(e) {
        console.error("Error while creating admin", e)
        res.status(401).json({
            msg: "Error while creating admin"
        })
    }
}