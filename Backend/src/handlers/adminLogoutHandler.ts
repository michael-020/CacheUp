import { Request, Response } from "express"


export const adminLogoutHandler = async (req: Request, res: Response) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error while logging out", error)
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}