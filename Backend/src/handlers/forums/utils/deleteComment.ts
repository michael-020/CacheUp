import { commentForumModel } from "../../../models/db"
import { prisma } from "../../../lib/prisma"

export const deleteComment = async (mongoId: string, vectorId: string) => {
    try{
        await Promise.all([
            commentForumModel.findByIdAndUpdate(mongoId, {visibility: false}),
            prisma.comment.delete({
                where: { id: vectorId }
            })
        ])
        return {success: true, msg: "Comment deleted successfully"}
    }catch(e){
        console.error(e)
        return {success: false, msg: "Error in deleting comment", e}
    }
}