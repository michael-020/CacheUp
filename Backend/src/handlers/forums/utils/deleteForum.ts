import { forumModel, threadForumModel } from "../../../models/db"
import { deleteThread } from "./deleteThread"
import { prisma } from "../../../lib/prisma"


export const deleteForum = async(mongoId: string, vectorId: string) => {
    try{
        const threads = await threadForumModel.find({forum: mongoId})
        const threadIdsMongo = threads.map((thread) => thread._id)
        const threadIdsWeaviate = threads.map((thread) => thread.weaviateId)

        if (!vectorId || !/^[0-9a-fA-F-]{36}$/.test(vectorId)) {
            throw new Error(`Invalid Weaviate ID: ${vectorId}`);
        }

        await Promise.all(threadIdsMongo.map((id, index) => deleteThread(id as string, threadIdsWeaviate[index] as string)))

        await Promise.all([
            forumModel.findByIdAndUpdate(mongoId, {visibility: false}),
            prisma.forum.delete({
                where: {
                    id: vectorId
                }
            })
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