import { Request, Response } from "express";
import { commentForumModel, postForumModel, threadForumModel } from "../../models/db";
import { calculateBatchPostPages } from "./utils/pagination"; // adjust import path if needed

export const adminGetReportedPostsCommentsThreadsHandler = async (req: Request, res: Response) => {
    try {
        const [reportedComments, reportedPosts, reportedThreads] = await Promise.all([
            commentForumModel
                .find({ reportedBy: { $exists: true, $not: { $size: 0 } }, visibility: true })
                .populate({ path: "reportedBy createdBy", select: "_id name username profilePicture" })
                .lean(),

            postForumModel
                .find({ reportedBy: { $exists: true, $not: { $size: 0 } }, visibility: true })
                .populate({ path: "reportedBy createdBy", select: "_id name username profilePicture" })
                .lean(),

            threadForumModel
                .find({ reportedBy: { $exists: true, $not: { $size: 0 } }, visibility: true })
                .populate({ path: "reportedBy createdBy", select: "_id name username profilePicture" })
                .lean(),
        ]);

        const postPaginationInput = reportedPosts.map(post => ({
            threadId: post.thread.toString(),
            postId: post._id.toString(),
        }));

        const postPageMap = await calculateBatchPostPages(postPaginationInput);

        const reportedPostsWithPage = reportedPosts.map(post => ({
            ...post,
            pageNumber: postPageMap.get(post._id.toString()) ?? null,
        }));

        const commentPostIds = reportedComments.map(c => c.post.toString());
        const parentPosts = await postForumModel
            .find({ _id: { $in: commentPostIds } })
            .select("_id thread")
            .lean();

        const postToThreadMap = new Map<string, string>();
        parentPosts.forEach(post => {
            postToThreadMap.set(post._id.toString(), post.thread.toString());
        });

        const commentPaginationInput = reportedComments.map(comment => ({
            postId: comment.post.toString(),
            threadId: postToThreadMap.get(comment.post.toString()) || "", // fallback
        })).filter(entry => entry.threadId); // remove any broken refs

        const commentPageMap = await calculateBatchPostPages(commentPaginationInput);

        const reportedCommentsWithPage = reportedComments.map(comment => ({
            ...comment,
            pageNumber: commentPageMap.get(comment.post.toString()) ?? null,
        }));

        res.json({
            reportedComments: reportedCommentsWithPage,
            reportedPosts: reportedPostsWithPage,
            reportedThreads,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Server error while fetching reported content",
        });
    }
};
