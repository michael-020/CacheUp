import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import { adminModel, IAdmin, IUser, userModel } from "../models/db";
import JWT_SECRET from "../config";

interface customDecodedInterface {
    userId?: string,
    user: IUser,
    admin: IAdmin
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies.jwt;

        if(!token){
            res.status(401).json({
                msg: "Access denied"
            })
            return
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if(decoded){
            const user = await userModel.findById((decoded as customDecodedInterface).userId).select("-password")
            if(!user){
                res.status(400).json({
                    msg: "user not found"
                })
                return
            }
            // req.userId = (decoded as customDecodedInterface).userId
            req.user = user
            next()
        }
        else{
            res.status(401).json({
                msg: "You are not logged in"
            })
            return
        }

    }   
    catch (e) {
        console.error("Error while verifying token");
        res.status(401).json({
            msg: "You are not logged in"
        })
        return
    }
}

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies.jwt;

        if(!token){
            res.status(401).json({
                msg: "Access denied"
            })
            return
        }

        const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

        if(decoded){
            const user = await adminModel.findById((decoded as customDecodedInterface).userId).select("-password")
            if(!user){
                res.status(400).json({
                    msg: "user not found"
                })
                return
            }
            // req.userId = (decoded as customDecodedInterface).userId
            req.admin = user
            next()
        }
        else{
            res.status(401).json({
                msg: "You are not logged in"
            })
            return
        }

    }   
    catch (e) {
        console.error("Error while verifying token");
        res.status(401).json({
            msg: "You are not logged in"
        })
        return
    }
}