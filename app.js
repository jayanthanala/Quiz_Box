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
const Teacher = require("./models/teacher.js");
const Student = require("./models/student.js");
const Exam = require("./models/exam.js");
const Response = require("./models/response.js");
const Question = require("./models/question.js");
const upload = require("./multer.js");


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

app.get("/te/exam/new",authenticated,(req,res)=>{
  res.render("newexam");
});

app.get("/te/exam/staged",(req,res)=>{
  Exam.find({status:"staged",teacherid:req.user._id},(error,exams)=>{
    if(error) console.log(error);
    else{
      console.log(exams);
      res.render("staged",{exams:exams});
    }
  })

});

app.get("/te/exam/ready",(req,res)=>{
  Exam.find({status:"ready",teacherid:req.user._id},(error,exams)=>{
    if(error) console.log(error);
    else{

      //once studets schema gets updated ! then even pass the names!
      res.render("examready",{exams:exams});
    }
  })

});

app.get("/te/exam/:id/students",(req,res)=>{
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
app.get("/te/exam/:id/edit",(req,res)=>{
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
})

/*Question.deleteMany({examid:id},(e)=>{
  if(e) console.log(e);
})*/


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
)});

app.post("/te/exam/new",(req,res)=>{
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
app.post("/te/exam/:id/staged",upload.single("excel"),(req,res)=>{
  file=req.file;
  console.log(req.file);
    id=req.params.id;
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
});


app.post("/te/exam/:id/students",(req,res)=>{
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
app.post("/te/exam/:id/start",(req,res)=>{
  // id=req.params.id;
  // Exam.findById(id,(error,exam)=>{
  //   exam.students.forEach((s)=>{
  //       Student.findOne({username:s},(er,s)=>{
  //         if(er) console.log(er);
  //         else {
  //           s.examid.push(id);
  //           console.log(s);
  //         }
  //       });
  //   });
  //   exam.status="started";
  //   exam.save((e,exa)=>{
  //     if(e) console.log(e);
  //     else {
  //       console.log(exa);
  //       res.send("success");
  //     }
  //   });
  // });
})







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



///////////////////automated routes////////////////////////////////////


Exam.find({},(error,exam)=>{
  if(error) console.log(error);
  else{
    exam.forEach((e)=>{
      addExam(e);
    })
  }
});

exams = [];
var stop;
function run(){
  stop=setInterval(()=>{
    for(var i=0;i<=exams.length-1;i++){
      obj = new Date();
      console.log("/////////",exams[i].date.getTime(),obj.getTime(),exams[i].date,obj,"///////////");
      console.log(exams[i].date.getTime()<=obj.getTime() && (exams[i].date.getDate()<=obj.getDate() && exams[i].date.getMonth()<=obj.getMonth() && exams[i].date.getYear()<=obj.getYear()));
      if(exams[i].date.getTime()<=obj.getTime()&& (exams[i].date.getDate()<=obj.getDate() && exams[i].date.getMonth()<=obj.getMonth() && exams[i].date.getYear()<=obj.getYear())){
        var a= axios.post("http://localhost:3000/te/exam/"+exams[i]._id+"/start");
        exams.splice(i,1);
      }
    }
  },1000);
}

function addExam(exam){
  clearInterval(stop);
  if(exam.date)   exams.push(exam);
  console.log(exams);
  run();

}



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
