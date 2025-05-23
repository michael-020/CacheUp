import { Request, Response } from "express";
import { userModel } from "../models/db";
import { loggingService } from "../services/loggingService";

export const deleteAccountHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id

        await userModel.findByIdAndUpdate(userId, {visibility: false})

        await loggingService.createLogoutLog(req.user._id.toString(), req);
                
        res.cookie("jwt", "", { maxAge: 0 });
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