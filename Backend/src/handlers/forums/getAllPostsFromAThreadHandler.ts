import { Request, Response } from "express";
import { postForumModel, threadForumModel, userModel, commentForumModel } from "../../models/db";

export const getAllPostsFromAThreadHandler = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;

    const posts = await postForumModel
      .find({ thread: threadId, visibility: true })
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "_id username profilePicture"
      });

    // Add comment counts
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
      const commentCount = await commentForumModel.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        commentsCount: commentCount
      };
    }));

    const thread = await threadForumModel.findById(threadId);

    res.json({
      msg: "Posts Fetched successfully",
      posts: postsWithCounts,
      threadTitle: thread?.title,
      threadDescription: thread?.description,
      threadMongo: thread?._id,
      threadWeaviate: thread?.weaviateId,
      watchedBy: thread?.watchedBy
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      msg: "Server error"
    });
  }
};
