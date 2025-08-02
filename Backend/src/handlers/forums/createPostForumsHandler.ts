import { Request, Response } from "express";
import { z } from "zod";
import { postForumModel, threadForumModel, watchNotificationModel } from "../../models/db";
import { weaviateClient } from "../../models/weaviate";
import { embedtext } from "../../lib/vectorizeText";
import { calculatePostPage } from "./utils/pagination";
import { validateWeaviateCreate } from './utils/validateWeaviateCreate';
import { prisma } from "../../lib/prisma";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const createPostForumshandler = async (req: Request, res: Response) => {
  const createPostSchema = z.object({
    content: z.string().min(2)
  });

  const validation = createPostSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({ msg: "Enter correct details" });
    return
  }

  const { content } = validation.data;
  const { threadMongo, threadVectorId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = uuid();

    const postMongo = await postForumModel.create([{
      content,
      thread: threadMongo,
      createdBy: req.user._id,
      weaviateId: id, 
    }], { session });

    const postDoc = postMongo[0];

    try {
        await prisma.post.create({
            data: {
                id,
                mongoId: postDoc._id as string,
                threadId: threadVectorId
            }
        });

        const vector = await embedtext(content);

        await insertVector(id, vector, TableNames.Post);
    } catch (error) {
        throw new Error("Error while creating post")
    }

    const thread = await threadForumModel.findById(threadMongo).session(session);
    const watchers = thread?.watchedBy?.filter(id => id.toString() !== req.user._id.toString());

    if (watchers?.length) {
      await watchNotificationModel.create([{
        userIds: watchers,
        message: `${req.user.username} created a new post in ${thread?.title}`,
        threadId: thread?._id,
        seenBy: [],
        postId: postDoc._id,
        createdBy: req.user._id
      }], { session });
    }

    const pageNumber = await calculatePostPage(threadMongo, String(postDoc._id));

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      msg: "Post created successfully",
      postMongo: postDoc,
      pageNumber
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while creating post:", error);

    res.status(500).json({ msg: "Internal server error" });
  }
};
