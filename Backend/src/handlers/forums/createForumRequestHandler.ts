import { Request, Response } from "express";
import { z } from "zod";
import { forumModel, requestForumModel } from "../../models/db";


export const createForumRequestHandler = async(req: Request, res: Response) => {
    const requestForumSchema = z.object({
        title: z.string().min(2),
        description: z.string().min(2)
    });

    try {
        const response = requestForumSchema.safeParse(req.body);
        if(!response.success){
            res.status(411).json({
                msg: "Please fill the details correctly"
            });
            return;
        }

        const { title, description } = req.body;

        // Check both existing forums and pending requests
        const [existingForum, existingRequest] = await Promise.all([
            forumModel.findOne({ 
                title, 
                visibility: true 
            }),
            requestForumModel.findOne({
                title,
                status: "pending"
            })
        ]);

        if (existingForum) {
            res.status(409).json({
                msg: "A forum with this title already exists"
            });
            return;
        }

        if (existingRequest) {
            res.status(409).json({
                msg: "A request for this forum title is already pending"
            });
            return;
        }

        const requestForum = await requestForumModel.create({
            title,
            description,
            requestedBy: req.user._id
        });

        res.json({
            msg: "Request Successful",
            requestForum
        });
    } catch(e) {
        console.error(e);
        res.status(500).json({
            msg: "Server Error"
        });
    }
};