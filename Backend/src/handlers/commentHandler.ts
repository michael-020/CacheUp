import { Router } from "express";

import { uploadCommentHandler } from "./uploadCommentHandler";
// import { getCommentHandler } from "./getCommentHandler";
import { updateCommentHandler } from "./updateCommentHandler";
import { deleteCommentHandler } from "./deleteCommentHandler";

const commentHandler: Router = Router();

// upload a comment
commentHandler.put("/:id", uploadCommentHandler)

// update my own comment
commentHandler.put("/:postId/:commentId", updateCommentHandler)

// delete my own comment
commentHandler.delete("/:postId/:commentId", deleteCommentHandler)


export default commentHandler;