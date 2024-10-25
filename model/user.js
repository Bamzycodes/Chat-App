const mongoose = require('mongoose');  

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    profilePic: {
        type: String, // Ensure this field is defined
        required: false // Optional, depending on your needs
    },
    isOnline: {  // Add this field
        type: Boolean,
        default: false // Default value is false
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User; 