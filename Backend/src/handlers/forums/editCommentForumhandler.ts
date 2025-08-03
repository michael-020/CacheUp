import { Request, Response } from "express";
import { z } from "zod";
import { commentForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const editCommentForumHandler = async (req: Request, res: Response) => {
  const commentSchema = z.object({
    content: z.string().min(1)
  });

  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({ msg: "Please enter some text" });
    return
  }

  const userId = req.user._id;
  const { mongoId, vectorId } = req.params;
  const { content } = validation.data;

  if (!mongoId || !vectorId) {
    res.status(411).json({ msg: "Please provide both IDs" });
    return
  }

  try {
    const commentMongo = await commentForumModel.findById(mongoId);

    if (!commentMongo) {
      res.status(404).json({ msg: "Comment not found" });
      return
    }

    if (commentMongo.createdBy.toString() !== userId.toString()) {
      res.status(401).json({ msg: "You are not authorized to edit this comment" });
      return
    }

    const originalContent = commentMongo.content;
    commentMongo.content = content;
    await commentMongo.save();

    try {
      const vector = await embedtext(content);
      await insertVector(vectorId, vector, TableNames.Comment);

      res.status(200).json({
        msg: "Comment updated successfully",
        commentMongo
      });

    } catch (error) {
      commentMongo.content = originalContent;
      await commentMongo.save();

      console.error("Vector update error:", error);
      res.status(500).json({ msg: "Error while updating vector" });
    }

  } catch (e) {
    console.error("Edit comment error:", e);
    res.status(500).json({ msg: "Server error" });
  }
};
