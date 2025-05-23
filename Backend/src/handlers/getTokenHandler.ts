import { Request, Response } from "express";


export const getTokenHandler = (req: Request, res: Response) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({ error: 'No token found' });
            return
        }
        res.json({ token });
    } catch (error) {
        console.error(error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
        
}