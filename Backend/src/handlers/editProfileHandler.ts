import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import { z } from "zod";
import cloudinary from "../lib/cloudinary";
import { convertImageToWebP } from "../lib/imageReEncode";
import axios from "axios";

const updateSchema = z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    profilePicture : z.string().optional(), 
    bio: z.string().optional(),

}).strict({message: "Extra fields not allowed"});

export const editProfileHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const updates = req.body;
        const response = updateSchema.safeParse(updates);

        if(!response.success) {
            res.status(400).json({msg: "Incorrect format", error: response.error.errors})
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

        if (updates.profilePicture) {
            try {
              let imageInput = updates.profilePicture;
          
              // Handle remote image URLs by converting to base64
              if (typeof imageInput === "string" && imageInput.startsWith("http")) {
                const response = await axios.get(imageInput, { responseType: "arraybuffer" });
                const buffer = Buffer.from(new Uint8Array(response.data));
                imageInput = `data:image/jpeg;base64,${buffer.toString("base64")}`;
              }
          
              // Convert image to WebP format
              let webpBuffer = await convertImageToWebP(imageInput);
              
              interface CloudinaryUploadResult {
                secure_url: string;
                public_id: string;
                [key: string]: any; // Allow for other Cloudinary result properties
              }
          
              const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                  {
                    folder: "Profile_Images",
                    resource_type: "image",
                    public_id: `profile_${Date.now()}`,
                    format: "webp",
                  },
                  (error, result) => {
                    if (error) {
                      console.error("Cloudinary Upload Error:", error);
                      reject(error);
                      return;
                    }
                    resolve(result as CloudinaryUploadResult);
                  }
                );
                
                // Feed the buffer to the upload stream
                uploadStream.end(webpBuffer);
              });
          
              // Use the secure URL from the upload result
              const url = uploadResult.secure_url;
              
              // Update user profile picture
              user.profilePicture = url;
          
              // Update profile picture in all user's posts
              await postModel.updateMany(
                { postedBy: userId },
                { $set: { userImagePath: url } }
              );
            } catch (uploadError) {
              console.error("Error processing profile picture:", uploadError);
              throw new Error("Failed to process profile picture");
            }
          }
          
          if (updates.bio && updates.bio !== "") {
            user.bio = updates.bio;
          }
          
          await user.save();
          
          res.status(200).json({ msg: "User updated successfully", user });
    }catch (e) {
        console.error(e)
        res.status(500).json({ msg: "Error updating the user" });
    }
};


