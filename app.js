require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const Teacher = require("./models/teacher.js");
const Student = require("./models/student.js");
const Exam = require("./models/exam.js");
const Response = require("./models/response.js");
const Question = require("./models/question.js");

app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

//setting up the passport package and express-session package
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

//databse setup
mongoose.connect("mongodb://localhost/QuizDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

//passportforteacher
passport.use("teacherLocal",Teacher.createStrategy());
passport.serializeUser(Teacher.serializeUser());
passport.deserializeUser(Teacher.deserializeUser());

//passportforstudent
passport.use("studentLocal",Student.createStrategy());
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());



////////////////////////////////////////////////////////////////////   GETS    //////////////////////////////////////////////////////////////
app.get("/",(req,res)=>{
  res.render("landing");
});

///////////////////////////////////////////teacher routes//////////////////////////////////

app.get("/te/register",(req,res)=>{
  res.render("teregister")
});

app.get("/te/login",(req,res)=>{
  res.render("telogin");
});

app.get("/te/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

app.get("/te/index",authenticated,(req,res)=>{
  res.render("teindex");
})

app.get("/te/newexam",authenticated,(req,res)=>{
  res.render("newexam")
})



///////////////////////////////student routes////////////////////////////////

app.get("/st/register",(req,res)=>{
  res.render("stregister")
});

app.get("/st/login",(req,res)=>{
  res.render("stlogin");
});

app.get("/st/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
})



////////////////////////////////////////////////////////////////////   POSTS    //////////////////////////////////////////////////////////////

///////////////////////////////////////////teacher routes/////////

app.post("/te/register",(req,res)=>{
  Teacher.register({username:req.body.username},req.body.password,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("teacherLocal")(req,res,()=>{
        res.redirect("/te/index");
      });
    }
  });
});

app.post("/te/login",(req,res)=>{
  const user = new Teacher({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("teacherLocal")(req,res,()=>{
          res.redirect("/te/index");
      })
    }
  }

  )
});







///////////////////////////////student routes//////////////

app.post("/st/register",(req,res)=>{
  Student.register({username:req.body.username},req.body.password,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("studentLocal")(req,res,()=>{
        res.send("<h1>UNLOCKED FOR STUDENT</h1>");
      });
    }
  });
});

app.post("/st/login",(req,res)=>{
  const user = new Student({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("studentLocal")(req,res,()=>{
          res.send("<h1>UNLOCKED FOR STUDENT through login</h1>");
      })
    }
  })

});






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
