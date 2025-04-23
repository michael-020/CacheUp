import { z } from "zod";
import bcrypt from "bcrypt"
import { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/db";
import JWT_SECRET from "../config";
import mongoose from "mongoose";
import { generateToken } from "../lib/utils";

export const loginHandler: RequestHandler = async (req: Request, res: Response) => {
    const mySchema = z.object({
        email: z.string().email().refine(val => val.endsWith("@pvppcoe.ac.in"), {
            message: "Only Emails existing with @pvppcoe.ac.in can login"
        }),
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
        const  user = await userModel.findOne({email});

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

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            department: user.department,
            graduationYear: user.graduationYear,
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