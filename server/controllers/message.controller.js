import cloudinary from "../lib/cloudinary/cloudinary.js"
import { dataSender } from "../lib/data/dataSender.js"
import Message from '../models/message.model.js'
import User from "../models/user.model.js"

export const getUsersForSidebar=async(req,res)=>{
    const loggedInUserId=req.user._id
    // get all user except yourself id!=yourself
    const filterUsers=await User.find({_id:{$ne:loggedInUserId}}).select('-password')
    
    return dataSender(res,{message:"success",data:filterUsers},200)
}

export const getMessages=async(req,res)=>{
    const {id:userToChatId}=req.params
    const senderId=req.user._id

    // fetch all the msg from sender to receiver || receiver to sender
    const messages = await Message.find({
        $or: [
            { senderId: senderId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: senderId }
        ]
    });

    return dataSender(res,{message:"success",data:messages},200)
}

export const sendMessage=async(req,res)=>{
    const {text,image}=req.body
    const {id:receiverId}=req.params
    const senderId=req.user._id

    let imageUrl;
    if(image){
        const uploadResponse=await cloudinary.uploader.upload(image)
        imageUrl=uploadResponse.secure_url
    }
    const newMessage=new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl
    })
    await newMessage.save()

    return dataSender(res,{message:"success",...newMessage},200)
}