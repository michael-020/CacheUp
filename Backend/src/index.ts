import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "./types/override";
import userRouter from "./routes/user";
import adminRouter from "./routes/admin";
import postRouter from "./routes/posts";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/message";
import app, { server } from "./websockets";
import forumsRouter from "./routes/forums";
import authRouter from "./routes/auth";

app.use(cors({
    origin: [process.env.FRONTEND_URL as string, "http://localhost:3001"],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/forums", forumsRouter)
app.use("/api/v1/auth", authRouter);

// // Remove duplicate mounting of routes
app.use("/auth", authRouter);

async function main() {
    try {
        const mongoUrl = process.env.MONGO_URL || "";
        await mongoose.connect(mongoUrl);
        console.log("Connected to DB");

        // Start server and store reference to close it properly
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.error("Error while connecting to DB", e);
        process.exit(1);
    }
}
main();