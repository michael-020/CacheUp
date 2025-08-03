import { Request, Response } from "express";
import { z } from "zod";
import { threadForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const editThreadForumHandler = async (req: Request, res: Response) => {
  const threadSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional()
  });

  const { mongoId, vectorId } = req.params;

  if (!mongoId || !vectorId) {
    res.status(411).json({ msg: "Please provide both IDs" });
    return
  }

  const validation = threadSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({ msg: "Please enter details" });
    return
  }

  try {
    const threadMongo = await threadForumModel.findById(mongoId);
    if (!threadMongo) {
      res.status(404).json({ msg: "Thread not found" });
      return
    }

    const userId = req.user._id;
    if (threadMongo.createdBy.toString() !== userId.toString()) {
      res.status(401).json({ msg: "You are not authorized to edit this thread" });
      return
    }

    let { title, description } = validation.data;
    title = title?.trim() || threadMongo.title;
    description = description?.trim() || threadMongo.description;

    const originalTitle = threadMongo.title;
    const originalDescription = threadMongo.description;

    threadMongo.title = title;
    threadMongo.description = description;
    await threadMongo.save();

    try {
      const vector = await embedtext(`${title} ${description}`);
      await insertVector(vectorId, vector, TableNames.Thread);

      res.status(200).json({
        msg: "Thread updated successfully",
        threadMongo
      });
    } catch (error) {
      console.error("Vector update failed:", error);
      threadMongo.title = originalTitle;
      threadMongo.description = originalDescription;
      await threadMongo.save();
      res.status(500).json({ msg: "Error while updating vector" });
    }
  } catch (error) {
    console.error("Edit thread error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
