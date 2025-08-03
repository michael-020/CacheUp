import { commentForumModel, postForumModel } from "../../../models/db"
import { prisma } from "../../../lib/prisma"


// Add logging to track progress
export const deletePost = async(mongoId: string, vectorId: string) => {
    try{
        
        const [deleteCommentsMongo, commentVector] = await Promise.all([
            commentForumModel.updateMany({post: mongoId}, {$set: {visibility: false}}),
            prisma.comment.deleteMany({
                where: { postId: vectorId }
            })
        ])
        
        await Promise.all([
            postForumModel.findByIdAndUpdate(mongoId, {visibility: false}),
            prisma.post.delete({
                where: { id: vectorId }
            })
        ])
        
        return {
            success: true, 
            msg: "Deleted the post and all the comments associated with it",
            deletedMongoComments : deleteCommentsMongo.modifiedCount,
            deletedVectorComments: commentVector.count
        }
    } catch(e){ 
        console.error("Error in deletePost function:", e);
        return { success: false, msg: "Deleting was not totally successful", error: e }
    }
}