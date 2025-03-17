import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import "./types/override";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user";
import adminRouter from "./routes/admin";
import postRouter from "./routes/posts";
import path from "path";
import cookieParser from "cookie-parser";

const app: Express = express();

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/post", postRouter);

async function main() {
    try {
        const mongoUrl = process.env.MONGO_URL || "";
        await mongoose.connect(mongoUrl);
        console.log("Connected to DB");

        // Start server and store reference to close it properly
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Handle shutdown on SIGINT or SIGTERM
        process.on('SIGINT', () => {
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

        process.on('SIGTERM', () => {
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    } catch (e) {
        console.error("Error while connecting to DB", e);
        process.exit(1);
    }
}

main();
