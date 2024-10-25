const express = require('express');  
const Conversation = require('../model/conversation'); // Your conversation model  
const Message = require('../model/message'); // Your message model  
const protectedRoute = require('../middleware/protectedRoute'); // Middleware for protected routes  
const User = require('../model/user');


const router = express.Router()

const emoji = [
    "👾", "⭐", "🌟", "🎉", "🎊", "🎈", "🎁", "🎂", "🎄", "🎃", "🎗", "🎟", "🎫",
    "🎖", "🏆", "🏅", "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉",
    "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🏏", "⛳", "🏹", "🎣", "🥊", "🥋", "🎽",
    "⛸", "🥌", "🛷", "🎿", "⛷", "🏂", "🏋️", "🤼", "🤸", "🤺", "⛹️", "🤾", "🏌️",
    "🏇", "🧘"
];

// Utility function to select a random emoji
const getRandomEmoji = () => {
    return emoji[Math.floor(Math.random() * emoji.length)];
};



router.post('/sendMessages/:id', protectedRoute, async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validate input
        if (!message || !receiverId) {
            return res.status(400).json({ error: 'Message and receiverId are required.' });
        }

        // Find or create the conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Create the new message
        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });

        const savedMessage = await newMessage.save();
        conversation.messages.push(savedMessage._id);
        await conversation.save();
        
        res.redirect(`/getMessages/${receiverId}`);
    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.get('/getMessages/:id', protectedRoute, async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        const messages = conversation ? conversation.messages : [];
        
        const selectedUser = await User.findById(receiverId).select("-password");
        const loggedInUser = await User.findById(senderId).select("-password");

        const data = await User.find({ _id: { $ne: senderId } }).select("-password");
        data.forEach(user => {
            user.randomEmoji = getRandomEmoji();  // Add a random emoji property to each user
        });

        res.render('main/home', {
            data,
            selectedUser: selectedUser || null,
            messages,
            loggedInUser
        });
    } catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router; 