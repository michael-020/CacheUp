import { Request, Response } from "express";
import { z } from "zod";
import { forumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import { insertVector, TableNames } from "../../lib/vectorQueries";
import { prisma } from "../../lib/prisma";

export const createForumhandler = async (req: Request, res: Response) => {
  const forumSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(10),
  });

  const validation = forumSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({
      msg: "Invalid Details",
      error: validation.error.errors,
    });
    return
  }

  const { title, description } = validation.data;

  const existingForum = await forumModel.findOne({
    title,
    visibility: true,
  });

  if (existingForum) {
    res.status(409).json({
      msg: "A forum with this title already exists",
    });
    return
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = uuid();

    const forumMongoArr = await forumModel.create(
        [{
            title,
            description,
            createdBy: req.admin._id,
            weaviateId: id,
        }],
        { session }
    );

    const forumMongo = forumMongoArr[0]; 
    try {
        await prisma.forum.create({
            data: {
                id,
                mongoId: forumMongo._id as string
            }
        })

        const vector = await embedtext(`${title} ${description}`);

        insertVector(id, vector, TableNames.Forum)
    } catch (error) {
        throw new Error("Error while creating forum")
    }


    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
        msg: "Forum created successfully",
        forumMongo,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error creating forum:", error);
    res.status(500).json({
      msg: "Error while creating forum",
    });
  }
};
