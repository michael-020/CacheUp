import { Router } from "express";
import { getAllForumsHandler } from "../handlers/forums/getAllForumsHandler";
import { createThreadHandler } from "../handlers/forums/createThreadHandler";
import { authMiddleware } from "../middlewares/auth";
import { createPostForumshandler } from "../handlers/forums/createPostForumsHandler";
import { createCommentForumHandler } from "../handlers/forums/createCommentForumHandler";
import { searchForumHandler } from "../handlers/forums/searchForumHandler";


const forumsRouter = Router()

forumsRouter.use(authMiddleware)
// get all forums
forumsRouter.get("/get-forums", getAllForumsHandler)

// create threads
forumsRouter.post("/create-thread/:forumMongo/:forumWeaviate", createThreadHandler)

// create Posts
forumsRouter.post("/create-post/:threadMongo/:threadWeaviate", createPostForumshandler)

// create comments
forumsRouter.post("/create-comment/:postMongo/:postWeaviate", createCommentForumHandler)

// search forums
forumsRouter.get("/search-forums/:query", searchForumHandler)

export default forumsRouter