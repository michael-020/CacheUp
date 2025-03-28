import { JwtPayload } from "jsonwebtoken";
import { IAdmin, IUser } from "../models/db";

declare global {
    namespace Express{
        interface Request{
            userId?: string | JwtPayload,
            user: IUser,
            admin: IAdmin
        }
    }
}

