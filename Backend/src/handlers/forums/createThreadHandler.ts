import { Request, Response } from "express";
import { z } from "zod";
import { threadForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import { insertVector, TableNames } from "../../lib/vectorQueries";
import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import { prisma } from "../../lib/prisma";

export const createThreadHandler = async (req: Request, res: Response) => {
    const createThreadSchema = z.object({
        title: z.string().max(50),
        description: z.string()
    });

    const validation = createThreadSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(411).json({ msg: "Invalid Details" });
        return
    }

    const { title, description } = validation.data;
    const { forumMongoId, forumVectorId } = req.params;

    const existingThread = await threadForumModel.findOne({
        title,
        visibility: true,
        forum: forumMongoId
    });

    if (existingThread) {
        res.status(409).json({
            msg: "A thread with this title already exists in this forum"
        });
        return
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const id = uuid();
        const threadMongo = await threadForumModel.create([{
            title,
            description,
            forum: forumMongoId,
            createdBy: req.user._id,
            weaviateId: id
        }], { session });

        const threadDoc = threadMongo[0];

        try {   
            await prisma.thread.create({
                data: {
                    id,
                    mongoId: threadDoc._id as string,
                    forumId: forumVectorId
                }
            })

            const vector = await embedtext(`${title} ${description}`);

            await insertVector(id, vector, TableNames.Thread);
        } catch (error) {
            console.error("Error while creating therad", error)
            throw new Error("Error while creating thread")
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            msg: "Thread created successfully",
            threadMongo: threadDoc
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        res.status(500).json({
            msg: "Error while creating thread"
        });
    }
};