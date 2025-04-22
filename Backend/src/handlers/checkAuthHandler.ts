import { Request, Response } from "express";

export const checkAuth = async (req: Request, res: Response) => {
    try {   
        const userData = {
            ...req.user,
            bio: req.user.bio || '', 
            friends: req.user.friends || [], 
            posts: req.user.posts || [],
            friendRequests: req.user.friendRequests || [],
        }
        res.status(200).json(userData)
        
    } catch (error) {
        console.error("Error while checking auth")
        res.status(500).json({
            msg: "Error while checking auth"
        })
        return
    }
}