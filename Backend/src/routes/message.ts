import { Request, Response, Router } from "express";
import { chatModel, chatRoomModel, userModel } from "../models/db";
import { userSocketMap } from "../websockets/index";
import cloudinary from "../lib/cloudinary";
import { authMiddleware } from "../middlewares/auth";
import { WebSocket } from 'ws';
import { mongo } from "mongoose";

const messageRouter = Router()

messageRouter.use(authMiddleware)

messageRouter.get("/chat/:id", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id
        const user2Id = req.params.id

        const user = await userModel.findById(userId);
        const user2 = await userModel.findById(user2Id)
        
        if(!user || !user2){
            res.status(404).json({
                msg: "User not found"
            })
            return
        }

        // Find or create chat room
        let chatRoom = await chatRoomModel.findOne({ 
            participants: { $all: [userId, user2Id] } 
        }).populate('messages');

        if(!chatRoom){
            chatRoom = new chatRoomModel({
                participants: [userId, user2Id],
                messages: []
            });
            await chatRoom.save();
        }

        // Fetch messages, sorted by creation time
        const messages = await chatModel.find({ 
            chatRoom: chatRoom._id 
        }).sort({ createdAt: 1 });

        res.json({
            msg: "Room messages fetched",
            messages
        })
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
})  

messageRouter.post("/chat/:id", async (req: Request, res: Response) => {
    try {
        const myId = req.user._id;
        const otherUserId = req.params.id
        const { content, image } = req.body

        // Validate input
        if (!content && !image) {
            res.status(400).json({ msg: "Message content or image is required" });
            return
        }

        const otherUser = await userModel.findById(otherUserId)
        if(!otherUser){
            res.status(404).json({ msg: "User not found" })
            return
        }
    
        // Find or create chat room
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

        // Handle image upload
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
       
        // Create message
        const message = new chatModel({
            content,
            image: imageUrl,
            sender: myId,
            receiver: otherUserId,
            chatRoom: chatRoom._id
        })
    
        await message.save()
    
        // Update chat room
        chatRoom.messages?.push(message._id);
        await chatRoom.save();

        // Prepare message payload
        const messagePayload = {
            _id: message._id,
            content: message.content,
            image: message.image,
            sender: myId,
            receiver: otherUserId,
            chatRoom: chatRoom._id,
            createdAt: message.createdAt
        };

        // Try to send WebSocket message
        const receiverWs = userSocketMap[otherUserId];
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(
                JSON.stringify({ 
                    type: "NEW_MESSAGE", 
                    payload: messagePayload 
                })
            );
        } 
    
        res.status(200).json({
            msg: "Message sent",
            message: messagePayload
        });
    }
    catch(error) {
        console.error("Error while sending message", error)
        res.status(500).json({ msg: "Error while sending message"})
    }
})

messageRouter.get("/get-all-messages", async (req: Request, res: Response) => {
    try {
        const userId = req.user
        const chats = await chatModel.find({ receiver: userId })
        if(!chats) {
            res.json({
                msg: "Messages not found"
            })
            return
        }

        res.json(chats)
    } catch (error) {
        console.error("Error while getting all messages", error)
        res.status(500).json({ msg: "Error while getting all messages"})
    }
})

messageRouter.get("/get-unread-messages", async (req: Request, res: Response) => {
    try {
        const userId = req.user
        const chats = await chatModel.find({ 
            $and: [
                {receiver: userId},
                {isRead: false}
            ]
        })

        if(!chats) {
            res.json({
                msg: "Messages not found"
            })
            return
        }

        res.json(chats)
    } catch (error) {
        console.error("Error while getting unread messages", error)
        res.status(500).json({ msg: "Error while getting unread messages"})
    }
})

messageRouter.put("/read-message", async (req: Request, res: Response) => {
    try {
        const { messageIds } = req.body; 
        if (!Array.isArray(messageIds) || messageIds.length === 0) {
            res.status(400).json({ msg: "Invalid message IDs" });
            return
        }

        const result = await chatModel.updateMany(
            { _id: { $in: messageIds }, isRead: false }, 
            { $set: { isRead: true } }
        );

        const updatedchats = await chatModel.find(
            { _id: { $in: messageIds } }
        );

        res.json({
            updatedCount: result.modifiedCount ,
            updatedchats
        });
    } catch (error) {
        console.error("Error while marking messages as read", error)
        res.status(500).json({ msg: "Error while marking messages as read"})
    }
})

messageRouter.get("/previous-chats", async (req: Request, res: Response) => {
    try {
        const userId = req.user._id
        
        // Fetch chat rooms where the user is a participant
        const chatRooms = await chatRoomModel.find({ participants: userId }).populate("participants");

        if (!chatRooms || chatRooms.length === 0) {
            res.json({ msg: "No previous chats found" });
            return
        }

        // Extract participants and remove duplicates
        const usersSet = new Map();

        chatRooms.forEach(room => {
            room.participants.forEach(user => {
                if (user._id.toString() !== userId.toString()) {
                    usersSet.set(user._id.toString(), user);
                }
            });
        });

        // Convert Map values to array (unique users)
        const uniqueUsers = Array.from(usersSet.values());

        res.json(uniqueUsers);
    } catch (error) {
        console.error("Error while getting previous chats", error)
        res.status(500).json({ msg: "Error while getting previous chats"})
    }
})

export default messageRouter