import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import cloudinary from "../lib/cloudinary";
import sharp from "sharp";

export const uploadPostsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const text = req.body.text || "";
    const image = req.body.image;

    if (text.length > 200) {
      res.status(400).json({
        msg: "Text cannot exceed 200 characters",
      });
      return;
    }

    if (!text && !image) {
      res.status(400).json({
        msg: "Please upload a text content or a picture or both",
      });
      return;
    }

    if (image) {
      try {
        // Parse the base64 image - support more formats including DNG
        const matches = image.match(/^data:image\/([a-zA-Z0-9.-]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.log("Invalid image format detected. Image data prefix:", 
            image.substring(0, Math.min(50, image.length)));
          res.status(400).json({
            msg: "Invalid image format. Please check if the image is properly encoded.",
          });
          return;
        }
        
        const imageType = matches[1];
        const base64Data = matches[2];
        console.log(`Processing image of type: ${imageType}`);
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Convert to WebP format with more robust error handling
        let webpBuffer;
        try {
          webpBuffer = await sharp(imageBuffer, { failOnError: false })
            .rotate()
            .webp({ quality: 80 })
            .toBuffer();
        } catch (sharpError) {
          console.error("Sharp conversion error:", sharpError);
          
          // Fallback approach for problematic formats (like DNG)
          try {
            console.log("Attempting fallback conversion method for DNG or other RAW formats");
            webpBuffer = await sharp(imageBuffer, { 
              failOnError: false, 
              raw: imageType.toLowerCase() === 'dng' ? {
                width: 1000,  // provide reasonable defaults
                height: 1000,
                channels: 3
              } : undefined
            })
            .rotate()
            .webp({ quality: 70 })
            .toBuffer();
          } catch (fallbackError) {
            console.error("Fallback conversion failed:", fallbackError);
            res.status(400).json({
              msg: "Unable to process this image format. Please convert it to JPEG or PNG before uploading."
            });
            return;
          }
        }
        
        // Check file size after conversion
        const sizeInMB = webpBuffer.length / (1024 * 1024);
        if (sizeInMB > 10) {
          res.status(413).json({
            msg: "Image size should not exceed 10MB"
          });
          return;
        }
        
        // Convert buffer back to base64 for Cloudinary
        const webpBase64 = webpBuffer.toString('base64');
        
        // Upload to Cloudinary with WebP format
        let uploadResponse;
        try {
          uploadResponse = await cloudinary.uploader.upload(
            `data:image/webp;base64,${webpBase64}`, 
            {
              folder: "Post_Images",
              transformation: [
                { quality: "auto", fetch_format: "webp" },
                { width: "auto", crop: "limit", max_width: 2000 },
                { dpr: "auto" }
              ],
              resource_type: "image"
            }
          );
        } catch (cloudinaryError) {
          console.error("Cloudinary upload error:", cloudinaryError);
          res.status(500).json({
            msg: "Error uploading image to cloud storage"
          });
          return;
        }

        const user = await userModel.findById(userId);
        if (!user) {
          res.status(404).json({
            msg: "User not found",
          });
          return;
        }

        const newPost = await postModel.create({
          postedBy: userId,
          username: user.username,
          userImagePath: user.profilePicture,
          postsImagePath: uploadResponse.url,
          text,
          likes: [],
          reportedBy: [],
          comments: [],
        });

        await userModel.findByIdAndUpdate(userId, {
          $push: { posts: newPost._id },
        });

        res.status(200).json({
          msg: "Post uploaded successfully",
          post: newPost,
        });
      } catch (imageError) {
        console.error("Error processing image:", imageError);
        res.status(400).json({
          msg: "Error processing image. Please try again with a different image.",
        });
        return;
      }
    } else {
      const user = await userModel.findById(userId);

      if (!user) {
        res.status(404).json({
          msg: "User not found",
        });
        return;
      }

      const newPost = await postModel.create({
        postedBy: userId,
        username: user.username,
        userImagePath: user.profilePicture,
        text,
        likes: [],
        reportedBy: [],
        comments: [],
      });

      await userModel.findByIdAndUpdate(userId, {
        $push: { posts: newPost._id },
      });

      res.status(200).json({
        msg: "Post uploaded successfully",
        post: newPost,
      });
    }
  } catch (error) {
    console.error("Error while uploading a post:", error);
    res.status(500).json({
      msg: "Error while uploading a post",
    });
  }
};