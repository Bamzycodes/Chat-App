const express = require('express');  
const User = require('../model/user'); // No need for .js if it's a CommonJS module  
const bcrypt = require('bcryptjs');  
// const generateToken = require('../middleware/generateToken'); // Uncomment this if needed  
const generateTokenAndSetCookie = require('../middleware/generateToken');
const protectedRoute = require('../middleware/protectedRoute');
const { io } = require('../socket/socket');
const router = express.Router()

router.post("/signup", async (req, res) => {  
    try {  
        console.log("Request Body:", req.body); // Log the request body  
  
        const { fullname, username, password, confirmPassword, gender } = req.body;  
  
        // Check for missing fields  
        if (!fullname || !username || !password || !confirmPassword || !gender) {  
            return res.status(400).json({ error: "All fields are required." });  
        }  
  
        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }
  
        // Check if user already exists  
        const existingUser = await User.findOne({ username });  
        if (existingUser) {  
            return res.status(400).json({ error: "Username already exists." });  
        }  
  
        // Hash the password  
        const salt = await bcrypt.genSalt(10);  
        const hashedPassword = await bcrypt.hash(password, salt);  
  
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
  
        const newUser = new User({
            fullname,
            username,
            password: hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        }); 
  
        // Save the new user  
        await newUser.save();  
  
        // Generate a token and set a cookie  
        generateTokenAndSetCookie(newUser._id, res);  

        return res.redirect('/login');
    } catch (error) {  
        console.log("Error in signup controller", error.message);  
        res.status(500).json({ error: "Internal Server Error" });  
    }  
  });
  

router.post('/login', async (req, res) => {  
    // const { username, password } = req.body;  


    // try {  
    //     const user = await User.findOne({ username });  

    //     if (!user) {  
    //         return res.status(401).send({ message: 'Invalid username or password' });  
    //     }  
        
    //     const isMatch = await bcrypt.compare(password, user.password);  
    //     if (isMatch) {  
    //         return res.send({  
    //             _id: user._id,  
    //             fullname: user.fullname,  
    //             username: user.username,  
    //             isAdmin: user.isAdmin,  
    //             token: generateToken(user),  
    //         });  
    //     }  
        
    //     return res.status(401).send({ message: 'Invalid username or password' });  
    // } catch (error) {  
    //     console.error("Login error:", error);  
    //     res.status(500).send({ message: 'An error occurred during login', error });  
    // }  

        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
    
            if (!user) {
                return res.status(400).json({ error: "Invalid username or password" });
            }
    
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ error: "Invalid username or password" });
            }
    
            // After login, emit an event to notify the server that this user is now online
            io.emit('userOnline', user._id);  // Notify all clients via socket
    
            // Update user's online status
            user.isOnline = true;
            await user.save();
    
            generateTokenAndSetCookie(user._id, res);
            return res.redirect('/');
        } catch (error) {
            console.log("Error in login controller", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    
});  


router.get('/logout', protectedRoute, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (user) {
            // Set the user status to offline in the DB
            user.isOnline = false;
            await user.save();
            
            // Emit the user's offline status via socket
            io.emit('userOffline', userId);  // Notify all clients via socket
        }

        res.cookie("jwt", "", { maxAge: 0 });
        res.redirect("/login");
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
 



module.exports = router; 