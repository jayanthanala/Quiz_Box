require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const excel = require("read-excel-file/node");
const fs = require("fs");
const axios = require("axios");
const socket = require("socket.io");
const methodOverride = require("method-override");
const User = require("./models/user.js");
const Exam = require("./models/exam.js");
const Response = require("./models/response.js");
const Question = require("./models/question.js");
const upload = require("./multer.js");
const seed = require("./seed.js");

seed();


app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//setting up the passport package and express-session package
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

//databse setup
mongoose.connect("mongodb://localhost/QuizDB",{useNewUrlParser:true,useUnifiedTopology: true,useFindAndModify:false});
mongoose.set("useCreateIndex",true);

//passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());











////////////////////////////////////////////////////////////////////   GETS    //////////////////////////////////////////////////////////////
app.get("/",(req,res)=>{
  res.render("landing");
});


app.get("/login",(req,res)=>{
  res.render("login");
});

/////////////////////////////////////////////////////  Teacher ROUTES  //////////////////////////////////

app.get("/te/register",(req,res)=>{
  res.render("teregister")
});



app.get("/te/logout",authenticatedTeacher,(req,res)=>{
  req.logout();
  res.redirect("/");
});

app.get("/te/index",authenticatedTeacher,(req,res)=>{
  res.render("teindex");
})

app.get("/te/exam/new",authenticatedTeacher,(req,res)=>{
  res.render("newexam");
});

app.get("/te/exam/staged",authenticatedTeacher,(req,res)=>{
  Exam.find({status:"staged",teacherid:req.user._id},(error,exams)=>{
    if(error) console.log(error);
    else{
      console.log(exams);
      res.render("staged",{exams:exams});
    }
  })
});

app.get("/te/exam/ready",authenticatedTeacher,(req,res)=>{
  Exam.find({teacherid:req.user._id},(error,exams)=>{
    if(error) console.log(error);
    else{

      //once studets schema gets updated ! then even pass the names!
      res.render("examready",{exams:exams});
    }
  })

});

app.get("/te/exam/:id/students",authenticatedTeacher,(req,res)=>{
  Exam.findById(req.params.id,(error,exam)=>{
    if(error) console.log(error);
    else{
      var students = exam.students;
      students.sort();
      res.render("examstudents",{students:students,id:exam._id,access:exam.access});
    }
  })
});

//in future if req , give an option for editing the title also!
app.get("/te/exam/:id/edit",authenticatedTeacher,(req,res)=>{
  Question.find({examid:req.params.id},(error,questions)=>{
    if(error) console.log(error);
    else{
      var id= req.params.id;
    Exam.findById(req.params.id,(er,exam)=>{
      console.log(exam.marks,exam.noquestions);
        res.render("editexam",{questions:questions,marks:exam.marks,qno:exam.noquestions});

    })

    }
  })
});


////this page has socket connection so no need to send anything
app.get("/te/exam/:id/responses",(req,res)=>{
  res.render("responses",{id:req.params.id});
})

/*Question.deleteMany({examid:id},(e)=>{
  if(e) console.log(e);
})*/


/////////////////////////////// Student Routes ////////////////////////////////

app.get("/st/register",(req,res)=>{
  res.render("stregister")
});

app.get("/st/logout",authenticatedStudent,(req,res)=>{
  req.logout();
  res.redirect("/");
});

app.get("/st/index",authenticatedStudent,(req,res)=>{
  Exam.find({students:req.user.username},(err,exams) => {
    if(err){console.log(err);}
    else{
      console.log(exams);
      res.render("stindex",{req:req.user,exams:exams})
    }
  });
});

app.get("/st/add/:id",authenticatedStudent,(req,res) => {
  var access = req.params.id;
  Exam.findOneAndUpdate({access:access},{$push:{students:req.user.username}},(err) => {
    if(err){console.log(err);}
    else{
      User.updateOne({username:req.user.username},{$push:{examid:access}},(err) => {
        res.redirect("/st/index");
      });
    }
  });
});

app.get("/st/exam/:id",authenticatedStudent,(req,res) => {
  Question.find({examid:req.params.id},(err,questions) => {
    if(err){console.log(err);}
    else{
      var totalMarks = 0;
      questions.forEach((question) => {
        totalMarks = totalMarks + question.marks;
      });
        var responseSheet = {
          examid:req.params.id,
          userid:req.user.username,
          marks:totalMarks
        }
      Response.create(responseSheet,(err,succ) => {
        if(err){console.log(err);}
        else{
          res.render("stexam",{questions:questions})
        }
      });
    }
  });
});

app.post("/somewhere",(req,res) => {

});

app.get("/st/completed",authenticatedStudent,(req,res) => {
  Exam.find({students:req.user.username},(err,exams) => {
    if(err){console.log(err);}
    else{
      console.log("reached");
      res.render("stcompleted",{req:req.user,exams:exams});
    }
  });
});





////////////////////////////////////////////////////////////////////   POSTS    //////////////////////////////////////////////////////////////

app.post("/login",(req,res)=>{
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("local")(req,res,()=>{
          if(req.user.role==1){
            res.redirect("/te/index");
          }else{
            res.redirect("/st/index")
          }
      })
    }
  }
)});


/////////////////////////////////////////// Teacher Routes //////////////////////

app.post("/te/register",(req,res)=>{
  User.register({username:req.body.username,role:1},req.body.password,(error,sol)=>{
    if(error) console.log(error);
    else{
      console.log(sol);

      passport.authenticate("local")(req,res,()=>{
        res.redirect("/te/index");
      });
    }
  });
});



app.post("/te/exam/new",authenticatedTeacher,(req,res)=>{
  var accessCode="";
  var questions= req.body.questions;
  var options = req.body.options;

  for(var i=1;i<=6;i++){
    accessCode+=String.fromCharCode((Math.floor(Math.random()*42))+48);
  }
  console.log(accessCode);

  var exam = {
    teacherid:req.user._id,
    access:accessCode,
    status:"staged",
    title:req.body.title,
  }
  Exam.create(exam,(error,exam)=>{
    if(error) console.log(error);
    else{
        var marks=0;
        questions.forEach((q,i)=>{
        q["options"]=options[i];
        q["examid"]=exam._id;
        marks+=Number(q["marks"]);
      });
      //TRY TO REFACTOR THIS CODE LATER TO MAKE IT MORE DRY AND FAST!!
      var noquestions = questions.length;
          Question.insertMany(questions,(e,q)=>{
            if(e) console.log(e);
            else{
              exam["marks"]=marks;
              exam["noquestions"]=noquestions;
              exam.save((er,ex)=>{
                if(er) console.log(er);
                else{
                  console.log(q);
                  res.redirect("/te/index");
                }
              })
            }
          })
    }

  })
});

//date-time local doesn't work in mozilla


//posting from the staged area setting the studentid's
app.post("/te/exam/:id/staged",authenticatedTeacher,upload.single("excel"),(req,res)=>{
    id=req.params.id;
if(req.file){
  file=req.file;
  excel(file.destination+"/"+file.filename).then(async(rows)=>{

      var students  = await new Promise((resolve,reject)=>{
        var s=[];
        var i=0;
        console.log(rows);
        //condition for checking roll number
        i=rows[0].indexOf("rollno");
        console.log(i);
        for(var i;i<=rows.length-2;i++){
          s[i]=rows[i+1][0];
        }
        console.log(file.destination+"/"+file.filename);
        fs.unlink(req.file.destination + "/" + req.file.filename,(e)=>{
          if(e) console.log(e);
        })
        resolve(s);

      });

      Exam.findById(id,(error,exam)=>{
      if(error) console.log(error);
      else{
          var array = req.body.scheduled.date.split("-");
          var time = req.body.scheduled.time.split(":");
          var date = new Date(Number(array[0]),Number(array[1])-1,Number(array[2]),Number(time[0]),Number(time[1]));
          console.log(date);
          exam.date=date;
          exam.status="ready";
          exam.duration=req.body.scheduled.duration;
          exam.students=students;
          exam.save((e,s)=>{
            if(e) console.log(e);
            else{
              console.log(s);
              addExam(s);
              res.redirect("/te/exam/ready")
            }
          })
      }
    })
  }).catch((error)=>{
    console.log(error);
  });
}else{
  Exam.findById(id,(error,exam)=>{
  if(error) console.log(error);
  else{
      var array = req.body.scheduled.date.split("-");
      var time = req.body.scheduled.time.split(":");
      var date = new Date(Number(array[0]),Number(array[1])-1,Number(array[2]),Number(time[0]),Number(time[1]));
      console.log(date);
      exam.date=date;
      exam.status="ready";
      exam.duration=req.body.scheduled.duration;
      exam.save((e,s)=>{
        if(e) console.log(e);
        else{
          console.log(s);
          addExam(s);
          res.redirect("/te/exam/ready")
        }
      })
  }
})
}
});


app.post("/te/exam/:id/students",authenticatedTeacher,(req,res)=>{
  Exam.findById(req.params.id,(error,exam)=>{
    if(error) console.log(error);
    else{
     if(exam.students.indexOf(req.body.student)){
         exam.students.push(req.body.student);
         exam.save((e,s)=>{
           if(e) console.log(e);
           else{
             console.log(s);
             res.redirect("/te/exam/"+req.params.id+"/students");
           }
         })
     }else{
       //send a flash message saying it is already present!
       res.redirect("/te/exam/"+req.params.id+"/students");
     }

    }
  })
});

//still the student schema must be changed and try to add a roll number in it and try to fetch the students using roll number only!!!
// app.post("/te/exam/:id/start",(req,res)=>{
//
//   // id=req.params.id;
//   // Exam.findById(id,(error,exam)=>{
//   //   exam.students.forEach((s)=>{
//   //       Student.findOne({username:s},(er,s)=>{
//   //         if(er) console.log(er);
//   //         else {
//   //           s.examid.push(id);
//   //           console.log(s);
//   //         }
//   //       });
//   //   });
//   //   exam.status="started";
//   //   exam.save((e,exa)=>{
//   //     if(e) console.log(e);
//   //     else {
//   //       console.log(exa);
//   //       res.send("success");
//   //     }
//   //   });
//   // });
// });

app.post("/te/exam/:id/respones",authenticatedTeacher,(req,res)=>{
  // Exam.findById(req.params.id,(error,exam)=>{
  //   if(error) console.log(error);
  //   else{
  //    if(exam.students.indexOf(req.body.student)){
  //        exam.students.push(req.body.student);
  //        exam.save((e,s)=>{
  //          if(e) console.log(e);
  //          else{
  //            console.log(s);
  //            res.redirect("/te/exam/"+req.params.id+"/students");
  //          }
  //        })
  //    }else{
  //      //send a flash message saying it is already present!
  //      res.redirect("/te/exam/"+req.params.id+"/students");
  //    }
  //
  //   }
  // })
});


/////////////////////////////////////////////////////delete routes

// app.delete("/te/exam/:id/students",(req,res)=>{
//   Exam.findById(req.params.id,(error,exam)=>{
//     if(error) console.log(error);
//     else{
//       console.log(exam.students.indexOf(req.body.student));
//      if(exam.students.indexOf(req.body.student)){
//          exam.students.pop(req.body.student);
//          exam.save((e,s)=>{
//            if(e) console.log(e);
//            else{
//              console.log(s);
//              res.redirect("/te/exam/"+req.params.id+"/students");
//            }
//          })
//      }else{
//        //send a flash message saying it is already present!
//        res.redirect("/te/exam/"+req.params.id+"/students");
//      }
//
//     }
//   })
// });

app.delete("/te/exam/:id/students",(req,res) => {
      Exam.findByIdAndUpdate(req.params.id,{$pull:{students:req.body.student}},(err) => {
        if(err){console.log(err);}
        else{
          res.redirect("/te/exam/"+req.params.id+"/students");
        }
      });
    });



/////////////////////////////////////////////patch routes
app.patch("/te/exam/:id/start",(req,res)=>{
Exam.findById(req.params.id,(e,exam)=>{
  if(e) console.log(e);
  else{
    start(exam._id);
    examStarted(exams.pop(exam));
    res.redirect("/te/exam/ready");
  }
})
})

///////////////////////////////student routes//////////////

app.post("/st/register",(req,res)=>{
  var user = {
    username:req.body.username,
    name:req.body.name,
    email:req.body.email,
    role:0
  }
  User.register(user,req.body.password,(error,sol)=>{
    if(error) console.log(error);
    else{
      passport.authenticate("local")(req,res,()=>{
        res.redirect("/st/index");
      });
    }
  });
});



///////////////////automated routes////////////////////////////////////


Exam.find({status:"ready"},(error,exam)=>{
  if(error) console.log(error);
  else{
    exam.forEach((e)=>{
      addExam(e);
    })
  }
});
Exam.find({status:"started"},(error,exam)=>{
  if(error) console.log(error);
  else{
    console.log("dasdsa",exam);
    exam.forEach((e)=>{
      examStarted(e);
    })
  }
});
examsrunning = [];
exams = [];
var stop,stop2;
function run(){
  stop=setInterval(()=>{
    for(var i=0;i<=exams.length-1;i++){
      obj = new Date();
      //console.log("/////////",exams[i].date.getTime(),obj.getTime(),exams[i].date,obj,"///////////");
      //console.log(exams[i].date.getTime()<=obj.getTime() && (exams[i].date.getDate()<=obj.getDate() && exams[i].date.getMonth()<=obj.getMonth() && exams[i].date.getYear()<=obj.getYear()));
      if(exams[i].date.getTime()<=obj.getTime()&& (exams[i].date.getDate()<=obj.getDate() && exams[i].date.getMonth()<=obj.getMonth() && exams[i].date.getYear()<=obj.getYear())){
        start(exams[i]._id);
        console.log("exam of id : "+(exams[i]._id)+" has started");
        examStarted(exams.splice(i,1)[0]);

      }
    }
    if(exams.length==0) clearInterval(stop);
  },1000);
}

function start(id){
  Exam.findById(id,(error,exam)=>{
      exam.status="started";
      //code left
      exam.save((e,exa)=>{
        if(e) console.log(e);
        else {
          console.log("success");
      }
  });
});
}
function completed(id){
  Exam.findById(id,(error,exam)=>{
      exam.status="completed";
      //code left
      exam.save((e,exa)=>{
        if(e) console.log(e);
        else {
          console.log("success");
      }
  });
});
}


// function run2(){
//
// }
//console.log(exams);
//console.log(examsrunning);
//console.log(examsrunning);
//add a functionality such that when the duration of the test stops
function checkDuration(){
  //console.log(examsrunning[0].date.getTime());
  stop2=setInterval(()=>{
    for(var i=0;i<=examsrunning.length-1;i++){
      obj = new Date();

      var mins = Number(examsrunning[i].duration)*60*1000;
  //    console.log(examsrunning[i].date.getTime()+"//////");
  //    console.log("*********",examsrunning[i].date.getTime()+mins,obj.getTime(),examsrunning[i].date,obj,"*********");
  //    console.log((examsrunning[i].date.getTime()+mins)<=obj.getTime() && (examsrunning[i].date.getDate()<=obj.getDate() && examsrunning[i].date.getMonth()<=obj.getMonth() && examsrunning[i].date.getYear()<=obj.getYear()));
      if((examsrunning[i].date.getTime()+mins)<=obj.getTime()&& (examsrunning[i].date.getDate()<=obj.getDate() && examsrunning[i].date.getMonth()<=obj.getMonth() && examsrunning[i].date.getYear()<=obj.getYear())){
        completed(examsrunning[i]._id);
        console.log("exam of exam id: "+examsrunning[i]._id+" has completed!!");
        examsrunning.splice(i,1);
      }
    }
},1000);
};


function examStarted(exam){
  clearInterval(stop2);
  console.log("dsdfd",exam);
  if(exam){
    examsrunning.push(exam);
    checkDuration();
  }
}

function addExam(exam){
  clearInterval(stop);
  if(exam.date)   exams.push(exam);
  console.log(exams);
  run();

}



////////////////////////////////////////////////////////////////////   Middle Ware    //////////////////////////////////////////////////////////


function authenticatedTeacher(req,res,next){
  if(req.isAuthenticated() && req.user.role==1) {
      next();
  }
  else{
    res.redirect('/');
  }
}

function authenticatedStudent(req,res,next){
  if(req.isAuthenticated() && req.user.role==0) {
    next();
  }
  else{
    res.redirect('/');
  }
}
/////////////////////////////////////////////////////////////server/////////////////////////////////////////////
server = app.listen(3000,() => {
  console.log("Server is up on port 3000");
});

////////////////////////////////////////////////////socket programming//////////////////////////////
const io = socket(server);

io.on("connection",(socket)=>{
  console.log("connected");
  socket.on("sendResponses",(id)=>{
    console.log("asked for responses");
    Exam.findById(id,(err,exam)=>{
      if(err) console.log(err);
      else{
        if(exam.status=="started"){
          Response.find({examid:id},(e,s)=>{
            if(e) console.log(e);
            else{
              Question.find({examid:id},(er,so)=>{
                if(er) console.log(er);
                else{
                  socket.emit("responses",{
                    responses:s,
                    questions:so
                  });
                }
              })
            }
          })
        }else{
          socket.emit("final","examclosed");
        }
      }
    })
  });

})
