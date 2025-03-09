import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { adminModel } from "../models/db"

export const createAdminHandler = async (req: Request, res: Response) => {
    try {
        const { name, adminId, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 6);

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
            msg: "rror while creating admin"
        })
    }
}