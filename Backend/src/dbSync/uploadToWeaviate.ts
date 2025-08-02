import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { weaviateClient as client } from "../models/weaviate";

async function loadJSON<T>(file: string): Promise<T[]> {
  const content = await fs.readFile(file, "utf-8");
  return JSON.parse(content);
}

async function uploadBatch(className: string, objects: any[]) {
  const batch = objects.map(({ id, vector, ...props }) => ({
    class: className,
    id,
    vector,
    properties: props,
  }));

  try {
    await client.batch.objectsBatcher().withObjects(...batch).do();
    console.log(`✅ Uploaded ${batch.length} ${className} objects`);
  } catch (err) {
    console.error(`❌ Failed to upload ${className}:`, err);
  }
}

function prepareData(data: any[], removeFields: string[] = []) {
  return data.map((obj) => {
    const clean = { ...obj };
    for (const field of removeFields) delete clean[field];
    return clean;
  });
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

    await Promise.all([
      uploadBatch("Forum", prepareData(forums, ["vector"])),
      uploadBatch(
        "Thread",
        threads.map(({ forum, ...rest }: any) => ({ ...rest, forum }))
      ),
      uploadBatch(
        "Post",
        posts.map(({ thread, ...rest }: any) => ({ ...rest, thread }))
      ),
      uploadBatch(
        "Comment",
        comments.map(({ post, ...rest }: any) => ({ ...rest, post }))
      ),
    ]);

    console.log("🎉 All data uploaded to Weaviate!");
  } catch (err) {
    console.error("❌ Top-level failure:", err);
  }
}

main();
