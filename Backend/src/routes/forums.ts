import { Router } from "express";
import { getAllForumsHandler } from "../handlers/forums/getAllForumsHandler";
import { createThreadHandler } from "../handlers/forums/createThreadHandler";


const forumsRouter = Router()


// get all forums
forumsRouter.get("/get-forums", getAllForumsHandler)

// create threads
forumsRouter.post("/create-thread", createThreadHandler)

export default forumsRouter