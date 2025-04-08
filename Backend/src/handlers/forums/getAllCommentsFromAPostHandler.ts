import { Request, Response } from "express";
import { commentForumModel } from "../../models/db";

export const getAllCommentsFromAPostHandler = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const comments = await commentForumModel.find({ post: postId })
        .populate('createdBy', 'username profilePicture _id') // Populate necessary fields
        .sort({ createdAt: -1 });
      res.json({ comments });
    } catch (error) {
      res.status(500).json({ msg: "Server error" });
    }
  };
  