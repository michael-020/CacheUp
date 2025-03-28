import { z } from "zod";
import bcrypt from "bcrypt"
import { Request, RequestHandler, Response } from "express";
import { userModel } from "../models/db";
import { generateToken } from "../lib/utils";
import mongoose, { Mongoose, ObjectId } from "mongoose";

export const signupHandler: RequestHandler =  async (req: Request, res: Response) => {
    const mySchema = z.object({
        name: z.string().min(1, "Name is required"),
        username: z.string().min(1, "Username is required"),
        email: z.string().email().refine((val) => val.endsWith('@pvppcoe.ac.in'), {
          message: "Only Emails ending with @pvppcoe.ac.in can register"
        }),
        password: z.string()
          .min(8, "Password should be at least 8 characters")
          .max(100, "Password should not exceed 100 characters")
          .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
          .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
          .regex(/[0-9]/, "Password must contain at least 1 number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character"),
        department: z.string().min(1, "Department is required"),
        graduationYear: z.string(),
      }).strict({
        message: "Extra fields are not allowed"
    });
    
    const response = mySchema.safeParse(req.body);

    if(!response.success){
        res.status(411).json({
            message: "Incorrect format",
            error: response.error.errors
        })
        return;
    }

    const { name, username, email, password, department, graduationYear} = response.data

    try{
        const existingUser = await userModel.findOne({ $or: [{email}, {username}] })
        if(existingUser) {
            if(existingUser.email === email){
                res.status(500).json({
                    msg: "Email is already registered, Please Login"
                })
                return;
            }
            if(existingUser.username === username){
                res.status(500).json({
                    msg: "Username already exists"
                })
                return;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            name, 
            username,
            email,
            password: hashedPassword,
            department,
            graduationYear,
            bio: "",
            posts: [],
            friends: [],
            friendRequests: [],  
        })

        generateToken(new mongoose.Types.ObjectId(newUser._id), res);

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            department: newUser.department,
            graduationYear: newUser.graduationYear,
        })
    }
    catch (e) {
        console.error("error while siging up", e)
        res.status(400).json({
            msg: "error occured while signing up",
            error: e
        })
        return;
    }
}