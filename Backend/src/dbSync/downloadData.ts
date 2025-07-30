import dotenv from "dotenv";
dotenv.config();

import { writeFile, mkdir } from "fs/promises";
import mongoose from "mongoose";
import pLimit from "p-limit";
import path from "path";

import {
	forumModel,
	threadForumModel,
	postForumModel,
	commentForumModel,
} from "../models/db";
import { embedtext } from "../lib/vectorizeText";

const limit = pLimit(10);

async function main() {
	try {
		console.log("🔌 Connecting to MongoDB...");
		await mongoose.connect(process.env.MONGO_URL as string);
		console.log("✅ Connected to MongoDB");

		await downloadData();
		process.exit(0);
	} catch (err) {
		console.error("❌ Connection or download failed:", err);
		process.exit(1);
	}
}

async function downloadData() {
	try {
		console.log("📥 Fetching data from MongoDB...");

		const [forums, threads, posts, comments] = await Promise.all([
			forumModel.find({ visibility: true }).lean(),
			threadForumModel.find({ visibility: true }).lean(),
			postForumModel.find({ visibility: true }).lean(),
			commentForumModel.find({ visibility: true }).lean(),
		]);

		console.log(`✅ Fetched: ${forums.length} forums, ${threads.length} threads, ${posts.length} posts, ${comments.length} comments`);

		const forumMap = new Map(forums.map((f) => [String(f._id), f]));
		const threadMap = new Map(threads.map((t) => [String(t._id), t]));
		const postMap = new Map(posts.map((p) => [String(p._id), p]));

		let forumCount = 0;
		console.log("⚙️ Embedding forums...");
		const forumsWeaviate = await Promise.all(
			forums.map((forum) =>
				limit(async () => {
					const vector = await embedtext(forum.title + " " + forum.description);
					const done = ++forumCount;
					if (done % 25 === 0 || done === forums.length)
						console.log(`✅ Embedded forum ${done} / ${forums.length}`);
					return {
						id: forum.weaviateId,
						mongoId: forum._id,
						vector,
						title: forum.title,
						description: forum.description,
					};
				})
			)
		);

		let threadCount = 0;
		console.log("⚙️ Embedding threads...");
		const threadsWeaviate = await Promise.all(
			threads.map((thread) =>
				limit(async () => {
					const vector = await embedtext(thread.title + " " + thread.description);
					const done = ++threadCount;
					if (done % 50 === 0 || done === threads.length)
						console.log(`✅ Embedded thread ${done} / ${threads.length}`);
					const forum = forumMap.get(String(thread.forum));
					return {
						id: thread.weaviateId,
						mongoId: thread._id,
						vector,
						title: thread.title,
						description: thread.description,
						forum: forum
							? [{ beacon: `weaviate://localhost/Forum/${forum.weaviateId}` }]
							: [],
					};
				})
			)
		);

		let postCount = 0;
		console.log("⚙️ Embedding posts...");
		const postsWeaviate = await Promise.all(
			posts.map((post) =>
				limit(async () => {
					const vector = await embedtext(post.content);
					const done = ++postCount;
					if (done % 100 === 0 || done === posts.length)
						console.log(`✅ Embedded post ${done} / ${posts.length}`);
					const thread = threadMap.get(String(post.thread));
					return {
						id: post.weaviateId,
						mongoId: post._id,
						vector,
						content: post.content,
						thread: thread
							? [{ beacon: `weaviate://localhost/Thread/${thread.weaviateId}` }]
							: [],
					};
				})
			)
		);

		let commentCount = 0;
		console.log("⚙️ Embedding comments...");
		const commentsWeaviate = await Promise.all(
			comments.map((comment) =>
				limit(async () => {
					const vector = await embedtext(comment.content);
					const done = ++commentCount;
					if (done % 200 === 0 || done === comments.length)
						console.log(`✅ Embedded comment ${done} / ${comments.length}`);
					const post = postMap.get(String(comment.post));
					return {
						id: comment.weaviateId,
						mongoId: comment._id,
						vector,
						content: comment.content,
						post: post
							? [{ beacon: `weaviate://localhost/Post/${post.weaviateId}` }]
							: [],
					};
				})
			)
		);

		// 🔥 Ensure output directory exists
		const exportPath = path.resolve("export");
		await mkdir(exportPath, { recursive: true });
		console.log("🧭 Export path:", exportPath);

		// 📝 Write files
		console.log("💾 Writing files to disk...");
		await Promise.all([
			writeFile(path.join(exportPath, "forumsWeaviate.json"), JSON.stringify(forumsWeaviate, null, 2), "utf-8"),
			writeFile(path.join(exportPath, "threadsWeaviate.json"), JSON.stringify(threadsWeaviate, null, 2), "utf-8"),
			writeFile(path.join(exportPath, "postsWeaviate.json"), JSON.stringify(postsWeaviate, null, 2), "utf-8"),
			writeFile(path.join(exportPath, "commentsWeaviate.json"), JSON.stringify(commentsWeaviate, null, 2), "utf-8"),
		]);

		console.log("🎉 Done. All files exported successfully.");
	} catch (error) {
		console.error("❌ Error during export:", error);
	}
}

main();
