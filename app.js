require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/QuizDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);


////////////////////////////////////////////////////////////////////   GETS    //////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////   POSTS    //////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////   Middle Ware    //////////////////////////////////////////////////////////


function authenticated(req,res,next){
  if(req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/');
    }
}

app.listen(3000,() => {
  console.log("Server is up on port 3000");
})
