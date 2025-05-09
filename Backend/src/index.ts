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
import session from "express-session";
import MongoStore from "connect-mongo";

// Add before session middleware
app.set('trust proxy', 1);

// Initialize session middleware before other middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day in seconds
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Must be true in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.cacheupp.com' : undefined,
        maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    },
    proxy: process.env.NODE_ENV === 'production' // Trust the reverse proxy
}));

// CORS configuration must come after session middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL as string, "http://localhost:5173", process.env.WEB_URL as string],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
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