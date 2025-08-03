import { Request, Response } from "express";
import { z } from "zod";
import { postForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const editPostForumHandler = async (req: Request, res: Response) => {
  const postSchema = z.object({
    content: z.string().min(2)
  });

  const validation = postSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({ msg: "Please enter some content" });
    return
  }

  const userId = req.user._id;
  const { mongoId, vectorId } = req.params;
  const { content } = validation.data;

  if (!mongoId || !vectorId) {
    res.status(411).json({ msg: "Enter both IDs" });
    return
  }

  try {
    const postMongo = await postForumModel.findById(mongoId);
    if (!postMongo) {
      res.status(404).json({ msg: "Post not found" });
      return
    }

    if (postMongo.createdBy.toString() !== userId.toString()) {
      res.status(401).json({ msg: "You are not authorized to edit this post" });
      return
    }

    const originalContent = postMongo.content;
    postMongo.content = content;
    await postMongo.save();

    try {
      const vector = await embedtext(content);
      await insertVector(vectorId, vector, TableNames.Post);

      res.status(200).json({
        msg: "Post updated successfully",
        postMongo
      });

    } catch (error) {
      console.error("Vector update error:", error);

      postMongo.content = originalContent;
      await postMongo.save();

      res.status(500).json({ msg: "Error while updating vector" });
    }

  } catch (e) {
    console.error("Edit post error:", e);
    res.status(500).json({ msg: "Server error" });
  }
};
