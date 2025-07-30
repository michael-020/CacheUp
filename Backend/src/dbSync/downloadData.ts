import dotenv from "dotenv";
dotenv.config();
import { writeFile } from "fs/promises"
import { forumModel, threadForumModel, postForumModel, commentForumModel } from "../models/db";
import { embedtext } from "../lib/vectorizeText";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL as string).then(() => console.log("Connected to db") ).catch((err) => console.error(err))
async function downloadData () {
	try{
		const [forums, threads, posts, comments] = await Promise.all([
			forumModel.find({ visiblility: true }).lean(),
			threadForumModel.find({ visiblility: true }).lean(),
			postForumModel.find({ visiblility: true }).lean(),
			commentForumModel.find({ visiblility: true }).lean()
		])

		console.log("fetching done")
		const forumsWeaviate = await Promise.all(forums.map(async (forum: any) => {
			console.log(forum)
			const vector = await embedtext(forum.title + " " + forum.description)
			return {
				id: forum.weaviateId,
				mongoId: forum._id,
				vector,
				title: forum.title,
				description: forum.description
			}
		}))


		const threadsWeaviate = await Promise.all(threads.map(async (thread: any) => {
			console.log(thread)
			const vector = await embedtext(thread.title + " " + thread.description)
			const forum = forums.find((f: any) => String(f._id) === String(thread.forum));
			return {
				id: thread.weaviateId,
				mongoId: thread._id,
				vector,
				title: thread.title,
				description: thread.description,
				forum: [{ beacon: `weaviate://localhost/Forum/${forum!.weaviateId}` }]
			}
		}))


		const postsWeaviate = await Promise.all(posts.map(async(post: any) => {
			console.log(post)
			const vector = await embedtext(post.content)
			const thread = threads.find((t: any) => String(t._id) == String(post.thread))
			return {
				id: post.weaviateId,
				mongoId: post._id,
				vector,
				content: post.content,
				thread: [{ beacon: `weaviate://localhost/Thread/${thread!.weaviateId}` }]
			}
		}))

		const commentsWeaviate = await Promise.all(comments.map(async(comment: any) => {
			console.log(comment)
			const vector = await embedtext(comment.content)
			const post = posts.find((p: any) => String(p._id) == String(comment.post))
			return {
				id: comment.weaviateId,
				mongoId: comment._id,
				vector,
				content: comment.content,
				post: [{ beacon: `weaviate://localhost/Post/${post!.weaviateId}` }]
			}
		}))

		await Promise.all([
			writeFile("forumsWeaviate.json", JSON.stringify(forumsWeaviate, null, 2), 'utf-8'),
			writeFile("threadsWeaviate.json", JSON.stringify(threadsWeaviate, null, 2), 'utf-8'),
			writeFile("postsWeaviate.json", JSON.stringify(postsWeaviate, null, 2), 'utf-8'),
			writeFile("commentsWeaviate.json", JSON.stringify(commentsWeaviate, null, 2), 'utf-8')
		])
	}catch(error) {
		console.error(error)
	}
}
downloadData()