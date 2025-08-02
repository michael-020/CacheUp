import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import {
  commentForumModel,
  postForumModel,
  threadForumModel,
  watchNotificationModel
} from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";
import { prisma } from "../../lib/prisma";
import { v4 as uuid } from "uuid";

export const createCommentForumHandler = async (req: Request, res: Response) => {
  const commentSchema = z.object({
    content: z.string().min(1)
  });

  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(411).json({ msg: "Invalid Details" });
    return
  }

  const { content } = validation.data;
  const { postMongo, postVectorId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const id = uuid();

    const commentMongo = await commentForumModel.create([{
      content,
      weaviateId: id, 
      post: postMongo,
      createdBy: req.user._id
    }], { session });

    const commentDoc = commentMongo[0];

    
    try {
        await prisma.comment.create({
            data: {
                id,
                mongoId: commentDoc._id as string,
                postId: postVectorId
            }
        });
        const vector = await embedtext(content);
        await insertVector(id, vector, TableNames.Comment);
    } catch (error) {
        throw new Error("Error while creating comment")
    }

    const post = await postForumModel.findById(postMongo).session(session);
    const thread = await threadForumModel.findById(post?.thread).session(session);

    const watchers = thread?.watchedBy?.filter(
      id => id.toString() !== req.user._id.toString()
    );

    if (watchers?.length) {
      await watchNotificationModel.create([{
        userIds: watchers,
        message: `${req.user.username} created a comment in ${thread?.title}`,
        threadId: thread?._id,
        seenBy: [],
        postId: post?._id,
        createdBy: req.user._id
      }], { session });
    }

    if (post) {
      const commentCount = await commentForumModel.countDocuments({ post: postMongo });
      post.commentsCount = commentCount;
      await post.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await commentDoc.populate('createdBy', '_id username profilePicture');

    res.status(201).json({
      msg: "Comment uploaded successfully",
      commentMongo: commentDoc,
      commentCount: post?.commentsCount || 0
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error while creating comment:", error);
    res.status(500).json({ msg: "Could not create comment" });
  }
};
