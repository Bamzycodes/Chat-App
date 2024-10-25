const express = require('express');  
const User = require('../model/user');
const protectedRoute = require('../middleware/protectedRoute');

const router = express.Router()


router.get('/', protectedRoute, async (req, res) => {
  try {
      const loggedInUserId = req.user._id;
      const data = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
      res.render('main/home', { data, selectedUser: null, messages: [] });
  } catch (error) {
      console.error("Error in getUsersForSidebar: ", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
});


  router.get('/signup', (req, res) => {
    try {
  
      res.render('main/register');
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/login', async (req, res) => {
    try {
      res.render('main/login', { });
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router; 



























// const express = require('express');  
// const User = require('../model/user');
// const protectedRoute = require('../middleware/protectedRoute');
// const Conversation = require('../model/conversation');

// const router = express.Router()


// router.get('/', protectedRoute, async (req, res) => {
// 	try {
// 		const loggedInUserId = req.user._id;
// 		const data = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
// 		res.render('main/home', { data });
// 	} catch (error) {
// 		console.error("Error in getUsersForSidebar: ", error.message);
// 		res.status(500).json({ error: "Internal server error" });
// 	}
// });

// router.get('/conversation/:id', protectedRoute, async (req, res) => {
//   try {
//       const selectedConversationId = req.params.id;
//       const conversation = await Conversation.findById(selectedConversationId).populate('messages');
      
//       if (!conversation) return res.status(404).send("Conversation not found");
      
//       res.render('main/messageContainer', { 
//           selectedConversation: conversation, 
//           messages: conversation.messages, 
//           loading: false, 
//           authUser: req.user 
//       });
//   } catch (error) {
//       console.error("Error fetching conversation: ", error.message);
//       res.status(500).send("Internal server error");
//   }
// });

//   router.get('/signup', (req, res) => {
//     try {
  
//       res.render('main/register');
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   router.get('/login', async (req, res) => {
//     try {
//       res.render('main/login', { });
//     } catch (error) {
//       console.log(error);
//     }
//   });

// module.exports = router; 