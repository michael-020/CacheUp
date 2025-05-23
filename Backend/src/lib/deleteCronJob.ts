import cron from 'node-cron'
import { adminModel, commentForumModel, forumModel, postForumModel, postModel, userModel } from '../models/db'

cron.schedule('0 0 * * 0', async() => {
    try {
        const results = await Promise.all([
            userModel.deleteMany({ visibility: false }),
            adminModel.deleteMany({ visibility: false }),
            postModel.deleteMany({ visibility: false }),
            forumModel.deleteMany({ visibility:false }),
            postForumModel.deleteMany({ visibility: false }),
            commentForumModel.deleteMany({ visibility: false }),
            postModel.updateMany({},
                {$pull: {comments: { visibility: false }}}
            )
        ])
        console.log(`Cron job completed for visibility off delete. Following are deleted counts
            - Users: ${results[0].deletedCount}
            - Admins: ${results[1].deletedCount}
            - Posts: ${results[2].deletedCount}
            - Forums: ${results[3].deletedCount}
            - PostForums: ${results[4].deletedCount}
            - CommentForums: ${results[5].deletedCount}
            - Post comment cleanup: ${results[6].modifiedCount} 
        `)
    } catch (error) {
        console.error(error)
    }
})