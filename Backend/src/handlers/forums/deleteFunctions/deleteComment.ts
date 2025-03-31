import { commentForumModel } from "../../../models/db"
import { weaviateClient } from "../../../models/weaviate"


export const deleteComment = async (mongoId: string, weaviateId: string) => {
    try{
        await Promise.all([
            commentForumModel.findByIdAndDelete(mongoId),
            weaviateClient.data.deleter()
                .withClassName("Comment")
                .withId(weaviateId)
                .do()
        ])
        return {success: true, msg: "Comment deleted successfully"}
    }catch(e){
        console.error(e)
        return {success: false, msg: "Error in deleting comment", e}
    }
}