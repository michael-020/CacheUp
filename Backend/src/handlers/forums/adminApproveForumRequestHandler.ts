import { Request, Response } from "express";
import { forumModel, requestForumModel } from "../../models/db";
import { embedtext } from "../../lib/vectorizeText";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { prisma } from "../../lib/prisma";
import { insertVector, TableNames } from "../../lib/vectorQueries";

export const adminApproveForumHandler = async (req: Request, res: Response) => {
    try {
        const { requestId } = req.params;
        const requestedForum = await requestForumModel.findById(requestId);

        if (!requestedForum) {
            res.status(404).json({
                msg: "Request not found"
            });
            return;
        }
        
        // Check for duplicate title only among visible forums
        const existingForum = await forumModel.findOne({ 
            title: requestedForum.title,
            visibility: true 
        });

        if (existingForum) {
            res.status(409).json({ 
                msg: "A forum with this title already exists" 
            });
            return;
        }

        const session = await mongoose.startSession();
        session.startTransaction()

        try {
            const id = uuid()
            const forumMongoArr = await forumModel.create(
                [{
                title: requestedForum.title,
                description: requestedForum.description,
                createdBy: req.admin._id,
                weaviateId: id
            }], { session })    

            const forumMongo = forumMongoArr[0]
            try {

                const [prismaEntry, vector] = await Promise.all([
                    prisma.forum.create({
                        data: {
                            id,
                            mongoId: forumMongo._id as string
                        }
                    }),
                    embedtext(requestedForum.title + " " + requestedForum.description)
                ])

                insertVector(id, vector, TableNames.Forum)
            } catch (error) {
                throw new Error("COuld not create vector entry")
            }
            await session.commitTransaction()
            session.endSession()
            res.json({
                msg:"accepted the forum req",
                forumMongo
            })

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error("Error creating forum:", error);
            res.status(500).json({
            msg: "Error while creating forum",
            });
        }
        

    } catch (e) {
        console.error("Error creating forum:",e);
        res.status(500).json({
        msg: "Error while creating forum",
        });
    }
};