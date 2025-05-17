import { Request, Response } from "express";
import { postForumModel, threadForumModel, commentForumModel, requestForumModel, postModel } from "../../models/db";
import mongoose from "mongoose";

export const getAllPostsFromAThreadHandler = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params
    const validThreadId = new mongoose.Types.ObjectId(threadId)
    const page = parseInt(req.params.page as string)
    const limit = 10
    const skip = (page - 1) * limit;

    const postQuery = postForumModel
      .find({thread: validThreadId, visibility: true})
      .sort({createdAt: 1})
      .skip(skip)
      .limit(limit)
      .populate({
        path: "createdBy",
        select: "_id username profilePicture"
      })
      .lean()

      const threadQuery = threadForumModel.findOne({_id: validThreadId, visibility: true}).lean()

      const totalPostsQuery = postForumModel.countDocuments({thread: validThreadId, visibility: true})
      
      const [posts, thread, totalPosts] = await Promise.all([
        postQuery,
        threadQuery,
        totalPostsQuery
      ])

      if(!thread){
        res.status(404).json({
          msg: "Thread Not Found"
        })
        return
      }

      if(posts.length === 0){
        res.json({
          posts: [],
          threadTitle: thread.title,
          threadDescription: thread.description,
          threadMongo: thread._id,
          threadWeaviate: thread.weaviateId,
          watchedBy: thread.watchedBy,
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalPosts: 0,
            postsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false  
          }
        })
        return
      }

      const postIds = posts.map(post => post._id)

      const commentsAggregation = commentForumModel.aggregate([
        {$match: {post: { $in: postIds }, visibility: true } },
        {$group: { _id: "$post", count: {$sum: 1} }}
      ])

      const comments = await commentsAggregation;

      const commentCountMap = comments.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc
      }, {} as Record<string, number>)

      const postsWithCounts = posts.map(post => ({
        ...post,
        commentCount: commentCountMap[post._id.toString()] || 0
      }))

      
      const totalPages = Math.ceil(totalPosts / limit)
      const hasNextPage = Boolean(page < totalPages)
      const hasPreviousPage = Boolean(page > 1)

      res.json({
        msg: "Posts fetched successfully",
        posts: postsWithCounts,
        threadTitle: thread.title,
        threadDescription: thread.description,
        threadMongo: thread._id,
        threadWeaviate: thread.weaviateId,
        watchedBy: thread.watchedBy,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          postsPerPage: limit,
          hasNextPage,
          hasPreviousPage
        }
      })
  } catch (e) {
    console.error(e);
    res.status(500).json({
      msg: "Server error"
    });
  }
};
