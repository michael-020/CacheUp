import  { Request, Response, Router } from "express";
import { chatModel, chatRoomModel, userModel } from "../models/db";
import { userSocketMap } from "../websockets/index";
import cloudinary from "../lib/cloudinary";
import { authMiddleware } from "../middlewares/auth";


const messageRouter = Router()

messageRouter.get("/:id", authMiddleware, async (req: Request, res: Response) => {
    const userId = req.user._id
    const user2Id = req.params.id

    const user  = await userModel.findById(userId);
    const user2 = await userModel.findById(user2Id)
    
    if(!user){
        res.json({
            msg: "user not found"
        })
        return
    }
    if(!user2){
        res.json({
            msg: "user2 not found"
        })
        return
    }

    const checkRoom = await chatRoomModel.findOne({ participants: { $all: [userId, user2Id] } });
    if(checkRoom){
        const messages = await chatRoomModel.find({chatRoom: checkRoom._id})
        res.json({
            msg: "room joined",
            messages
        })
        return
    }

    const newRoom = await chatRoomModel.create({
        participants: [user, user2]
    })
    const messages = await chatRoomModel.find({chatRoom: newRoom._id})
    res.json({
        msg: "room created",
        messages
    })
})  

messageRouter.post("/:id", authMiddleware, async (req: Request, res: Response) => {
    try{
        const myId = req.user._id;
        const otherUserId = req.params.id
        const {content, image} = req.body

        const otherUser = await userModel.findById(otherUserId)
        if(!otherUser){
            res.status(401).json({
                msg: "user not found"
            })
        }
    
        let chatRoom = await chatRoomModel.findOne({
            participants: { $all: [myId, otherUserId ] } 
        })
        if(!chatRoom){
            chatRoom = new chatRoomModel({
                participants: [myId, otherUserId],
                messages: [] 
            });
           
            await chatRoom.save()
        }

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
       
        const message = new chatModel({
            content,
            image: imageUrl,
            sender: myId,
            chatRoom: chatRoom._id
        })
    
        await message.save()
    
        chatRoom.messages?.push(message._id);
        await chatRoom.save();

        const receiverWs = userSocketMap[otherUserId];

        if (receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(
                JSON.stringify({ type: "NEW_MESSAGE", payload: message })
            );
        } 
    
        res.status(200).json({
            msg: "Message sent",
            message
        });
    }
    catch(e) {
        console.error("error while sending message", e)
        res.status(500).json("error while sending message")
    }
})

export default messageRouter