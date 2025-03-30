import { forumModel, threadForumModel } from "../../../models/db"
import { weaviateClient } from "../../../models/weaviate"
import { deleteThread } from "./deleteThread"


export const deleteForum = async(mongoId: string, weaviateId: string) => {
    try{
        const threads = await threadForumModel.find({forum: mongoId})
        const threadIdsMongo = threads.map((thread) => thread._id)
        const threadIdsWeaviate = threads.map((thread) => thread.weaviateId)

        if (!weaviateId || !/^[0-9a-fA-F-]{36}$/.test(weaviateId)) {
            throw new Error(`Invalid Weaviate ID: ${weaviateId}`);
        }

        await Promise.all(threadIdsMongo.map((id, index) => deleteThread(id as string, threadIdsWeaviate[index])))

        await Promise.all([
            forumModel.findByIdAndDelete(mongoId),
            weaviateClient.data.deleter()
                .withClassName("Forum")
                .withId(weaviateId)
                .do()
        ])
        return {
            success: true,
            msg: "Forum delete successfully"
        }
    }catch(e){
        console.error(e)
        return{
            success: false,
            msg: "Forum was not deleted successfully"
        }
    }
}