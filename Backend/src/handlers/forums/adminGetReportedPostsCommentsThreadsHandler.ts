import { Request, Response } from "express";
import { commentForumModel, postForumModel, threadForumModel } from "../../models/db";


export const adminGetReportedPostsCommentsThreadsHandler = async(req: Request, res: Response) => {
    try {
        const [reportedComments, reportedPosts,  reportedThreads] = await Promise.all([
            await commentForumModel.find({reportedBy: {$exists: true, $not: {$size: 0}}, visibility: true}).populate({path: "reportedBy", select: "_id name username profilePicture"}).lean(),
            await postForumModel.find({reportedBy: {$exists: true, $not: {$size: 0}}, visibility: true}).populate({path: "reportedBy", select: "_id name username profilePicture"}).lean(),
            await threadForumModel.find({reportedBy: {$exists: true, $not: {$size: 0}}, visibility: true}).populate({path: "reportedBy", select: "_id name username profilePicture"}).lean()
        ])
        res.json({
            reportedComments,
            reportedPosts,
            reportedThreads
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Server error while fetching reported content"
        })
    }
}