import { Router, Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { upload } from "../middlewares/upload";
import path from 'path';
import fs from 'fs';
import cloudinary from "../lib/cloudinary";

const PfpHanler: Router = Router();

const UPLOADS_BASE_PATH = path.join(process.cwd(), 'uploads');

// set/change pfp
PfpHanler.put("/", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        // const profileImagePath = req.file ? `/uploads/profileImages/${req.file.filename}` : undefined;
        const profilePic = req.body.profilePicture
        if(!profilePic){
            res.status(401).json({
                msg: "profile picture not provided"
            })
            return
        }

        if (profilePic && profilePic.length > 10 * 1024 * 1024) { // 10MB limit for base64
            res.status(413).json({
                msg: "Profile picture is too large"
            });
            return
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            folder: "profile_pictures", 
            transformation: [
                { width: 500, height: 500, crop: "fill" }, 
                { quality: "auto" }
            ]
        })

        const user = await userModel.findById(userId);

        if (!user) {
            res.status(404).json({
                msg: "User not found"
            });
            return;
        }

        user.profilePicture = uploadResponse.url
        await user.save();

        await postModel.updateMany(
            { postedBy: userId },
            { $set: { userImagePath: uploadResponse.url } }
        );

        res.status(200).json(
            user
        );

    } catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).json({ 
            msg: "Error uploading profile picture", 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
})

// get pfp
PfpHanler.get("/", async (req: Request, res: Response) => {
    try{
        const userId = req.user._id;

        const user = await userModel.findById(userId);

        if(!user){
            res.status(401).json({
                msg: "user not found"
            })
            return;
        }

        res.status(200).json({
            image: user.profilePicture
        })
    }   
    catch (e) {
        console.error("Error while getting pfp", e)
        res.status(401).json({
            msg: "Error while getting pfp"
        })
        return;
    }
})

// get other's pfp
PfpHanler.get("/:id", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }

        res.json({
            image: user.profilePicture
        });
    } catch (error) {
        console.error("Error getting profile picture:", error);
        res.status(500).json({ 
            msg: "Error deleting getting picture"
        });
    }
})

// delete pfp
PfpHanler.delete("/", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        const user = await userModel.findById(userId);
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }

        if (!user.profilePicture) {
            res.status(400).json({ msg: "No profile picture to delete" });
            return;
        }

        // const imagePath = path.join(UPLOADS_BASE_PATH, 'profileImages', path.basename(user.profilePicture));

        // if (fs.existsSync(imagePath)) {
        //     fs.unlinkSync(imagePath); 
        // }

        user.profilePicture = "";

        await user.save();

        res.json({
            msg: "Profile picture deleted successfully",
            user
        });
    } catch (error) {
        console.error("Error deleting profile picture:", error);
        res.status(500).json({ 
            msg: "Error deleting profile picture",
        });
    }
})

export default PfpHanler;