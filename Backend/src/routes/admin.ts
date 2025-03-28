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
import { getCommentHandler } from "../handlers/getCommentHandler";
import { adminDeleteCommentHandler } from "../handlers/deleteCommentHandler";
import { adminInfoHandler } from "../handlers/adminInfoHandlert";
import { checkAdminAuth } from "../handlers/checkAdminHandler";
import { adminLogoutHandler } from "../handlers/adminLogoutHandler";
import { createForumhandler } from "../handlers/forums/createForumHandler";
import { getAllForumsHandler } from "../handlers/forums/getAllForumsHandler";

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
adminRouter.get("/comment/:id", getCommentHandler)

// delete comment
adminRouter.delete("/comment/:postId/:commentId", adminDeleteCommentHandler)

// create forum
adminRouter.post("/create-forum", createForumhandler)

// get all forums
adminRouter.get("/get-forums", getAllForumsHandler)

export default adminRouter;