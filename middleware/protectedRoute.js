// import jwt from "jsonwebtoken";  

// const protectedRoute = (req, res, next) => {  
//     const authorization = req.headers.authorization;  
//     if (!authorization) {  
//         return res.status(401).send({ message: 'No Token provided' });  
//     }  

//     const token = authorization.slice(7, authorization.length);  
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {  
//         if (err) {  
//             return res.status(401).send({ message: 'Invalid Token' });  
//         }  
        
//         req.user = decoded;  
//         next();  
//     });  
// };  

// export default protectedRoute;


const jwt = require("jsonwebtoken"); 
const User = require("../model/user");

const protectedRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.redirect("/login")
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.redirect("/login");
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = protectedRoute; 