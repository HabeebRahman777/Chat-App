import User from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId,io } from "../lib/socket.js"

export const getUsersForSidebar = async(req,res)=>{
    try {
      const loggedInUserId=req.user._id
      const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password")

      res.status(200).json(filteredUsers)
    } catch (error) {
      console.log("Error in getUsersForSidebar: ",error.message) 
      res.status(500).json({error:"Internal server error"}) 
    }
}

export const getMessages = async(req,res)=>{
  try {
    const {id:userToChatId}=req.params
    const myId=req.user._id

    const messages = await Message.find({
      $or:[
        {senderId:myId,receiverId:userToChatId},
        {senderId:userToChatId,receiverId:myId}
      ]
    })
    
    res.status(200).json(messages)
    
  } catch (error) {
    console.log("Error in getMessages controller",error.message)
    res.status(500).json({error:"Internal server error"})
  }
}

export const sendMessage = async(req,res)=>{
  try {
    const {text,image}=req.body
    const {id:receiverId}=req.params
    const senderId=req.user._id

    let imageUrl
    if(image){
      const uploadResponse=await cloudinary.uploader.upload(image)
      imageUrl=uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image:imageUrl
    })

    await newMessage.save()

    //todo:realtime functionality goes here=>socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage)
  } catch (error) {
    console.log("Error in sendMessage controller",error.message)
    res.status(500).json({error:"Internal server error"})
  }
}


export const sendFriendRequest = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;

    const senderUser = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!senderUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.requests.includes(userId)) {
        return res.status(400).json({ message: "Friend request already sent." });
    }

    targetUser.requests.push(userId);
    senderUser.sentRequests.push(targetUserId);

    await targetUser.save();
    await senderUser.save();

    res.status(200).json({ message: "Friend request sent successfully.", sentRequests: senderUser.sentRequests });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

export const fetchSendRequests = async(req,res)=>{
  try {
    const {id:userId}=req.params 

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ sentRequests: user.sentRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const fetchRequests = async(req,res)=>{
  try {
    const {id:userId}=req.params 

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ requests: user.requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const acceptRequest = async(req,res)=>{
  const { loggedInUserId,userId } = req.body;
  try {
    await User.findByIdAndUpdate(loggedInUserId,{
      $pull:{requests:userId},
      $push:{friends:userId}
    })

    await User.findByIdAndUpdate(userId,{
      $pull:{sentRequests:loggedInUserId},
      $push:{friends:loggedInUserId}
    })

    res.status(200).json({message:"Friend request accepted"})

  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const fetchFriends = async(req,res)=>{
  const {id:userId}=req.params
  try {
    
    const user = await User.findById(userId)

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ friends: user.friends });
} catch (error) {
    console.error("Error fetching friend list:", error);
    res.status(500).json({ message: "Internal server error" });
}

}