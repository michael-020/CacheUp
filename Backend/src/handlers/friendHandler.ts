import { Router, Response } from "express";
import { Request } from "express";
import { userModel } from "../models/db";
import { authMiddleware } from "../middlewares/auth";
import mongoose, { Types } from "mongoose";

const friendHandler: Router = Router();

friendHandler.use(authMiddleware);

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

// Friend request sending endpoint
friendHandler.post("/send-request", async (req: Request, res: Response) => {
    try {
      const senderId = req.user._id as Types.ObjectId;
      const { receiverId } = req.body;
  
      if (!isValidObjectId(receiverId)) {
         res.status(400).json({ message: "Invalid receiver ID" });
         return;
      }
  
      const receiverObjectId = new Types.ObjectId(receiverId);
  
      if (senderId.equals(receiverObjectId)) {
         res.status(400).json({ message: "Cannot send request to yourself" });
         return;
      }
  
      const [receiver, existingFriendship] = await Promise.all([
        userModel.findById(receiverObjectId),
        userModel.findOne({
          _id: receiverObjectId,
          $or: [
            { friends: senderId },
            { friendRequests: senderId }
          ]
        })
      ]);
  
      if (!receiver) {
         res.status(404).json({ message: "User not found" });
         return;
      }
  
      if (existingFriendship) {
        const message = existingFriendship.friends.includes(senderId)
          ? "Already friends"
          : "Request already sent";
         res.status(400).json({ message });
         return;
      }
  
      await userModel.findByIdAndUpdate(receiverObjectId, {
        $addToSet: { friendRequests: senderId }
      });
  
       res.status(200).json({ message: "Friend request sent" });
       return;
    } catch (error) {
      console.error("Error:", error);
       res.status(500).json({ message: "Internal server error" });
       return;
    }
});

// Friend request acceptance endpoint
friendHandler.post("/accept-request", async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receiverId = req.user._id;
    const { senderId } = req.body;

    if (!isValidObjectId(senderId)) {
      await session.abortTransaction();
       res.status(400).json({ message: "Invalid sender ID" });
       return;
    }

    const senderObjectId = new Types.ObjectId(senderId);
    const receiver = await userModel.findById(receiverId).session(session);

    if (!receiver?.friendRequests.some(id => id.equals(senderObjectId))) {
      await session.abortTransaction();
       res.status(400).json({ message: "No pending request" });
       return;
    }

    await Promise.all([
      userModel.findByIdAndUpdate(
        receiverId,
        {
          $pull: { friendRequests: senderObjectId },
          $addToSet: { friends: senderObjectId }
        },
        { session, new: true }
      ),
      userModel.findByIdAndUpdate(
        senderObjectId,
        { $addToSet: { friends: receiverId } },
        { session, new: true }
      )
    ]);

    await session.commitTransaction();
     res.status(200).json({ message: "Request accepted" });
     return;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error accepting request:", error);
     res.status(500).json({ message: "Internal server error" });
     return;
  } finally {
    session.endSession();
  }
});

// Friend request rejection endpoint
friendHandler.post("/reject-request", async (req: Request, res: Response) => {
  try {
    const receiverId = req.user._id;
    const { senderId } = req.body;

    if (!isValidObjectId(senderId)) {
       res.status(400).json({ message: "Invalid sender ID" });
       return;
    }

    const result = await userModel.updateOne(
      { 
        _id: receiverId,
        friendRequests: new Types.ObjectId(senderId)
      },
      { $pull: { friendRequests: new Types.ObjectId(senderId) } }
    );

    if (result.matchedCount === 0) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    if (result.modifiedCount === 0) {
       res.status(400).json({ message: "No pending request to reject" });
       return;
    }

     res.status(200).json({ message: "Request rejected" });
     return;
  } catch (error) {
    console.error("Error rejecting request:", error);
     res.status(500).json({ message: "Internal server error" });
     return;
  }
});

// Get pending friend requests endpoint
friendHandler.get("/requests", async (req: Request, res: Response) => {
    try {
      const user = await userModel
        .findById(req.user._id)
        .populate({
          path: "friendRequests",
          select: "name username profilePicture",
          options: { lean: true }  // Better performance
        })
        .lean();
  
      if (!user) {
         res.status(404).json({ message: "User not found" });
         return
      }
  
       res.status(200).json({ 
        friendRequests: user.friendRequests || [] 
      });
      return
    } catch (error) {
      console.error("Error:", error);
       res.status(500).json({ message: "Internal server error" });
       return
    }
  });

// User sended  requests
  friendHandler.get("/sent-requests", async (req: Request, res: Response) => {
    try {
      const senderId = req.user._id;
  
      // Find users who have your ID in their friendRequests
      const users = await userModel
        .find({ friendRequests: senderId })
        .select("name username profilePicture")
        .lean();
  
       res.status(200).json({ sentRequests: users });
       return
    } catch (error) {
      console.error("Error fetching sent requests:", error);
       res.status(500).json({ message: "Internal server error" });
       return
    }
  });

// Get friends list endpoint
friendHandler.get("/", async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.user._id)
      .populate({
        path: "friends",
        select: "name username profilePicture department graduationYear",
        options: { lean: true }
      });

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return
    }

     res.status(200).json({ friends: user.friends });
     return
  } catch (error) {
    console.error("Error fetching friends:", error);
     res.status(500).json({ message: "Internal server error" });
     return
  }
});

// Friend removal endpoint
friendHandler.delete("/remove/:friendId", async (req: Request, res: Response) => {


  try {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    if (!friendId || !isValidObjectId(friendId)) {

       res.status(400).json({ message: "Invalid friend ID" });
       return
    }

    const friendObjectId = new Types.ObjectId(friendId);

    await Promise.all([
      userModel.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendObjectId } },
      ),
      userModel.findByIdAndUpdate(
        friendObjectId,
        { $pull: { friends: userId } },
      )
    ]);


     res.status(200).json({ message: "Friend removed" });
     return
  } catch (error) {

    console.error("Error removing friend:", error);
     res.status(500).json({ message: "Internal server error" });
     return
  } 
});

// Friend search endpoint
friendHandler.get("/search", async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      const userId = req.user._id;
  
      if (!query || typeof query !== "string") {
        res.status(400).json({ message: "Search query required" });
        return;
      }
  
      const searchRegex = new RegExp(query, "i");
  
      const users = await userModel.find({
        $and: [
          {
            $or: [
              { name: { $regex: searchRegex } },
              { username: { $regex: searchRegex } },
              { department: { $regex: searchRegex } }
            ]
          },
          { _id: { $ne: userId } }, 
          { friendRequests: { $ne: userId } } 
        ]
      }).select("name username profilePicture department graduationYear")
        .lean();
  
      const currentUser = await userModel.findById(userId).select("friends");
      const friendsSet = new Set(currentUser?.friends.map(id => id.toString()));
  
      const resultsWithStatus = users.map(user => ({
        ...user,
        isFriend: friendsSet.has(user._id.toString())
      }));
  
      res.status(200).json({ users: resultsWithStatus });
      return;
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  });

  friendHandler.get("/all-users", async (req: Request, res: Response) => {
    try {
      const users = await userModel.find()
        .select("name username profilePicture")
        .lean();
  
      res.status(200).json({ users });
      return;
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  });

friendHandler.delete("/cancel-request", async (req: Request, res: Response) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!isValidObjectId(receiverId)) {
       res.status(400).json({ message: "Invalid receiver ID" });
       return
    }

    const result = await userModel.updateOne(
      { 
        _id: new Types.ObjectId(receiverId),
        friendRequests: senderId
      },
      { $pull: { friendRequests: senderId } }
    );

    if (result.modifiedCount === 0) {
       res.status(400).json({ message: "No request to cancel" });
       return
    }

    res.status(200).json({ message: "Request canceled" });
  } catch (error) {
    console.error("Error canceling request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

friendHandler.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    
    const user = await userModel.findById(userId)
      .populate({
        path: "friends",
        select: "name username profilePicture department graduationYear",
        options: { lean: true }
      });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ friends: user.friends });
    return;
  } catch (error) {
    console.error("Error fetching user's friends:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

export default friendHandler;