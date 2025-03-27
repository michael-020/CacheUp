import { JwtPayload } from "jsonwebtoken";
import { IAdmin, IUser } from "../models/db";
import { Types } from "mongoose";

declare global {
    namespace Express{
        interface Request{
            userId?: string | JwtPayload,
            user: IUser ,
            admin: IAdmin
        }
    }
}

