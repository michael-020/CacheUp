import { commentForumModel, postForumModel } from "../../../models/db"
import { weaviateClient } from "../../../models/weaviate"


// Add logging to track progress
export const deletePost = async(mongoId: string, weaviateId: string) => {
    try{
        
        const [deleteCommentsMongo, commentWeaviate] = await Promise.all([
            commentForumModel.updateMany({post: mongoId}, {$set: {visibility: false}}),
            weaviateClient.graphql.get()
                .withClassName("Comment")
                .withFields("_additional { id }")
                .withWhere({
                    path: ["post", "Post", "id"],
                    operator: "Equal",
                    valueText: weaviateId
                })
                .do()
        ])
        
        
        const commentIdsWeaviate = commentWeaviate?.data?.Get?.Comment?.map((c: any) => c._additional.id) || [];
        
        await Promise.all([
            ...commentIdsWeaviate.map((commentId: string) => {
                console.log("Deleting Weaviate comment:", commentId);
                return weaviateClient.data.deleter()
                    .withClassName("Comment")
                    .withId(commentId)
                    .do()
            }),
            postForumModel.findByIdAndUpdate(mongoId, {visibility: false}),
            weaviateClient.data.deleter()
                .withClassName("Post")
                .withId(weaviateId)
                .do()  
        ])
        
        return {
            success: true, 
            msg: "Deleted the post and all the comments associated with it",
            deletedMongoComments : deleteCommentsMongo.modifiedCount,
            deletedWeaviateComments: commentIdsWeaviate.length 
        }
    } catch(e){ 
        console.error("Error in deletePost function:", e);
        return { success: false, msg: "Deleting was not totally successful", error: e }
    }
}