import { Request, Response } from "express";
import { userModel } from "../models/db";

export const deleteAccountHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id

        await userModel.findByIdAndDelete(userId)

        res.json({
            msg: "Account delete successfully"
        })
    } catch (error) {
        console.error("Error while deleting account", error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}