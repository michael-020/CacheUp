import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4, validate as isUUID } from "uuid";
import mongoose from "mongoose";
import pLimit from "p-limit";
import { prisma } from "../lib/prisma"; // Adjust path as needed
import {
  forumModel,
  threadForumModel,
  postForumModel,
  commentForumModel,
} from "../models/db"; // Adjust path as needed
import { embedtext } from "../lib/vectorizeText"; // Adjust path as needed

const limit = pLimit(10);

async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("✅ Connected to MongoDB");

    console.log("📥 Fetching data from MongoDB...");
    const [forums, threads, posts, comments] = await Promise.all([
      forumModel.find({ visibility: true }).lean(),
      threadForumModel.find({ visibility: true }).lean(),
      postForumModel.find({ visibility: true }).lean(),
      commentForumModel.find({ visibility: true }).lean(),
    ]);

    console.log(`✅ Fetched: ${forums.length} forums, ${threads.length} threads, ${posts.length} posts, ${comments.length} comments`);

    const forumMap = new Map(forums.map((f: any) => [String(f._id), f]));
    const threadMap = new Map(threads.map((t: any) => [String(t._id), t]));
    const postMap = new Map(posts.map((p: any) => [String(p._id), p]));

    // Using upsert strategy - no deletion needed
    console.log("🔄 Using upsert strategy for existing data...");

    // Upsert Forums
    console.log("🔄 Upserting forums...");
    let forumCount = 0;
    for (const forum of forums) {
      if (!isUUID(forum.weaviateId)) {
        const weaviateId = uuidv4();
        await forumModel.findByIdAndUpdate(forum._id, { weaviateId });
        forum.weaviateId = weaviateId;
      }

      const vector = await embedtext(forum.title + " " + forum.description);
      
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Forum" (id, "mongoId", embedding) VALUES ($1, $2, $3)
         ON CONFLICT ("mongoId") DO UPDATE SET id = EXCLUDED.id, embedding = EXCLUDED.embedding`,
        forum.weaviateId,
        String(forum._id),
        vector
      );

      forumCount++;
      if (forumCount % 25 === 0 || forumCount === forums.length) {
        console.log(`✅ Upserted forum ${forumCount} / ${forums.length}`);
      }
    }

    // Upsert Threads
    console.log("🔄 Upserting threads...");
    let threadCount = 0;
    for (const thread of threads) {
      if (!isUUID(thread.weaviateId)) {
        const weaviateId = uuidv4();
        await threadForumModel.findByIdAndUpdate(thread._id, { weaviateId });
        thread.weaviateId = weaviateId;
      }

      const vector = await embedtext(thread.title + " " + thread.description);
      const forum = forumMap.get(String(thread.forum));

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Thread" (id, "mongoId", embedding, "forumId") VALUES ($1, $2, $3, $4)
         ON CONFLICT ("mongoId") DO UPDATE SET id = EXCLUDED.id, embedding = EXCLUDED.embedding, "forumId" = EXCLUDED."forumId"`,
        thread.weaviateId,
        String(thread._id),
        vector,
        forum!.weaviateId
      );

      threadCount++;
      if (threadCount % 50 === 0 || threadCount === threads.length) {
        console.log(`✅ Upserted thread ${threadCount} / ${threads.length}`);
      }
    }

    // Upsert Posts
    console.log("🔄 Upserting posts...");
    let postCount = 0;
    for (const post of posts) {
      if (!isUUID(post.weaviateId)) {
        const weaviateId = uuidv4();
        await postForumModel.findByIdAndUpdate(post._id, { weaviateId });
        post.weaviateId = weaviateId;
      }

      const vector = await embedtext(post.content);
      const thread = threadMap.get(String(post.thread));

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Post" (id, "mongoId", embedding, "threadId") VALUES ($1, $2, $3, $4)
         ON CONFLICT ("mongoId") DO UPDATE SET id = EXCLUDED.id, embedding = EXCLUDED.embedding, "threadId" = EXCLUDED."threadId"`,
        post.weaviateId,
        String(post._id),
        vector,
        thread!.weaviateId
      );

      postCount++;
      if (postCount % 100 === 0 || postCount === posts.length) {
        console.log(`✅ Upserted post ${postCount} / ${posts.length}`);
      }
    }

    // Upsert Comments
    console.log("🔄 Upserting comments...");
    let commentCount = 0;
    for (const comment of comments) {
      if (!isUUID(comment.weaviateId)) {
        const weaviateId = uuidv4();
        await commentForumModel.findByIdAndUpdate(comment._id, { weaviateId });
        comment.weaviateId = weaviateId;
      }

      const vector = await embedtext(comment.content);
      const post = postMap.get(String(comment.post));

      await prisma.$executeRawUnsafe(
        `INSERT INTO "Comment" (id, "mongoId", embedding, "postId") VALUES ($1, $2, $3, $4)
         ON CONFLICT ("mongoId") DO UPDATE SET id = EXCLUDED.id, embedding = EXCLUDED.embedding, "postId" = EXCLUDED."postId"`,
        comment.weaviateId,
        String(comment._id),
        vector,
        post!.weaviateId
      );

      commentCount++;
      if (commentCount % 200 === 0 || commentCount === comments.length) {
        console.log(`✅ Upserted comment ${commentCount} / ${comments.length}`);
      }
    }

    console.log("🎉 Database upserted successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });