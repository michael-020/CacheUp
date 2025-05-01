import { postForumModel, threadForumModel } from "../../../models/db"
import { weaviateClient } from "../../../models/weaviate"
import { deletePost } from "./deletePost"


export const deleteThread = async(mongoId: string, weaviateId: string) => {
    try{
        const posts = await postForumModel.find({ thread: mongoId })

        const postIdsMongo = posts.map((post) => post._id)
        const postIdsWeaviate = posts.map((post) => post.weaviateId)

        await Promise.all(postIdsMongo.map((id, index) => deletePost(id as string, postIdsWeaviate[index])))

        await Promise.all([
            threadForumModel.findByIdAndUpdate(mongoId, {visibility: false}),
            weaviateClient.data.deleter()
                .withClassName("Thread")
                .withId(weaviateId)
                .do()
        ])
        return {
            success: true,
            msg: "thread and all the related posts and comments deleted successfully"
        }
    }catch(e){
        console.error(e)
        return {
            success: false,
            msg: "Some things could not be deleted, we got into an error",
            error: e
        }
    }
} 