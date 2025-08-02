import { Response } from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { JWT_SECRET } from "../config"

export const generateToken = (userId: mongoose.Types.ObjectId, res: Response) => {
    const token = jwt.sign({
        userId
    }, JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.cacheupp.com' : undefined,
        path: '/',
    });
}