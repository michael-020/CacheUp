import { Request, Response } from "express";
import { commentForumModel, forumModel, postForumModel, threadForumModel } from "../../models/db";
import { z } from "zod";
import { embedtext } from "../../lib/vectorizeText";
import { calculatePostPage } from "./utils/pagination"; 
import { getSimilarVectors, TableNames } from "../../lib/vectorQueries";


const queryMongo = async(searchAlgoResult: Array<{ type: string; mongoId: string, certainty: number }>) => {
    try {
        const finalResults = []
        
        const forumIds: string[] = []
        const threadIds: string[] = []
        const postIds: string[] = []
        const commentIds: string[] = []

        searchAlgoResult.forEach(({type, mongoId}) => {
            if (type === "Forum") forumIds.push(mongoId)
            else if (type === "Thread") threadIds.push(mongoId)
            else if (type === "Post") postIds.push(mongoId)
            else commentIds.push(mongoId)
        })

        const [forums, threads, posts, comments] = await Promise.all([
            forumIds.length ? forumModel.find({ _id: { $in: forumIds }, visibility: true }).lean() : [],
            threadIds.length ? threadForumModel.find( { _id: { $in: threadIds }, visibility: true }).lean() : [],
            postIds.length ? postForumModel.find( { _id: { $in: postIds }, visibility: true } ).lean() : [],
            commentIds.length ? commentForumModel.find( { _id: { $in: commentIds }, visibility: true } ).select("post").lean() : []
        ])

        const forumMap = new Map(forums.map(doc => [doc._id.toString(), doc]))
        const threadMap = new Map(threads.map(doc => [doc._id.toString(), doc]))
        const postMap = new Map(posts.map(doc => [doc._id.toString(), doc]))
        const commentMap = new Map(comments.map(doc => [doc._id.toString(), doc]))

        const commentPostIds = comments.map(c => c.post.toString())
        const uniqueCommentPostIds = [...new Set(commentPostIds)]

        const commentPosts = uniqueCommentPostIds.length
            ? await postForumModel.find({ _id: {$in: uniqueCommentPostIds} }).lean()
            : []
        
        const commentPostMap = new Map(commentPosts.map(doc => [doc._id.toString(), doc]))

        // Process each search result
        for (const { type, mongoId, certainty } of searchAlgoResult) {
            let data = null;
            let page;
      
            if (type === "Forum") {
              data = forumMap.get(mongoId);
            } else if (type === "Thread") {
              data = threadMap.get(mongoId);
            } else if (type === "Post") {
              data = postMap.get(mongoId);
              if (data) {
                // Calculate page for this post
                page = await calculatePostPage(data.thread.toString(), mongoId);
              }
            } else if (type === "Comment") {
              const comment = commentMap.get(mongoId);
              if (comment && comment.post) {
                const post = commentPostMap.get(comment.post.toString());
                if (post) {
                  data = post;
                  // Calculate page for the post
                  page = await calculatePostPage(post.thread.toString(), post._id.toString());
                }
              }
            }
      
            if (data) {
              finalResults.push({
                type,
                data,
                certainty,
                page
              });
            }
        }
      
        return finalResults;

    } catch (error) {
        console.error("Error querying MongoDB:", error);
        return [];
    }
}


const queryVectorTables = async (query: number[]) => {
  const limits = {
    [TableNames.Forum]: 3,
    [TableNames.Thread]: 7,
    [TableNames.Post]: 15,
    [TableNames.Comment]: 20
  };

  const results: Array<{ type: string; mongoId: string, certainty: number }> = [];

  const tableMappings = [
    [TableNames.Forum, "Forum"],
    [TableNames.Thread, "Thread"],
    [TableNames.Post, "Post"],
    [TableNames.Comment, "Comment"]
  ] as const;

  for (const [table, label] of tableMappings) {
    try {
      const matches = await getSimilarVectors(query, limits[table], table) as Array<{ id: string; mongoId: string }>;
      matches?.forEach((match: any) => {
        if (match.mongoId && match.mongoId !== "null") {
          // const maxPossibleDistance = 2; // for cosine, or use empirically determined max
          // const similarity = (match.certainty / maxPossibleDistance);
          // const similarityPercent = similarity * 100;

          results.push({
            type: label,
            mongoId: match.mongoId,
            certainty: match.certainty
          });
        }
      });
    } catch (err) {
      console.error(`Error fetching ${label} results:`, err);
    }
  }

  return results;
};

export const searchForumHandler = async (req: Request, res: Response) => {
  const searchSchema = z.object({
    query: z.string().min(3)
  });

  try {
    const validation = searchSchema.safeParse(req.params);
    if (!validation.success) {
      res.status(411).json({
        msg: "At least 3 characters needed for the search"
      });
      return
    }

    const { query } = validation.data;
    const queryVector = await embedtext(query);

    const searchAlgoResults = await queryVectorTables(queryVector);
    if (!searchAlgoResults.length) {
      res.status(404).json({
        msg: "No results found"
      });
      return
    }

    const results = await queryMongo(searchAlgoResults);

    res.json({
      msg: "Search Successful",
      searchResults: results
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      msg: "Server error"
    });
  }
};