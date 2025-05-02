import { z } from "zod";
import bcrypt from "bcrypt"
import { Request, RequestHandler, Response } from "express";
import { userModel } from "../models/db";
import mongoose from "mongoose";
import { generateToken } from "../lib/utils";
import { loggingService } from '../services/loggingService';

export const loginHandler: RequestHandler = async (req: Request, res: Response) => {
    const mySchema = z.object({
        email: z.string().email(),
        password: z.string()
    }). strict({
        message: "Extra fields are not allowed"
    })

    const response = mySchema.safeParse(req.body);

    if(!response.success){
        res.status(411).json({
            msg: "Incorrect Format",
            error: response.error.errors
        })
        return;
    }

    const {email, password} = req.body;

    try{
        const user = await userModel.findOne({ email }).lean();

        if(!user){
            res.status(403).json({
                msg: "Incorrect Email or User Doesn't Exist"
            })
            return;
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword){
            res.status(403).json({
                msg: "Incorrect Password"
            })
            return
        }

        generateToken(new mongoose.Types.ObjectId(user._id), res);

        // Add logging after successful login
        await loggingService.createLoginLog(user._id.toString(), req);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            friends: user.friends,
            posts: user.posts, 
            friendRequests: user.friendRequests
        })
    }
    catch (e) {
        console.error("Error while signing in")
        res.status(500).json({
            msg: "Error while signing in",
            error: e
        })
        return;
    }
}
