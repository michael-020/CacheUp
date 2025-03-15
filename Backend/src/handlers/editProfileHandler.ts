import { Request, Response } from "express";
import { userModel } from "../models/db";
import { z } from "zod";

const updateSchema = z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    profileImagePath: z.string().optional(), 
    bio: z.string().optional(),

}).strict({message: "Extra fields not allowed"});

export const editProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const updates = req.body;
        const response = updateSchema.safeParse(updates);

        if(!response.success) {
            res.json({msg: "Incorrect format", error: response.error.errors})
            return
        }

        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return 
        }

        if(updates.name && updates.name != "") {
            user.name = updates.name;
        }
        
        if(updates.username && updates.username != "") {
            user.username = updates.username;
        }

        if(updates.profileImagePath && updates.profileImagePath != "") {
            user.profileImagePath = updates.profileImagePath;
        }
        
        if(updates.bio && updates.bio != "") {
            user.bio = updates.bio;
        }
        
        await user.save();
    
        res.status(200).json({ msg: "User updated successfully", user});
    }catch (e) {
        res.status(500).json({ msg: "Error updating the user", error: e });
    }
};


