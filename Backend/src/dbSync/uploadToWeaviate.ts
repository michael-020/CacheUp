import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function loadJSON<T>(file: string): Promise<T[]> {
  const content = await fs.readFile(file, "utf-8");
  return JSON.parse(content);
}

function prepareData(data: any[], removeFields: string[] = []) {
  return data.map((obj) => {
    const clean = { ...obj };
    for (const field of removeFields) delete clean[field];
    return clean;
  });
}

async function uploadToPrisma(model: any, data: any[]) {
  try {
    await model.createMany({ data, skipDuplicates: true });
    console.log(`✅ Uploaded ${data.length} entries to ${model._dmmf.name}`);
  } catch (err) {
    console.error(`❌ Failed to upload to ${model._dmmf.name}:`, err);
  }
}

async function main() {
  try {
    const basePath = "./export";

    const files = {
      Forum: "forumsWeaviate.json",
      Thread: "threadsWeaviate.json",
      Post: "postsWeaviate.json",
      Comment: "commentsWeaviate.json",
    };

    const [forums, threads, posts, comments] = await Promise.all([
      loadJSON(path.join(basePath, files.Forum)),
      loadJSON(path.join(basePath, files.Thread)),
      loadJSON(path.join(basePath, files.Post)),
      loadJSON(path.join(basePath, files.Comment)),
    ]);

    await uploadToPrisma(prisma.forum, prepareData(forums));
    await uploadToPrisma(prisma.thread, threads.map(({ forum, forumId, ...rest }: any) => ({
      ...rest,
      forumId: forumId || forum?.id,
    })));

    await uploadToPrisma(prisma.post, posts.map(({ thread, threadId, ...rest }: any) => ({
      ...rest,
      threadId: threadId || thread?.id,
    })));

    await uploadToPrisma(prisma.comment, comments.map(({ post, postId, ...rest }: any) => ({
      ...rest,
      postId: postId || post?.id,
    })));

    console.log("🎉 All data uploaded to PostgreSQL with Prisma + pgvector!");
  } catch (err) {
    console.error("❌ Top-level failure:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
