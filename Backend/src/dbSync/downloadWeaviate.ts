import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";
import pLimit from "p-limit";
import { weaviateClient as client } from "../models/weaviate";

const EXPORT_DIR = path.resolve("export");
const limit = pLimit(5);

const classFieldsMap: Record<string, string> = {
  Forum: `
    title
    description
    mongoId
    _additional { id vector }
  `,
  Thread: `
    title
    description
    mongoId
    forum {
      ... on Forum {
        _additional { id }
      }
    }
    _additional { id vector }
  `,
  Post: `
    content
    mongoId
    thread {
      ... on Thread {
        _additional { id }
      }
    }
    _additional { id vector }
  `,
  Comment: `
    content
    mongoId
    post {
      ... on Post {
        _additional { id }
      }
    }
    _additional { id vector }
  `,
};

async function downloadAllPaginated(className: string, fields: string) {
  const BATCH_SIZE = 1000;
  let offset = 0;
  let results: any[] = [];

  while (true) {
    const res = await client.graphql
      .get()
      .withClassName(className)
      .withFields(fields)
      .withLimit(BATCH_SIZE)
      .withOffset(offset)
      .do();

    const batch = res.data?.Get?.[className] || [];

    if (!batch.length) break;

    results.push(...batch);
    console.log(`⬇️  Fetched ${batch.length} ${className}s [offset: ${offset}]`);

    if (batch.length < BATCH_SIZE) break;
    offset += BATCH_SIZE;
  }

  return results;
}

async function writeJSONFile(filename: string, data: any[]) {
  const filepath = path.join(EXPORT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`💾 Saved ${data.length} objects to ${filename}`);
}

async function main() {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });

    const classNames = ["Forum", "Thread", "Post", "Comment"];

    await Promise.all(
      classNames.map((className) =>
        limit(async () => {
          const fields = classFieldsMap[className];
          const data = await downloadAllPaginated(className, fields);
          const fileName = `${className.toLowerCase()}sFromWeaviate.json`;
          await writeJSONFile(fileName, data);
        })
      )
    );

    console.log("🎉 Done! All data exported from Weaviate.");
  } catch (err) {
    console.error("❌ Failed during export:", err);
  }
}

main();
