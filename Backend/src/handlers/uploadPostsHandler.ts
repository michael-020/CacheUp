import { Request, Response } from "express";
import { postModel, userModel } from "../models/db";
import cloudinary from "../lib/cloudinary";

export const uploadPostsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const text = req.body.text || "";
    //const imagePath = req.file ? `/uploads/userPostsImages/${req.file.filename}` : null;
    // const imagePath = req.file
    //   ? `${req.protocol}://${req.get("host")}/uploads/userPostsImages/${
    //       req.file.filename
    //     }`
    //   : null;
    const image = req.body.image
    if(!image){
        res.status(401).json({
            msg: "profile picture not provided"
        })
        return
    }

    if (image && image.length > 10 * 1024 * 1024) {
        res.status(413).json({
            msg: "Profile picture is too large"
        });
        return
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "profile_pictures", 
        transformation: [
            { width: 500, height: 500, crop: "fill" }, 
            { quality: "auto" }
        ]
    })

    // Validate text length
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
  } catch (error) {
    console.error("Error while uploading a post:", error);
    res.status(500).json({
      msg: "Error while uploading a post",
    });
  }
};
