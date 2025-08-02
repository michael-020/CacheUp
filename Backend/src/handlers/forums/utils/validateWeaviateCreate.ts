import { Response } from "express";
import { Document } from "mongoose";

interface WeaviateResponse {
    id?: string;
    [key: string]: any;
}

export const validateWeaviateCreate = async (
    mongoDoc: Document | null,
    weaviateRes: WeaviateResponse | null,
    res: Response,
    entityName: string,
    rollback?: () => Promise<void>
): Promise<boolean> => {
    if (!mongoDoc?._id) {
        res.status(500).json({
            msg: `Failed to create ${entityName}`
        });
        return false;
    }

    if (!weaviateRes?.id) {
        if (rollback) {
            await rollback();
        }
        res.status(500).json({
            msg: `Failed to create ${entityName}`
        });
        return false;
    }

    return true;
};