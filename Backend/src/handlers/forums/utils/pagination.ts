import { postForumModel } from "../../../models/db";

const postsPerPage = 10;
export const calculatePostPage = async (threadId: string, postId: string) => {  
    try {
        const posts = await postForumModel.find({thread: threadId, visibility: true}).sort({ createdAt: 1 }).select("_id").lean()
        const index = posts.findIndex((post) => post._id === postId)
        if(index === -1) return null;

        const pageNumber = Math.floor(index / postsPerPage) + 1
        return pageNumber
    } catch (error) {
        console.error(error)
    }
};

export const calculateBatchPostPages = async (posts: Array<{threadId: string, postId: string}>) => {
    try {
        const threadIds = [...new Set(posts.map(post => post.threadId))]
        const threadPostMap = await getThreadPostMap(threadIds)
        const result = new Map<string, number>();

        for (const {threadId, postId} of posts) {
            const poststhread = threadPostMap.get(threadId)

            if(poststhread){
                const index = poststhread.findIndex((post: any) => post._id.toString() === postId)

                if(index !== -1) {
                    const pageNumber = Math.floor( index / postsPerPage ) + 1
                    result.set(postId, pageNumber)
                }
            }
        }
        return result
    } catch (error) {
        console.error(error)
        return new Map()
    }
}

export const getThreadPostMap = async (threadIds: string[]) => {
    try {
        const uniqueThreadIds = [...new Set(threadIds)]

        const threadPostCounts = await Promise.all(
            uniqueThreadIds.map(threadId => {
                return postForumModel.find({ thread: threadId, visibility: true }).sort({ createdAt: 1 }).select("_id createdAt").lean()
            })
        )

        const threadPostMap = new Map ();
        uniqueThreadIds.forEach((threadId, index) => {
            threadPostMap.set(threadId, threadPostCounts[index])
        })
        return threadPostMap
    } catch (error) {
        console.error(error)
        return new Map()
    }
}