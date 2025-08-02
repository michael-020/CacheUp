import { Request, Response } from "express";
import { z } from "zod";
import { forumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const editForumAdminHandler = async (req: Request, res: Response) => {
  const forumSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional()
  });

  try {
    const { mongoId, weaviateId } = req.params;
    if (!mongoId || !weaviateId) {
      res.status(411).json({ msg: "Please provide ids" });
      return
    }

    const validation = forumSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(411).json({ msg: "Please enter valid forum details" });
        return
    }

    const forumMongo = await forumModel.findById(mongoId);
    if (!forumMongo) {
        res.status(404).json({ msg: "Cannot find the forum" });
        return
    }

    let { title, description } = validation.data;
    title = title?.trim() || forumMongo.title;
    description = description?.trim() || forumMongo.description;

    const initialTitle = forumMongo.title;
    const initialDescription = forumMongo.description;

    forumMongo.title = title;
    forumMongo.description = description;
    await forumMongo.save();

    try {
      const vector = await embedtext(`${title} ${description}`);
      await insertVector(weaviateId, vector, TableNames.Forum);

      res.status(200).json({
        msg: "Forum updated successfully",
        forumMongo
      });
    } catch (error) {
      console.error("Vector update failed:", error);
      forumMongo.title = initialTitle;
      forumMongo.description = initialDescription;
      await forumMongo.save();

      res.status(500).json({ msg: "Could not update vector data" });
    }
  } catch (e) {
    console.error("Forum edit error:", e);
    res.status(500).json({ msg: "Server error" });
  }
};
