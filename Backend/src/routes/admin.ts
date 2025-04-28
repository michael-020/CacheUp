import { Router } from "express";
import reportPostHandler from "../handlers/reportPostHandler";
import viewPostHandler from "../handlers/admin/viewPostHandler";
import postRouter from "./posts";
import viewProfileHanler from "../handlers/viewPostHandler";
import { createAdminHandler } from "../handlers/createAdminHandler";
import { adminLoginHandler } from "../handlers/adminLoginHandler";
import { adminMiddleware } from "../middlewares/auth";
import { adminDeletePostHandler } from "../handlers/deletePostHandler";
import { viewUsersHandler } from "../handlers/viewUsersHanlder";
// import { getCommentHandler } from "../handlers/getCommentHandler";
import { adminDeleteCommentHandler } from "../handlers/deleteCommentHandler";
import { adminInfoHandler } from "../handlers/adminInfoHandlert";
import { checkAdminAuth } from "../handlers/checkAdminHandler";
import { adminLogoutHandler } from "../handlers/adminLogoutHandler";
import { createForumhandler } from "../handlers/forums/createForumHandler";
import { getAllForumsHandler } from "../handlers/forums/getAllForumsHandler";
import { searchForumHandler } from "../handlers/forums/searchForumHandler";
import { adminDeletePostForumHandler } from "../handlers/forums/adminDeletePostForumHandler";
import { adminDeleteCommentForumHandler } from "../handlers/forums/adminDeleteCommentForumhandler";
import { adminDeleteThreadHandler } from "../handlers/forums/adminDeleteThreadHandler";
import { adminDeleteForumHandler } from "../handlers/forums/adminDeleteForumHandler";
import { editForumAdminHandler } from "../handlers/forums/editForumAdminHandler";
import { getAllThreadsFromAForumHandler } from "../handlers/forums/getAllThreadsFromAForumHandler";
import { viewAllThreadsHandler } from "../handlers/admin/viewThreadsHandler";
import { viewPostsInThreadHandler } from "../handlers/admin/viewPostsInThreadHandler";
import { adminGetForumRequestHandler } from "../handlers/forums/adminGetForumRequestHandler";
import { adminApproveForumHandler } from "../handlers/forums/adminApproveForumRequestHandler";
import { adminRejectForumRequestHandler } from "../handlers/forums/adminRejectForumRequestHandler";
import { adminGetRejectedForumRequestHandler } from "../handlers/forums/adminGetRejectedForumRequestHandler";
import { getAllCommentsFromAPostHandler } from "../handlers/forums/getAllCommentsFromAPostHandler";
import { getAllUsersStatsHandler, getUserStatsHandler } from "../handlers/userStatsHandler";
import { getDailyTimeSpentHandler } from '../handlers/timeTrackingHandler';

const adminRouter: Router = Router();

// create admin
adminRouter.post("/create-admin", createAdminHandler)

// admin login
adminRouter.post("/signin", adminLoginHandler)

adminRouter.use(adminMiddleware)

// check auth of admin
adminRouter.get("/check", checkAdminAuth)

adminRouter.post("/logout", adminLogoutHandler)

// view admin info
adminRouter.get("/view-admin-info", adminInfoHandler)

// delete a post
adminRouter.use("/delete", postRouter)

// view posts
adminRouter.use("/view-posts", viewPostHandler)

// delete a post
adminRouter.delete("/delete-post/:postId", adminDeletePostHandler)

// view reported posts
adminRouter.use("/report", reportPostHandler)

// view profile handler
adminRouter.use("/view-profile", viewProfileHanler)

// view user count and user list
adminRouter.get("/view-users", viewUsersHandler)

// comment get handler
// adminRouter.get("/comment/:id", getCommentHandler)

// delete comment
adminRouter.delete("/comment/:postId/:commentId", adminDeleteCommentHandler)

// create forum
adminRouter.post("/create-forum", createForumhandler)

// get all forums
adminRouter.get("/get-forums", getAllForumsHandler)

// get all threads in a forum
adminRouter.get("/get-threads/:forumId", viewAllThreadsHandler)

// get all posts in a thread
adminRouter.get("/get-thread-posts/:threadId", viewPostsInThreadHandler)

// get forums comments 
adminRouter.get("/get-comments/:postId", getAllCommentsFromAPostHandler)

// delete post
adminRouter.delete("/delete-post/:mongoId/:weaviateId", adminDeletePostForumHandler)

// search forums
adminRouter.get("/search-forums/:query", searchForumHandler)

// delete comments
adminRouter.delete("/delete-comment/:mongoId/:weaviateId", adminDeleteCommentForumHandler)

// delete thread
adminRouter.delete("/delete-thread/:mongoId/:weaviateId", adminDeleteThreadHandler)

// delete forum
adminRouter.delete("/delete-forum/:mongoId/:weaviateId", adminDeleteForumHandler)

// edit forum
adminRouter.put("/edit-forum/:mongoId/:weaviateId", editForumAdminHandler)

// get requested forums
adminRouter.get("/requested-forums", adminGetForumRequestHandler)

// approve requested forums
adminRouter.post("/approve-forum/:requestId", adminApproveForumHandler)

// reject requested forums
adminRouter.post("/reject-forum/:requestId", adminRejectForumRequestHandler)

// get rejected forums
adminRouter.get("/rejected-forums", adminGetRejectedForumRequestHandler)

// get all users stats (admin only)
adminRouter.get("/stats", getAllUsersStatsHandler);

// get specific user stats (admin only)
adminRouter.get("/stats/:userId", getUserStatsHandler);

// get daily time spent (admin only)
adminRouter.get('/stats/time-spent', getDailyTimeSpentHandler);

export default adminRouter;