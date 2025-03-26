import { Request, Response } from "express";
import { userModel } from "../models/db";

export const getUsernameHandler =  async (req: Request, res: Response) => {
    try {
        const users = await userModel.find({ _id: { $ne: req.user._id } });

        if (!users || users.length === 0) {
            res.status(404).json({
                msg: "No users found"
            });
            return;
        }

        res.status(200).json({
            users: users.map(u => ({
                _id: u._id,
                username: u.username, 
                profilePicture: u.profilePicture
            }))
        });
    } catch (error) {
        console.error("Error while getting usernames", error)
        res.status(500).json({
            msg: "Error while getting usernames"
        })
    }
}