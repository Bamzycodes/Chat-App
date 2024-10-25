const dotenv = require('dotenv');  
const express = require('express');  
const mongoose = require('mongoose');  
const cors = require('cors');  
const cookieParser = require('cookie-parser');  
const expressLayout = require('express-ejs-layouts');  
const bodyParser = require('body-parser');  
const main = require('./routes/main'); // Require your routes  
const message = require('./routes/message');  
const auth = require('./routes/auth');  
const { app, server } = require('./socket/socket')
const methodOverride = require('method-override');  
const path = require('path');  
 
dotenv.config();  

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.json());  
app.use(cookieParser());  
app.use(cors());   
app.use(methodOverride('_method'));  

// Templating Engine  
app.use(expressLayout);  
app.set('layout', './layout/main');  
app.set('view engine', 'ejs');  
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views'));  

// Use your routes  
app.use('/', main);  
app.use('/', message);  
app.use('/auth', auth);  

const PORT = process.env.PORT

// Connect to MongoDB  
const URI = process.env.MONGODB_URL;  
mongoose.connect(URI, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true  
})  
  .then(() => {  
    console.log('Connected to DB');  
  })  
  .catch((err) => {  
    console.error(err.message);  
  });  

server.listen(PORT, () => {  
    console.log(`App is listening on ${PORT}`);  
});